
-- Fix notifications insert policy to only allow authenticated users
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
