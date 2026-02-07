
-- Create storage bucket for partner logos
INSERT INTO storage.buckets (id, name, public) VALUES ('partner-logos', 'partner-logos', true);

-- Allow anyone to view partner logos
CREATE POLICY "Anyone can view partner logos" ON storage.objects FOR SELECT USING (bucket_id = 'partner-logos');

-- Allow admins to upload partner logos
CREATE POLICY "Admins can upload partner logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'partner-logos' AND (has_role(auth.uid(), 'admin'::public.app_role) OR has_role(auth.uid(), 'super_admin'::public.app_role)));

-- Allow admins to update partner logos
CREATE POLICY "Admins can update partner logos" ON storage.objects FOR UPDATE USING (bucket_id = 'partner-logos' AND (has_role(auth.uid(), 'admin'::public.app_role) OR has_role(auth.uid(), 'super_admin'::public.app_role)));

-- Allow admins to delete partner logos
CREATE POLICY "Admins can delete partner logos" ON storage.objects FOR DELETE USING (bucket_id = 'partner-logos' AND (has_role(auth.uid(), 'admin'::public.app_role) OR has_role(auth.uid(), 'super_admin'::public.app_role)));
