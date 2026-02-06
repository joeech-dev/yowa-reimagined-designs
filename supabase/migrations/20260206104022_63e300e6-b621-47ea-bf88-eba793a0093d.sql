
-- Add show_on_website toggle and video_url to projects table
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS show_on_website boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS video_url text;

-- Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'project_team';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales_marketing';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
