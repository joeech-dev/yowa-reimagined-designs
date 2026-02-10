
-- Add columns for applicant documents
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cv_url TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS national_id_url TEXT;

-- Create storage bucket for applicant documents
INSERT INTO storage.buckets (id, name, public) VALUES ('applicant-documents', 'applicant-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Only authenticated admins can read applicant documents
CREATE POLICY "Admins can view applicant documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'applicant-documents');

-- Anyone can upload applicant documents (public form)
CREATE POLICY "Anyone can upload applicant documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'applicant-documents');
