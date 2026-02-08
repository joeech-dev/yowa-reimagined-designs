
-- Create expense categories table for company-specific categories
CREATE TABLE public.expense_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- Anyone with a role can view active categories
CREATE POLICY "Authenticated users can view active categories"
ON public.expense_categories
FOR SELECT
USING (is_active = true);

-- Finance and admins can view all categories (including inactive)
CREATE POLICY "Finance and admins can view all categories"
ON public.expense_categories
FOR SELECT
USING (
  has_role(auth.uid(), 'finance'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Finance and admins can manage categories
CREATE POLICY "Finance and admins can manage categories"
ON public.expense_categories
FOR ALL
USING (
  has_role(auth.uid(), 'finance'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Trigger for updated_at
CREATE TRIGGER update_expense_categories_updated_at
BEFORE UPDATE ON public.expense_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with default categories from the existing system
INSERT INTO public.expense_categories (name, display_order, created_by)
SELECT unnest(ARRAY['Equipment', 'Software', 'Travel', 'Marketing', 'Salaries', 'Utilities', 'Production Costs', 'Office Supplies', 'Other']),
       generate_series(1, 9),
       '00000000-0000-0000-0000-000000000000';
