
-- Fix 1: Add database constraints for blog_posts input validation
ALTER TABLE public.blog_posts
  ADD CONSTRAINT title_max_length CHECK (char_length(title) <= 500),
  ADD CONSTRAINT excerpt_max_length CHECK (excerpt IS NULL OR char_length(excerpt) <= 1000),
  ADD CONSTRAINT content_max_length CHECK (content IS NULL OR char_length(content) <= 100000),
  ADD CONSTRAINT valid_source_url CHECK (source_url ~ '^https?://'),
  ADD CONSTRAINT valid_image_url CHECK (image IS NULL OR image ~ '^https?://'),
  ADD CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$' AND char_length(slug) <= 200);

-- Fix 2: Restrict blog-images storage policies to admin/sales roles
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;

CREATE POLICY "Admins and sales can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND 
  (public.has_role(auth.uid(), 'admin'::app_role) OR 
   public.has_role(auth.uid(), 'super_admin'::app_role) OR
   public.has_role(auth.uid(), 'sales_marketing'::app_role))
);

CREATE POLICY "Admins and sales can update blog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' AND 
  (public.has_role(auth.uid(), 'admin'::app_role) OR 
   public.has_role(auth.uid(), 'super_admin'::app_role) OR
   public.has_role(auth.uid(), 'sales_marketing'::app_role))
);

CREATE POLICY "Admins and sales can delete blog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' AND 
  (public.has_role(auth.uid(), 'admin'::app_role) OR 
   public.has_role(auth.uid(), 'super_admin'::app_role) OR
   public.has_role(auth.uid(), 'sales_marketing'::app_role))
);

-- Fix 3: Replace overly permissive blog_posts service role policies
DROP POLICY IF EXISTS "Service role can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Service role can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Service role can delete blog posts" ON public.blog_posts;

CREATE POLICY "Admins can insert blog posts"
ON public.blog_posts FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can update blog posts"
ON public.blog_posts FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'super_admin'::app_role)
);
