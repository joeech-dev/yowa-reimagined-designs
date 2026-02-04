-- Create enum for project status
CREATE TYPE public.project_status AS ENUM ('lead', 'in_progress', 'completed', 'cancelled');

-- Create enum for transaction type
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  status project_status NOT NULL DEFAULT 'lead',
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  budget NUMERIC,
  start_date DATE,
  deadline DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project team members table
CREATE TABLE public.project_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Finance transactions table
CREATE TABLE public.finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type transaction_type NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for projects
CREATE POLICY "Admins can manage projects" ON public.projects
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS policies for project team members
CREATE POLICY "Admins can manage project team members" ON public.project_team_members
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS policies for finance transactions
CREATE POLICY "Admins can manage finance transactions" ON public.finance_transactions
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finance_transactions_updated_at
BEFORE UPDATE ON public.finance_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();