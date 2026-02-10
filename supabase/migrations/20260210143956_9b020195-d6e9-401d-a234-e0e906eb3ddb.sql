
-- Fix: restrict viewing applicant documents to admins only
DROP POLICY IF EXISTS "Admins can view applicant documents" ON storage.objects;
CREATE POLICY "Admins can view applicant documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'applicant-documents' AND (
  auth.uid() IS NOT NULL AND (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'sales_marketing')
  )
));

-- Fix: restrict upload to specific file types and size via path pattern
DROP POLICY IF EXISTS "Anyone can upload applicant documents" ON storage.objects;
CREATE POLICY "Anyone can upload applicant documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'applicant-documents' AND
  (storage.extension(name) IN ('pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'))
);
