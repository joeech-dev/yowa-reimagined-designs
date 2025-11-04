-- Create the database function that the cron job will call
CREATE OR REPLACE FUNCTION public.fetch_blog_posts_job()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the edge function using net.http_post
  PERFORM net.http_post(
    url := 'https://udzgqddwuubnhqbhhnsu.supabase.co/functions/v1/fetch-blog-posts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkemdxZGR3dXVibmhxYmhobnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDIwMjcsImV4cCI6MjA3NzE3ODAyN30.wF2xFULAe1l0Oz07MnHOYqZSHQobM3WOjHfDoItyRiA'
    ),
    body := '{}'::jsonb
  );
END;
$$;
