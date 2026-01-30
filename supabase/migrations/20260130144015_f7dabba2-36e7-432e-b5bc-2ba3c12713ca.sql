-- Create partner_brands table for managing client logos
CREATE TABLE public.partner_brands (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    website_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_brands ENABLE ROW LEVEL SECURITY;

-- Anyone can view active partner brands (for the public website)
CREATE POLICY "Anyone can view active partner brands"
ON public.partner_brands
FOR SELECT
USING (is_active = true);

-- Admins can manage all partner brands
CREATE POLICY "Admins can manage partner brands"
ON public.partner_brands
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_partner_brands_updated_at
BEFORE UPDATE ON public.partner_brands
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();