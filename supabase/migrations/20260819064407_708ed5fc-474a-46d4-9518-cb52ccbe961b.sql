CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New conversation',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_conversations TO authenticated;
GRANT ALL ON public.ai_conversations TO service_role;

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own AI conversations"
ON public.ai_conversations FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ai_conversations_user_updated ON public.ai_conversations (user_id, updated_at DESC);
CREATE INDEX idx_ai_conversations_created ON public.ai_conversations (created_at);

CREATE TRIGGER update_ai_conversations_updated_at
BEFORE UPDATE ON public.ai_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.purge_old_ai_conversations()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.ai_conversations WHERE created_at < now() - INTERVAL '90 days';
$$;

REVOKE ALL ON FUNCTION public.purge_old_ai_conversations() FROM PUBLIC, anon, authenticated;

SELECT cron.schedule(
  'purge-old-ai-conversations',
  '15 3 * * *',
  $$SELECT public.purge_old_ai_conversations();$$
);