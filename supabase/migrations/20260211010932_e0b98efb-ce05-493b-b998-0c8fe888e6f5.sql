
-- Create leave_requests table
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage leave requests" ON public.leave_requests
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view own leave requests" ON public.leave_requests
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Users can create own leave requests" ON public.leave_requests
  FOR INSERT WITH CHECK (auth.uid() = employee_id);

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  date DATE NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'remote')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage attendance" ON public.attendance
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view own attendance" ON public.attendance
  FOR SELECT USING (auth.uid() = employee_id);

-- Create payroll table
CREATE TABLE public.payroll (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  base_salary NUMERIC NOT NULL DEFAULT 0,
  bonuses NUMERIC NOT NULL DEFAULT 0,
  deductions NUMERIC NOT NULL DEFAULT 0,
  net_pay NUMERIC GENERATED ALWAYS AS (base_salary + bonuses - deductions) STORED,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payroll" ON public.payroll
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_payroll_updated_at
  BEFORE UPDATE ON public.payroll
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add is_recruitment column to leads to distinguish HR applications from business leads
ALTER TABLE public.leads ADD COLUMN is_recruitment BOOLEAN NOT NULL DEFAULT false;
