ALTER VIEW public.blog_comments_public SET (security_invoker = true);

CREATE POLICY "Approved comments readable for view"
ON public.blog_comments FOR SELECT TO anon, authenticated
USING (status = 'approved');

-- column-level: no email access for public roles
REVOKE SELECT ON public.blog_comments FROM anon, authenticated;
GRANT SELECT (id, blog_post_id, author_name, content, created_at, status) ON public.blog_comments TO anon, authenticated;