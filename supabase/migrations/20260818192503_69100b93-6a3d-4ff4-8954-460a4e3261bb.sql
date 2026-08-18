DROP POLICY IF EXISTS "Applicants can upload scoped documents" ON storage.objects;
CREATE POLICY "Applicants can upload scoped documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'applicant-documents'
  AND (storage.foldername(name))[1] IN ('cv', 'national-id', 'id', 'applications')
  AND array_length(storage.foldername(name), 1) = 1
  AND storage.extension(name) = ANY (ARRAY['pdf','doc','docx','jpg','jpeg','png'])
  AND name ~ '^[A-Za-z0-9_/.-]+$'
  AND length(name) <= 200
);