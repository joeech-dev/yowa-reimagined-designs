-- 1. blog_comments: remove public column-wide read; serve public reads through definer view
ALTER VIEW public.blog_comments_public SET (security_invoker = false);
DROP POLICY IF EXISTS "Approved comments readable for view" ON public.blog_comments;
GRANT SELECT ON public.blog_comments_public TO anon, authenticated;

-- 2. profiles: restrict authenticated blanket read to staff with a role
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;
REVOKE ALL ON FUNCTION public.has_any_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Staff can view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id OR show_on_team_board = true OR public.has_any_role(auth.uid()));

-- 3. user_presence: admins only (plus own row)
DROP POLICY IF EXISTS "Authenticated users can view presence" ON public.user_presence;
CREATE POLICY "Admins and self can view presence"
ON public.user_presence FOR SELECT TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- 4. storage: drop redundant blanket authenticated read on public buckets
DROP POLICY IF EXISTS "Authenticated can read public bucket objects" ON storage.objects;

-- 4b. applicant-documents uploads: scope to known prefixes and safe names
DROP POLICY IF EXISTS "Anyone can upload applicant documents" ON storage.objects;
CREATE POLICY "Applicants can upload scoped documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'applicant-documents'
  AND (storage.foldername(name))[1] IN ('cv', 'id', 'cvs', 'ids', 'applications')
  AND array_length(storage.foldername(name), 1) = 1
  AND storage.extension(name) = ANY (ARRAY['pdf','doc','docx','jpg','jpeg','png'])
  AND name ~ '^[A-Za-z0-9_/.-]+$'
  AND length(name) <= 200
);

-- 5. revoke direct EXECUTE on internal SECURITY DEFINER routines
REVOKE ALL ON FUNCTION public.auto_assign_sequence_to_new_lead() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_invoice_paid() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_duplicate_lead() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.is_conversation_participant(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_task_collaborator(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_task_creator(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon;