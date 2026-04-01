
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'UGX';
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'UGX';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'UGX';
ALTER TABLE public.finance_transactions ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'UGX';
ALTER TABLE public.expense_requisitions ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'UGX';
