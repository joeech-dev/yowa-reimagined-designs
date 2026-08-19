-- 1. Marketing consent + Resend contact linkage on leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_opt_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS resend_contact_id text,
  ADD COLUMN IF NOT EXISTS email_status text NOT NULL DEFAULT 'ok';

-- 2. Outreach log gains provider correlation so webhook events can attach
ALTER TABLE public.outreach_log
  ADD COLUMN IF NOT EXISTS provider_message_id text,
  ADD COLUMN IF NOT EXISTS subject text;

CREATE INDEX IF NOT EXISTS outreach_log_provider_message_id_idx
  ON public.outreach_log (provider_message_id);

-- 3. Email engagement events from Resend webhooks
CREATE TABLE IF NOT EXISTS public.email_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_message_id text,
  event_type text NOT NULL,
  recipient_email text NOT NULL,
  subject text,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS email_events_dedupe_idx
  ON public.email_events (provider_message_id, event_type, occurred_at);
CREATE INDEX IF NOT EXISTS email_events_recipient_idx ON public.email_events (recipient_email);
CREATE INDEX IF NOT EXISTS email_events_lead_idx ON public.email_events (lead_id);

GRANT SELECT ON public.email_events TO authenticated;
GRANT ALL ON public.email_events TO service_role;

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view email engagement events"
  ON public.email_events FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'sales_marketing'::app_role)
  );