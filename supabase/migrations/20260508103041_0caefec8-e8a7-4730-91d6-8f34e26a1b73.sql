
-- 1. blog_comments: remove public SELECT exposing author_email; add safe public view
DROP POLICY IF EXISTS "Public can view approved comments" ON public.blog_comments;

CREATE OR REPLACE VIEW public.blog_comments_public
WITH (security_invoker = true) AS
SELECT id, blog_post_id, author_name, content, created_at
FROM public.blog_comments
WHERE status = 'approved';

GRANT SELECT ON public.blog_comments_public TO anon, authenticated;

-- Re-add a SELECT policy on the underlying table that only returns approved rows
-- to anon/authenticated, but the view is the recommended path. We keep this so the
-- view (security_invoker) can still read approved rows for any caller.
CREATE POLICY "Approved comments readable for view"
ON public.blog_comments
FOR SELECT
TO anon, authenticated
USING (status = 'approved');

-- Note: the above still technically allows column selection of author_email through
-- the table. Revoke column-level access for anon to author_email.
REVOKE SELECT (author_email) ON public.blog_comments FROM anon;

-- 2. projects: stop exposing client_email/client_phone to anon
DROP POLICY IF EXISTS "Anyone can view featured projects" ON public.projects;

CREATE OR REPLACE VIEW public.public_featured_projects
WITH (security_invoker = false) AS
SELECT id, title, description, client_name, video_url, status, show_on_website,
       start_date, completed_at, deadline, created_at
FROM public.projects
WHERE show_on_website = true AND status = 'completed';

GRANT SELECT ON public.public_featured_projects TO anon, authenticated;

-- 3. expense_categories: restrict to authenticated only (was public/anon)
DROP POLICY IF EXISTS "Authenticated users can view active categories" ON public.expense_categories;

CREATE POLICY "Authenticated users can view active categories"
ON public.expense_categories
FOR SELECT
TO authenticated
USING (is_active = true);

-- 4. website_messages: remove from realtime publication to stop PII broadcast
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'website_messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.website_messages';
  END IF;
END $$;
