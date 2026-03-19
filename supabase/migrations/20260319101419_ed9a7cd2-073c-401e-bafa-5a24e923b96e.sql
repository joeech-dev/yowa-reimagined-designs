
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  moderated_by UUID,
  moderated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a comment"
  ON public.blog_comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(author_name)) > 0
    AND length(trim(author_email)) > 0
    AND length(trim(content)) > 0
    AND length(content) <= 2000
  );

CREATE POLICY "Public can view approved comments"
  ON public.blog_comments FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Admins can view all comments"
  ON public.blog_comments FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'sales_marketing'::app_role)
  );

CREATE POLICY "Admins can moderate comments"
  ON public.blog_comments FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'sales_marketing'::app_role)
  );

CREATE POLICY "Admins can delete comments"
  ON public.blog_comments FOR DELETE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_blog_comments_blog_post_id ON public.blog_comments(blog_post_id);
CREATE INDEX idx_blog_comments_status ON public.blog_comments(status);
