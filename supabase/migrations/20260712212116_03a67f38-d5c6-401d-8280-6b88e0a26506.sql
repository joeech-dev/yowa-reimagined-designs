
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  visitor_name text,
  visitor_email text,
  visitor_phone text,
  service_interest text,
  lead_captured boolean NOT NULL DEFAULT false,
  lead_id uuid,
  message_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_conversations_session ON public.chat_conversations(session_id);
CREATE INDEX idx_chat_conversations_created ON public.chat_conversations(created_at DESC);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_messages_conv ON public.chat_messages(conversation_id, created_at);

GRANT SELECT ON public.chat_conversations TO authenticated;
GRANT ALL ON public.chat_conversations TO service_role;
GRANT SELECT ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read chat conversations" ON public.chat_conversations
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'sales_marketing')
  );

CREATE POLICY "Staff can read chat messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'sales_marketing')
  );

CREATE TRIGGER trg_chat_conversations_updated
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
