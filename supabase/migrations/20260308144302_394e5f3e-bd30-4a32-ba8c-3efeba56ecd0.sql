
-- Add status column to blog_posts (draft/published)
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';

-- Mark all existing posts as published (they were already live)
UPDATE public.blog_posts SET status = 'published';
