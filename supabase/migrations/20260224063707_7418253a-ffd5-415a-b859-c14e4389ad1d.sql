
-- Create products table for sellable items (ebooks, videos, photos, film scripts, etc.)
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'USD',
  product_type TEXT NOT NULL DEFAULT 'ebook',
  image_url TEXT,
  purchase_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view active products
CREATE POLICY "Anyone can view active products"
ON public.products FOR SELECT
USING (is_active = true);

-- Admins can manage products
CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed existing ebook
INSERT INTO public.products (title, description, product_type, price, currency, purchase_url, image_url, display_order)
VALUES (
  'Video Cash for Creatives',
  'A practical guide to monetising your video production skills. Learn how to find clients, price your work, and build a sustainable creative business.',
  'ebook',
  NULL,
  'USD',
  'https://www.yowa.us/ordernow',
  NULL,
  1
);
