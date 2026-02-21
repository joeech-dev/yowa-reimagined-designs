
-- Fix portfolio_projects: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can view active portfolio projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Admins can manage portfolio projects" ON public.portfolio_projects;

CREATE POLICY "Anyone can view active portfolio projects"
ON public.portfolio_projects FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage portfolio projects"
ON public.portfolio_projects FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Fix blog_posts: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can read blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Sales marketing can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Sales marketing can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Sales marketing can view blog posts" ON public.blog_posts;

CREATE POLICY "Anyone can read blog posts"
ON public.blog_posts FOR SELECT
USING (true);

CREATE POLICY "Admins can insert blog posts"
ON public.blog_posts FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can update blog posts"
ON public.blog_posts FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Sales marketing can insert blog posts"
ON public.blog_posts FOR INSERT
WITH CHECK (has_role(auth.uid(), 'sales_marketing'::app_role));

CREATE POLICY "Sales marketing can update blog posts"
ON public.blog_posts FOR UPDATE
USING (has_role(auth.uid(), 'sales_marketing'::app_role));

-- Also drop the unique constraint on source_url since it causes collisions
ALTER TABLE public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_source_url_key;
