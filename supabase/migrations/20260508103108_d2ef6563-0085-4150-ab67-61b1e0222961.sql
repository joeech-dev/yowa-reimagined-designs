
-- Fix view to use security_invoker so RLS of caller is enforced
DROP VIEW IF EXISTS public.public_featured_projects;

CREATE VIEW public.public_featured_projects
WITH (security_invoker = true) AS
SELECT id, title, description, client_name, video_url, status, show_on_website,
       start_date, completed_at, deadline, created_at
FROM public.projects
WHERE show_on_website = true AND status = 'completed';

GRANT SELECT ON public.public_featured_projects TO anon, authenticated;

-- Re-add a narrow anon SELECT policy on projects so the view can read featured rows
CREATE POLICY "Anon can read featured projects (safe cols only via view)"
ON public.projects
FOR SELECT
TO anon
USING (show_on_website = true AND status = 'completed');

-- Revoke sensitive columns from anon so even direct table queries can't read them
REVOKE SELECT (client_email, client_phone, budget, lead_id) ON public.projects FROM anon;

-- Storage: replace broad public SELECT policies that allow LIST with object-by-name
-- access only. Files are still readable by direct URL (public bucket), but enumeration
-- of bucket contents via storage.objects is blocked for anon.

-- Drop existing broad policies if present (names from default supabase setup may vary).
-- We list known policies for our buckets.
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND (
        policyname ILIKE '%blog-images%' OR
        policyname ILIKE '%avatars%' OR
        policyname ILIKE '%partner-logos%' OR
        policyname ILIKE '%product-images%'
      )
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Allow authenticated users to upload/manage in these public buckets (existing INSERT
-- policies likely remain). For SELECT, only allow access when an exact object name is
-- requested (no listing). Supabase's LIST endpoint returns rows; by NOT having a SELECT
-- policy, list returns empty for anon, but direct getPublicUrl still works because
-- public buckets serve files via the storage CDN bypassing RLS for downloads.
-- We add an authenticated-only SELECT for admin/staff workflows.
CREATE POLICY "Authenticated can read public bucket objects"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id IN ('blog-images', 'avatars', 'partner-logos', 'product-images'));
