CREATE TABLE public.product_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_title text NOT NULL,
  product_type text,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  country text,
  amount numeric,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'new',
  internal_notes text,
  paid_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_orders_status_check CHECK (status IN ('new','contacted','invoiced','paid','delivered','cancelled'))
);

GRANT INSERT ON public.product_orders TO anon;
GRANT SELECT, INSERT, UPDATE ON public.product_orders TO authenticated;
GRANT ALL ON public.product_orders TO service_role;

ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can place an order"
ON public.product_orders FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Staff can view orders"
ON public.product_orders FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin') OR
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'sales_marketing') OR
  public.has_role(auth.uid(), 'finance')
);

CREATE POLICY "Staff can update orders"
ON public.product_orders FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin') OR
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'sales_marketing') OR
  public.has_role(auth.uid(), 'finance')
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin') OR
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'sales_marketing') OR
  public.has_role(auth.uid(), 'finance')
);

CREATE TRIGGER update_product_orders_updated_at
BEFORE UPDATE ON public.product_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX product_orders_status_idx ON public.product_orders(status);
CREATE INDEX product_orders_created_at_idx ON public.product_orders(created_at DESC);