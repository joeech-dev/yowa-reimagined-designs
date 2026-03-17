
-- Fix 3: project_team_members — restrict project_team role to see only members of their own projects
DROP POLICY IF EXISTS "Project team can view team members" ON public.project_team_members;

CREATE POLICY "Project team can view members of their projects"
  ON public.project_team_members
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      has_role(auth.uid(), 'project_team'::app_role)
      AND EXISTS (
        SELECT 1 FROM public.project_team_members ptm2
        WHERE ptm2.project_id = project_team_members.project_id
          AND ptm2.email = (
            SELECT email FROM auth.users WHERE id = auth.uid() LIMIT 1
          )
      )
    )
  );
