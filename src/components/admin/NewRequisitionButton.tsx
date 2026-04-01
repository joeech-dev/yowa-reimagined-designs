import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, AlertTriangle } from "lucide-react";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";

const DEPARTMENTS = [
  "Management", "Finance & Accounts", "Sales & Marketing",
  "Production & Creative", "IT & Technology", "Human Resources",
  "Operations", "Field & Projects", "Other",
];

const PAYMENT_METHODS = [
  { value: "mobile_money", label: "Mobile Money (MTN/Airtel)" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
];

interface NewRequisitionButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
}

const EMPTY = {
  requester_name: "",
  department: "",
  title: "",
  description: "",
  justification: "",
  amount: "",
  category: "",
  budget_line: "",
  project_id: "",
  urgency: "normal",
  payee_name: "",
  payee_contact: "",
  payment_method: "bank_transfer",
  expected_date: "",
  supporting_notes: "",
};

const NewRequisitionButton = ({ variant = "outline", size = "default", className, label = "New Requisition" }: NewRequisitionButtonProps) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY);

  const { data: expenseCategories = [] } = useExpenseCategories();
  const { data: projects = [] } = useQuery({
    queryKey: ["projects-for-requisition"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("id, title").order("title");
      if (error) throw error;
      return data || [];
    },
  });

  useQuery({
    queryKey: ["prefill-requester"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
      if (data?.full_name) setFormData(f => ({ ...f, requester_name: data.full_name || "" }));
      return data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("expense_requisitions").insert([{
        requester_id: user.id,
        requester_name: data.requester_name || null,
        department: data.department || null,
        title: data.title,
        description: data.description,
        justification: data.justification || null,
        amount: parseFloat(data.amount),
        category: data.category,
        budget_line: data.budget_line || null,
        project_id: data.project_id || null,
        urgency: data.urgency,
        payee_name: data.payee_name || null,
        payee_contact: data.payee_contact || null,
        payment_method: data.payment_method || null,
        expected_date: data.expected_date || null,
        supporting_notes: data.supporting_notes || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-requisitions"] });
      toast.success("Expense requisition submitted to Finance");
      setFormData(EMPTY);
      setIsOpen(false);
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const field = (key: keyof typeof formData, val: string) => setFormData(f => ({ ...f, [key]: val }));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Plus className="mr-2 h-4 w-4" /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Expense Requisition</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh] pr-4">
          <form onSubmit={(e) => { e.preventDefault(); submitMutation.mutate(formData); }} className="space-y-5 pb-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Full Name *</Label>
                <Input value={formData.requester_name} onChange={e => field("requester_name", e.target.value)} placeholder="Your full name" required />
              </div>
              <div>
                <Label>Department *</Label>
                <Select value={formData.department} onValueChange={v => field("department", v)}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div>
              <Label>Requisition Title *</Label>
              <Input value={formData.title} onChange={e => field("title", e.target.value)} placeholder="e.g. Camera equipment for production project" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount *</Label>
                <Input type="number" step="1" value={formData.amount} onChange={e => field("amount", e.target.value)} required />
                {parseFloat(formData.amount) >= 100000 && (
                  <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Requires Finance + Super Admin approval
                  </p>
                )}
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={v => field("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{expenseCategories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Brief Description *</Label>
              <Input value={formData.description} onChange={e => field("description", e.target.value)} placeholder="One-line summary" required />
            </div>
            <div>
              <Label>Detailed Justification *</Label>
              <Textarea value={formData.justification} onChange={e => field("justification", e.target.value)} placeholder="Why is this expense needed? What happens if not approved?" className="min-h-[80px]" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Payee / Vendor Name</Label>
                <Input value={formData.payee_name} onChange={e => field("payee_name", e.target.value)} placeholder="Who receives the money?" />
              </div>
              <div>
                <Label>Payee Contact / Account</Label>
                <Input value={formData.payee_contact} onChange={e => field("payee_contact", e.target.value)} placeholder="Phone, account no., or email" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={v => field("payment_method", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Urgency</Label>
                <Select value={formData.urgency} onValueChange={v => field("urgency", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Linked Project (Optional)</Label>
                <Select value={formData.project_id || "none"} onValueChange={v => field("project_id", v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expected Payment Date</Label>
                <Input type="date" value={formData.expected_date} onChange={e => field("expected_date", e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Submitting..." : "Submit Requisition"}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NewRequisitionButton;
