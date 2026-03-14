
-- Add submitted_by columns to leads table
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS submitted_by_id uuid,
  ADD COLUMN IF NOT EXISTS submitted_by_name text;

-- Drop old restrictive lead policies
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Finance can view leads" ON public.leads;
DROP POLICY IF EXISTS "Sales can view leads" ON public.leads;
DROP POLICY IF EXISTS "Sales can update leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can submit lead form" ON public.leads;

-- All authenticated users can insert leads (captures who submitted)
CREATE POLICY "All authenticated users can insert leads"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- All authenticated users can view all leads
CREATE POLICY "All authenticated users can view leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can update leads
CREATE POLICY "All authenticated users can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (true);

-- Only admins and super_admins can delete leads
CREATE POLICY "Admins can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Keep the anonymous insert for public-facing lead forms
CREATE POLICY "Public can submit lead form"
  ON public.leads FOR INSERT
  TO anon
  WITH CHECK (true);
