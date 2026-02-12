
-- Create security definer function to check task creator without triggering RLS
CREATE OR REPLACE FUNCTION public.is_task_creator(_task_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tasks
    WHERE id = _task_id AND created_by = _user_id
  )
$$;

-- Create security definer function to check task collaborator
CREATE OR REPLACE FUNCTION public.is_task_collaborator(_task_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.task_collaborators
    WHERE task_id = _task_id AND user_id = _user_id
  )
$$;

-- Recreate tasks policies using security definer functions
DROP POLICY IF EXISTS "Users can view tasks they created or collaborate on" ON public.tasks;
CREATE POLICY "Users can view tasks they created or collaborate on" ON public.tasks
  FOR SELECT USING (
    auth.uid() = created_by OR is_task_collaborator(id, auth.uid())
  );

-- Recreate task_collaborators policies using security definer functions
DROP POLICY IF EXISTS "Task creator can add collaborators" ON public.task_collaborators;
CREATE POLICY "Task creator can add collaborators" ON public.task_collaborators
  FOR INSERT WITH CHECK (is_task_creator(task_id, auth.uid()));

DROP POLICY IF EXISTS "Creator and collaborators can view collaborators" ON public.task_collaborators;
CREATE POLICY "Creator and collaborators can view collaborators" ON public.task_collaborators
  FOR SELECT USING (auth.uid() = user_id OR is_task_creator(task_id, auth.uid()));

DROP POLICY IF EXISTS "Task creator can remove collaborators" ON public.task_collaborators;
CREATE POLICY "Task creator can remove collaborators" ON public.task_collaborators
  FOR DELETE USING (is_task_creator(task_id, auth.uid()));
