
-- Create a SECURITY DEFINER function that inserts a finance transaction
-- when an invoice is marked as paid. Runs as the DB owner, bypassing RLS.
CREATE OR REPLACE FUNCTION public.handle_invoice_paid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when status changes TO 'paid'
  IF NEW.status = 'paid' AND (OLD.status IS DISTINCT FROM 'paid') THEN
    -- Avoid duplicate entries
    IF NOT EXISTS (
      SELECT 1 FROM public.finance_transactions
      WHERE description LIKE '%Invoice ' || NEW.invoice_number || '%'
        AND type = 'income'
    ) THEN
      INSERT INTO public.finance_transactions (
        type,
        amount,
        description,
        category,
        project_id,
        transaction_date
      ) VALUES (
        'income',
        NEW.total,
        'Payment received for Invoice ' || NEW.invoice_number || ' from ' || NEW.client_name,
        'Project Payment',
        NEW.project_id,
        COALESCE(NEW.payment_date, CURRENT_DATE)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_invoice_paid ON public.invoices;

-- Create the trigger
CREATE TRIGGER on_invoice_paid
  AFTER UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_invoice_paid();

-- Backfill: insert missing income entry for already-paid invoice 00106
DO $$
DECLARE
  inv RECORD;
BEGIN
  FOR inv IN
    SELECT invoice_number, client_name, total, project_id, payment_date
    FROM public.invoices
    WHERE status = 'paid'
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.finance_transactions
      WHERE description LIKE '%Invoice ' || inv.invoice_number || '%'
        AND type = 'income'
    ) THEN
      INSERT INTO public.finance_transactions (
        type, amount, description, category, project_id, transaction_date
      ) VALUES (
        'income',
        inv.total,
        'Payment received for Invoice ' || inv.invoice_number || ' from ' || inv.client_name,
        'Project Payment',
        inv.project_id,
        COALESCE(inv.payment_date, CURRENT_DATE)
      );
    END IF;
  END LOOP;
END;
$$;
