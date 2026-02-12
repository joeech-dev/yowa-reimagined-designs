-- Create a trigger function to prevent duplicate lead submissions within 1 hour
CREATE OR REPLACE FUNCTION public.prevent_duplicate_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.leads
    WHERE email = NEW.email
      AND created_at > NOW() - INTERVAL '1 hour'
  ) THEN
    RAISE EXCEPTION 'A submission with this email was already received recently. Please try again later.';
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to leads table
CREATE TRIGGER check_duplicate_lead
BEFORE INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.prevent_duplicate_lead();