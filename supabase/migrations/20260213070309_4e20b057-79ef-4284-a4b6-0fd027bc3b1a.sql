
-- Add new columns to tasks table
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS task_type text NOT NULL DEFAULT 'operational',
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS task_owner uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS estimated_hours numeric,
  ADD COLUMN IF NOT EXISTS actual_hours numeric,
  ADD COLUMN IF NOT EXISTS recurring boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurring_type text,
  ADD COLUMN IF NOT EXISTS reminder_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_time timestamptz;

-- Update existing status values to new format
UPDATE public.tasks SET status = 'todo' WHERE status = 'pending';

-- Set task_owner = created_by for existing tasks
UPDATE public.tasks SET task_owner = created_by;

-- Add check constraint for task_type
ALTER TABLE public.tasks ADD CONSTRAINT tasks_task_type_check CHECK (task_type IN ('project', 'operational'));

-- Add check constraint for priority (add urgent)
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;

-- Add check constraint for status
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'blocked', 'completed'));

-- Add check constraint for recurring_type
ALTER TABLE public.tasks ADD CONSTRAINT tasks_recurring_type_check CHECK (recurring_type IS NULL OR recurring_type IN ('daily', 'weekly', 'monthly', 'custom'));

-- Create task_status_history table
CREATE TABLE public.task_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.task_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task participants can view status history" ON public.task_status_history
  FOR SELECT USING (
    is_task_creator(task_id, auth.uid()) OR is_task_collaborator(task_id, auth.uid())
  );

CREATE POLICY "Authenticated users can insert status history" ON public.task_status_history
  FOR INSERT WITH CHECK (auth.uid() = changed_by);

-- Create task_comments table
CREATE TABLE public.task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task participants can view comments" ON public.task_comments
  FOR SELECT USING (
    is_task_creator(task_id, auth.uid()) OR is_task_collaborator(task_id, auth.uid())
  );

CREATE POLICY "Task participants can add comments" ON public.task_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (is_task_creator(task_id, auth.uid()) OR is_task_collaborator(task_id, auth.uid()))
  );

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'task',
  reference_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_status_history;

-- Update task_collaborators to also check task_owner
-- We need to update is_task_collaborator to also check task_owner
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
  ) OR EXISTS (
    SELECT 1 FROM public.tasks
    WHERE id = _task_id AND task_owner = _user_id
  )
$$;

-- Update tasks SELECT policy to include task_owner
DROP POLICY IF EXISTS "Users can view tasks they created or collaborate on" ON public.tasks;
CREATE POLICY "Users can view tasks they created or collaborate on" ON public.tasks
  FOR SELECT USING (
    auth.uid() = created_by OR auth.uid() = task_owner OR is_task_collaborator(id, auth.uid())
  );

-- Allow task_owner to update tasks too
DROP POLICY IF EXISTS "Creator can update tasks" ON public.tasks;
CREATE POLICY "Creator or owner can update tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = task_owner);

-- Admins should be able to see all tasks
CREATE POLICY "Admins can view all tasks" ON public.tasks
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)
  );
