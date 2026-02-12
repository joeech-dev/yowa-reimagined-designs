
-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date DATE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task collaborators table
CREATE TABLE public.task_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_collaborators ENABLE ROW LEVEL SECURITY;

-- Tasks policies: creator and collaborators can view
CREATE POLICY "Users can view tasks they created or collaborate on"
  ON public.tasks FOR SELECT
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.task_collaborators
      WHERE task_collaborators.task_id = tasks.id
      AND task_collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = created_by);

-- Task collaborators policies
CREATE POLICY "Creator and collaborators can view collaborators"
  ON public.task_collaborators FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_collaborators.task_id
      AND tasks.created_by = auth.uid()
    )
  );

CREATE POLICY "Task creator can add collaborators"
  ON public.task_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_collaborators.task_id
      AND tasks.created_by = auth.uid()
    )
  );

CREATE POLICY "Task creator can remove collaborators"
  ON public.task_collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_collaborators.task_id
      AND tasks.created_by = auth.uid()
    )
  );

CREATE POLICY "Collaborators can update their own read status"
  ON public.task_collaborators FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_collaborators;
