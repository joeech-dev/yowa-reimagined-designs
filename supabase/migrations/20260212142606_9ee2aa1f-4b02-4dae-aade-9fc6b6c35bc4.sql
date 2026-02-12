
-- Drop all existing restrictive policies on tasks
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks they created or collaborate on" ON public.tasks;
DROP POLICY IF EXISTS "Creator can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Creator can delete tasks" ON public.tasks;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can view tasks they created or collaborate on" ON public.tasks FOR SELECT USING (
  auth.uid() = created_by OR EXISTS (
    SELECT 1 FROM task_collaborators WHERE task_collaborators.task_id = tasks.id AND task_collaborators.user_id = auth.uid()
  )
);
CREATE POLICY "Creator can update tasks" ON public.tasks FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creator can delete tasks" ON public.tasks FOR DELETE USING (auth.uid() = created_by);

-- Drop all existing restrictive policies on task_collaborators
DROP POLICY IF EXISTS "Task creator can add collaborators" ON public.task_collaborators;
DROP POLICY IF EXISTS "Creator and collaborators can view collaborators" ON public.task_collaborators;
DROP POLICY IF EXISTS "Collaborators can update their own read status" ON public.task_collaborators;
DROP POLICY IF EXISTS "Task creator can remove collaborators" ON public.task_collaborators;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Task creator can add collaborators" ON public.task_collaborators FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_collaborators.task_id AND tasks.created_by = auth.uid())
);
CREATE POLICY "Creator and collaborators can view collaborators" ON public.task_collaborators FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_collaborators.task_id AND tasks.created_by = auth.uid())
);
CREATE POLICY "Collaborators can update their own read status" ON public.task_collaborators FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Task creator can remove collaborators" ON public.task_collaborators FOR DELETE USING (
  EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_collaborators.task_id AND tasks.created_by = auth.uid())
);
