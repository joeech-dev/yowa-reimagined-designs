
-- Drop overly permissive policies
DROP POLICY "Authenticated users can view invoices" ON public.invoices;
DROP POLICY "Finance/admin can create invoices" ON public.invoices;
DROP POLICY "Finance/admin can update invoices" ON public.invoices;
DROP POLICY "Finance/admin can delete invoices" ON public.invoices;

-- Create proper role-based policies
CREATE POLICY "Finance and admins can manage invoices"
  ON public.invoices FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
