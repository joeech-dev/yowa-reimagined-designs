
-- Create quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_number TEXT NOT NULL,
  quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_name TEXT NOT NULL,
  client_address TEXT,
  client_phone TEXT,
  client_email TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  project_id UUID REFERENCES public.projects(id),
  status TEXT NOT NULL DEFAULT 'draft',
  requested_by TEXT,
  provided_by TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance and admins can manage quotations"
ON public.quotations FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));

CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON public.quotations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create work_orders table
CREATE TABLE public.work_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_number TEXT NOT NULL,
  work_order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_name TEXT NOT NULL,
  client_address TEXT,
  client_phone TEXT,
  client_email TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  project_id UUID REFERENCES public.projects(id),
  status TEXT NOT NULL DEFAULT 'draft',
  requested_by TEXT,
  provided_by TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance and admins can manage work_orders"
ON public.work_orders FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));

CREATE TRIGGER update_work_orders_updated_at
BEFORE UPDATE ON public.work_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
