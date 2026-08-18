CREATE OR REPLACE FUNCTION public.get_blog_comments_admin()
RETURNS TABLE (
  id uuid,
  blog_post_id uuid,
  author_name text,
  author_email text,
  content text,
  status text,
  rejection_reason text,
  moderated_by uuid,
  moderated_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (has_role(auth.uid(), 'admin'::app_role)
       OR has_role(auth.uid(), 'super_admin'::app_role)
       OR has_role(auth.uid(), 'sales_marketing'::app_role)) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT c.id, c.blog_post_id, c.author_name, c.author_email, c.content,
         c.status, c.rejection_reason, c.moderated_by, c.moderated_at,
         c.created_at, c.updated_at
  FROM public.blog_comments c
  ORDER BY c.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_blog_comments_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_blog_comments_admin() TO authenticated, service_role;