
-- Allow public to view projects that are completed and toggled on
CREATE POLICY "Anyone can view featured projects"
ON public.projects
FOR SELECT
USING (show_on_website = true AND status = 'completed');

-- Update admin policy to include super_admin
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
CREATE POLICY "Admins can manage projects"
ON public.projects
FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

-- Finance role: manage finance, view projects/leads
DROP POLICY IF EXISTS "Admins can manage finance transactions" ON public.finance_transactions;
CREATE POLICY "Finance and admins can manage finance"
ON public.finance_transactions
FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin') OR 
  has_role(auth.uid(), 'finance')
);

CREATE POLICY "Finance can view projects"
ON public.projects
FOR SELECT
USING (has_role(auth.uid(), 'finance'));

CREATE POLICY "Finance can view leads"
ON public.leads
FOR SELECT
USING (has_role(auth.uid(), 'finance'));

-- Project team: view projects and team members
CREATE POLICY "Project team can view projects"
ON public.projects
FOR SELECT
USING (has_role(auth.uid(), 'project_team'));

CREATE POLICY "Project team can view team members"
ON public.project_team_members
FOR SELECT
USING (has_role(auth.uid(), 'project_team'));

-- Sales & Marketing: view projects and manage leads
CREATE POLICY "Sales can view projects"
ON public.projects
FOR SELECT
USING (has_role(auth.uid(), 'sales_marketing'));

CREATE POLICY "Sales can view leads"
ON public.leads
FOR SELECT
USING (has_role(auth.uid(), 'sales_marketing'));

CREATE POLICY "Sales can update leads"
ON public.leads
FOR UPDATE
USING (has_role(auth.uid(), 'sales_marketing'));

-- Super admin gets all access on remaining tables
DROP POLICY IF EXISTS "Admins can manage partner brands" ON public.partner_brands;
CREATE POLICY "Admins can manage partner brands"
ON public.partner_brands
FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "Admins can manage project team members" ON public.project_team_members;
CREATE POLICY "Admins can manage project team members"
ON public.project_team_members
FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "Admins can view user roles" ON public.user_roles;
CREATE POLICY "Admins and super admins can view user roles"
ON public.user_roles
FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);
