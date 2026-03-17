
-- Fix 1: Leads table — restrict read/update to specific roles only (sales, admin, super_admin)
-- Remove the overly permissive policies that allow ALL authenticated users
DROP POLICY IF EXISTS "All authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "All authenticated users can update leads" ON public.leads;

-- Replacement: role-restricted select
CREATE POLICY "Authorised roles can view leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'sales_marketing'::app_role)
    OR has_role(auth.uid(), 'finance'::app_role)
    OR has_role(auth.uid(), 'project_team'::app_role)
    OR auth.uid() = submitted_by_id
  );

-- Replacement: role-restricted update
CREATE POLICY "Authorised roles can update leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'sales_marketing'::app_role)
    OR has_role(auth.uid(), 'finance'::app_role)
  );

-- Fix 2: Notifications INSERT — enforce user_id = auth.uid()
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert own notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
