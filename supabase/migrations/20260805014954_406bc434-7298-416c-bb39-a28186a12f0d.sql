CREATE TABLE IF NOT EXISTS public.content_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL,
  content_id text NOT NULL,
  view_count bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (content_type, content_id)
);

GRANT SELECT ON public.content_views TO anon;
GRANT SELECT ON public.content_views TO authenticated;
GRANT ALL ON public.content_views TO service_role;

ALTER TABLE public.content_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read view counts" ON public.content_views FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.increment_content_view(_content_type text, _content_id text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  IF _content_type NOT IN ('blog', 'project') THEN
    RAISE EXCEPTION 'Invalid content type';
  END IF;
  IF _content_id IS NULL OR length(_content_id) = 0 OR length(_content_id) > 200 THEN
    RAISE EXCEPTION 'Invalid content id';
  END IF;

  INSERT INTO public.content_views (content_type, content_id, view_count)
  VALUES (_content_type, _content_id, 1)
  ON CONFLICT (content_type, content_id)
  DO UPDATE SET view_count = public.content_views.view_count + 1, updated_at = now()
  RETURNING view_count INTO new_count;

  RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_content_view(text, text) TO anon, authenticated;