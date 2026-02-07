-- Allow sales_marketing to view and edit blog posts
CREATE POLICY "Sales marketing can view blog posts"
ON public.blog_posts
FOR SELECT
USING (has_role(auth.uid(), 'sales_marketing'::app_role));

CREATE POLICY "Sales marketing can update blog posts"
ON public.blog_posts
FOR UPDATE
USING (has_role(auth.uid(), 'sales_marketing'::app_role));

CREATE POLICY "Sales marketing can insert blog posts"
ON public.blog_posts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'sales_marketing'::app_role));
