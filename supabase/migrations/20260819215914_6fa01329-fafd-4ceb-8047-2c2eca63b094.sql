ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS doc_notes text;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS doc_notes text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS doc_notes text;