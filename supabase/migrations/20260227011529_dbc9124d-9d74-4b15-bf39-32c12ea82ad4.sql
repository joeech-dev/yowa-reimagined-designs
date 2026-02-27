-- Task checklist items table for interactive task features
CREATE TABLE IF NOT EXISTS public.task_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_by UUID NULL,
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.task_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task participants can view checklist items"
ON public.task_checklist_items FOR SELECT
USING (is_task_creator(task_id, auth.uid()) OR is_task_collaborator(task_id, auth.uid()));

CREATE POLICY "Task participants can insert checklist items"
ON public.task_checklist_items FOR INSERT
WITH CHECK (auth.uid() = created_by AND (is_task_creator(task_id, auth.uid()) OR is_task_collaborator(task_id, auth.uid())));

CREATE POLICY "Task participants can update checklist items"
ON public.task_checklist_items FOR UPDATE
USING (is_task_creator(task_id, auth.uid()) OR is_task_collaborator(task_id, auth.uid()));

CREATE POLICY "Task creator can delete checklist items"
ON public.task_checklist_items FOR DELETE
USING (is_task_creator(task_id, auth.uid()));

-- Task attachments table
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NULL,
  file_size INTEGER NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task participants can view attachments"
ON public.task_attachments FOR SELECT
USING (is_task_creator(task_id, auth.uid()) OR is_task_collaborator(task_id, auth.uid()));

CREATE POLICY "Task participants can upload attachments"
ON public.task_attachments FOR INSERT
WITH CHECK (auth.uid() = uploaded_by AND (is_task_creator(task_id, auth.uid()) OR is_task_collaborator(task_id, auth.uid())));

CREATE POLICY "Uploader can delete own attachments"
ON public.task_attachments FOR DELETE
USING (auth.uid() = uploaded_by);
