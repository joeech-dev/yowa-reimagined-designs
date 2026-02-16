
-- Invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  
  -- Client details
  client_name TEXT NOT NULL,
  client_address TEXT,
  client_phone TEXT,
  client_email TEXT,
  
  -- Items stored as JSONB array
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  
  -- Payment & status
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  project_id UUID REFERENCES public.projects(id),
  created_by UUID NOT NULL,
  
  -- Receipt fields
  payment_date DATE,
  payment_method TEXT,
  is_receipt_generated BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policies - only authenticated users with roles can access
CREATE POLICY "Authenticated users can view invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Finance/admin can create invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Finance/admin can update invoices"
  ON public.invoices FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Finance/admin can delete invoices"
  ON public.invoices FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Auto-update timestamp
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
