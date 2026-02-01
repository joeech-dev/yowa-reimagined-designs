-- Create portfolio_projects table
CREATE TABLE public.portfolio_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  client TEXT,
  year TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Anyone can view active projects
CREATE POLICY "Anyone can view active portfolio projects"
ON public.portfolio_projects
FOR SELECT
USING (is_active = true);

-- Admins can manage portfolio projects
CREATE POLICY "Admins can manage portfolio projects"
ON public.portfolio_projects
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_portfolio_projects_updated_at
BEFORE UPDATE ON public.portfolio_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();