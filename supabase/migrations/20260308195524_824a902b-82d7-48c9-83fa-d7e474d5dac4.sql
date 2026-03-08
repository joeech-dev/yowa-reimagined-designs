
-- Social Media Clients table
CREATE TABLE public.social_media_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  contact_email TEXT,
  industry TEXT,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Social Media Reports table (one report per client per period per platform)
CREATE TABLE public.social_media_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.social_media_clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  followers_count INTEGER DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,
  followers_lost INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  total_reach INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  total_engagements INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  video_views INTEGER DEFAULT 0,
  watch_time_minutes INTEGER DEFAULT 0,
  stories_views INTEGER DEFAULT 0,
  profile_visits INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.social_media_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and sales can manage SM clients"
  ON public.social_media_clients FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'sales_marketing'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'sales_marketing'::app_role)
  );

CREATE POLICY "Admins and sales can manage SM reports"
  ON public.social_media_reports FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'sales_marketing'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'sales_marketing'::app_role)
  );

CREATE TRIGGER update_social_media_clients_updated_at
  BEFORE UPDATE ON public.social_media_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_media_reports_updated_at
  BEFORE UPDATE ON public.social_media_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
