-- Fix finance_transactions RLS to explicitly include WITH CHECK for INSERT
DROP POLICY IF EXISTS "Finance and admins can manage finance" ON public.finance_transactions;

CREATE POLICY "Finance and admins can manage finance"
ON public.finance_transactions
FOR ALL
TO public
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'finance'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'finance'::app_role)
);