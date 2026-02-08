
-- Follow-up sequences (e.g., "Welcome Sequence", "Re-engagement Sequence")
CREATE TABLE public.followup_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_assign_new_leads BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Steps within a sequence (Day 1: tag-welcome, Day 3: tag-followup, etc.)
CREATE TABLE public.sequence_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL REFERENCES public.followup_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL DEFAULT 1,
  delay_days INTEGER NOT NULL DEFAULT 0,
  tag_name TEXT NOT NULL,
  email_subject TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tracks which lead is on which sequence and their progress
CREATE TABLE public.lead_sequence_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES public.followup_sequences(id) ON DELETE CASCADE,
  current_step_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_step_executed_at TIMESTAMP WITH TIME ZONE,
  next_step_due_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(lead_id, sequence_id)
);

-- Enable RLS
ALTER TABLE public.followup_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_sequence_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies: admin/sales_marketing/super_admin can manage
CREATE POLICY "Admins can manage sequences" ON public.followup_sequences
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'sales_marketing')
  );

CREATE POLICY "Admins can manage sequence steps" ON public.sequence_steps
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'sales_marketing')
  );

CREATE POLICY "Admins can manage lead assignments" ON public.lead_sequence_assignments
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'sales_marketing')
  );

-- Trigger for updated_at on sequences
CREATE TRIGGER update_followup_sequences_updated_at
  BEFORE UPDATE ON public.followup_sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-assign new leads to active sequences with auto_assign_new_leads = true
CREATE OR REPLACE FUNCTION public.auto_assign_sequence_to_new_lead()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.lead_sequence_assignments (lead_id, sequence_id, next_step_due_at)
  SELECT NEW.id, fs.id, NOW()
  FROM public.followup_sequences fs
  WHERE fs.is_active = true AND fs.auto_assign_new_leads = true;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_assign_sequence_on_new_lead
  AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_sequence_to_new_lead();
