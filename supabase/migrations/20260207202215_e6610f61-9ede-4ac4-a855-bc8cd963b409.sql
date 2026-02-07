
-- Expense Requisitions table with tiered approval workflow
CREATE TABLE public.expense_requisitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  status TEXT NOT NULL DEFAULT 'pending',
  finance_approved_by UUID,
  finance_approved_at TIMESTAMPTZ,
  super_admin_approved_by UUID,
  super_admin_approved_at TIMESTAMPTZ,
  rejected_by UUID,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.expense_requisitions ENABLE ROW LEVEL SECURITY;

-- All authenticated dashboard users can submit requisitions
CREATE POLICY "Authenticated users can create requisitions"
ON public.expense_requisitions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requester_id);

-- Users can view their own requisitions
CREATE POLICY "Users can view own requisitions"
ON public.expense_requisitions FOR SELECT
TO authenticated
USING (auth.uid() = requester_id);

-- Finance/admins can view all requisitions
CREATE POLICY "Finance and admins can view all requisitions"
ON public.expense_requisitions FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'finance'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Finance can approve/reject (update) requisitions
CREATE POLICY "Finance can update requisitions"
ON public.expense_requisitions FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'finance'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Trigger for updated_at
CREATE TRIGGER update_expense_requisitions_updated_at
BEFORE UPDATE ON public.expense_requisitions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Online presence tracking for dashboard users
CREATE TABLE public.user_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  display_name TEXT,
  role TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_online BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view presence
CREATE POLICY "Authenticated users can view presence"
ON public.user_presence FOR SELECT
TO authenticated
USING (true);

-- Users can upsert their own presence
CREATE POLICY "Users can upsert own presence"
ON public.user_presence FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presence"
ON public.user_presence FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for presence
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
