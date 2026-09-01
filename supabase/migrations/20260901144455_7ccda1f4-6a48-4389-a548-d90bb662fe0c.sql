-- Clean up existing avatars policies and rebuild them coherently
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete avatars" ON storage.objects;
DROP POLICY IF EXISTS "Staff can upload team photos" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update team photos" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete team photos" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;

-- Public read (bucket is public; keep an explicit policy for signed/list access)
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Own profile photo: folder must be the user's uid
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Shared team photos folder: any staff member with a role
CREATE POLICY "Staff can upload team photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'team' AND public.has_any_role(auth.uid()));

CREATE POLICY "Staff can update team photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'team' AND public.has_any_role(auth.uid()))
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'team' AND public.has_any_role(auth.uid()));

CREATE POLICY "Staff can delete team photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'team' AND public.has_any_role(auth.uid()));

-- Admins manage any avatar (e.g. editing another user's photo from User Management)
CREATE POLICY "Admins can upload avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));

CREATE POLICY "Admins can update avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')))
WITH CHECK (bucket_id = 'avatars' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));

CREATE POLICY "Admins can delete avatars"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));