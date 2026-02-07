
-- Create security definer function to check conversation membership
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = _conversation_id AND user_id = _user_id
  )
$$;

-- Drop the recursive policies
DROP POLICY IF EXISTS "Users can view participants of own conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversation" ON public.conversations;
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view participants of own conversations"
ON public.conversation_participants FOR SELECT TO authenticated
USING (public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "Users can view own conversations"
ON public.conversations FOR SELECT TO authenticated
USING (public.is_conversation_participant(id, auth.uid()));

CREATE POLICY "Participants can update conversation"
ON public.conversations FOR UPDATE TO authenticated
USING (public.is_conversation_participant(id, auth.uid()));

CREATE POLICY "Participants can view messages"
ON public.messages FOR SELECT TO authenticated
USING (public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "Participants can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_id AND public.is_conversation_participant(conversation_id, auth.uid()));
