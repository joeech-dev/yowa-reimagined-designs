-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL,
  image TEXT,
  slug TEXT NOT NULL UNIQUE,
  source_url TEXT NOT NULL UNIQUE,
  source_name TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Anyone can read blog posts" ON public.blog_posts
  FOR SELECT
  USING (true);

-- Create policy to allow service role to insert/update
CREATE POLICY "Service role can insert blog posts" ON public.blog_posts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update blog posts" ON public.blog_posts
  FOR UPDATE
  USING (true);
