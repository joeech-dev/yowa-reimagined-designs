import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { sendInternalNotification } from "@/hooks/useInternalNotify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Plus, CheckCircle, XCircle, Clock, AlertTriangle, Banknote, Eye, Pencil, User, Building2, CalendarDays, CreditCard, FileText } from "lucide-react";
import { format } from "date-fns";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";

const DEPARTMENTS = [
  "Management",
  "Finance & Accounts",
  "Sales & Marketing",
  "Production & Creative",
  "IT & Technology",
  "Human Resources",
  "Operations",
  "Field & Projects",
  "Other",
];

const PAYMENT_METHODS = [
  { value: "mobile_money", label: "Mobile Money (MTN/Airtel)" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
];

const URGENCY_LEVELS = [
  { value: "low", label: "Low — within 2 weeks", color: "text-muted-foreground" },
  { value: "normal", label: "Normal — within 3–5 days", color: "text-primary" },
  { value: "high", label: "High — within 24 hours", color: "text-secondary" },
  { value: "critical", label: "Critical — Immediate", color: "text-destructive" },
];

const urgencyBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline",
  normal: "default",
  high: "secondary",
  critical: "destructive",
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  pending: { label: "Pending", variant: "outline", icon: Clock },
  finance_approved: { label: "Finance Approved", variant: "secondary", icon: CheckCircle },
  approved: { label: "Fully Approved", variant: "default", icon: CheckCircle },
  paid: { label: "Paid / Recorded", variant: "default", icon: Banknote },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
};

interface ExpenseRequisition {
  id: string;
  requester_id: string;
  requester_name: string | null;
  department: string | null;
  title: string;
  description: string;
  justification: string | null;
  amount: number;
  category: string;
  budget_line: string | null;
  project_id: string | null;
  urgency: string | null;
  payee_name: string | null;
  payee_contact: string | null;
  payment_method: string | null;
  expected_date: string | null;
  supporting_notes: string | null;
  status: string;
  finance_approved_by: string | null;
  finance_approved_at: string | null;
  super_admin_approved_by: string | null;
  super_admin_approved_at: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  paid_at?: string | null;
  paid_by?: string | null;
}

const EMPTY_FORM = {
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

const DetailRow = ({ icon: Icon, label, value }: { icon?: any; label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
      <div className={!Icon ? "pl-7" : ""}>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
};

const ExpenseRequisitionForm = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editReq, setEditReq] = useState<ExpenseRequisition | null>(null);
  const [viewReq, setViewReq] = useState<ExpenseRequisition | null>(null);
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [confirmPayDialogReq, setConfirmPayDialogReq] = useState<ExpenseRequisition | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [userRole, setUserRole] = useState<string | null>(null);

  useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      setCurrentUserId(user.id);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      setUserRole(data?.role || null);

      // Pre-fill requester name from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, position")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profile?.full_name) {
        setFormData(f => ({ ...f, requester_name: profile.full_name || "" }));
      }
      return data;
    },
  });

  const { data: requisitions = [], isLoading } = useQuery({
    queryKey: ["expense-requisitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_requisitions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ExpenseRequisition[];
    },
  });

  const { data: expenseCategories = [] } = useExpenseCategories();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects-for-requisition"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title")
        .order("title");
      if (error) throw error;
      return data || [];
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
      // Notify finance team
      sendInternalNotification("requisition_submitted", {
        title: data.title,
        requester_name: data.requester_name,
        department: data.department,
        amount: parseFloat(data.amount),
        category: data.category,
        urgency: data.urgency,
        justification: data.justification,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-requisitions"] });
      toast.success("Expense requisition submitted");
      setFormData(EMPTY_FORM);
      setIsDialogOpen(false);
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("expense_requisitions").update({
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
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-requisitions"] });
      toast.success("Requisition updated");
      setEditReq(null);
      setFormData(EMPTY_FORM);
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, amount, req }: { id: string; amount: number; req: ExpenseRequisition }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const isFinanceOrAdmin = userRole === "finance" || userRole === "admin";
      const isSuperAdmin = userRole === "super_admin";
      let newStatus = "approved";

      if (amount < 100000 && isFinanceOrAdmin) {
        const { error } = await supabase.from("expense_requisitions")
          .update({ status: "approved", finance_approved_by: user.id, finance_approved_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        newStatus = "approved";
      } else if (amount >= 100000 && isFinanceOrAdmin) {
        const { error } = await supabase.from("expense_requisitions")
          .update({ status: "finance_approved", finance_approved_by: user.id, finance_approved_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        newStatus = "finance_approved";
      } else if (isSuperAdmin) {
        const { error } = await supabase.from("expense_requisitions")
          .update({ status: "approved", super_admin_approved_by: user.id, super_admin_approved_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        newStatus = "approved";
      }

      // Notify the requester
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
      const { data: requesterAuth } = await supabase.auth.admin ? 
        { data: null } : { data: null }; // service role not available client-side
      sendInternalNotification("requisition_approved", {
        title: req.title,
        amount: req.amount,
        status: newStatus,
        approved_by_name: profile?.full_name ?? "Finance Team",
        requester_email: "info@yowa.us", // fallback — requester email resolved server-side
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-requisitions"] });
      toast.success("Requisition approved");
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async (req: ExpenseRequisition) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: txError } = await supabase.from("finance_transactions").insert([{
        type: "expense",
        amount: req.amount,
        description: req.title + (req.description ? ` — ${req.description}` : ""),
        category: req.category,
        project_id: req.project_id || null,
        transaction_date: new Date().toISOString().split("T")[0],
      }]);
      if (txError) throw txError;

      const { error: reqError } = await supabase.from("expense_requisitions")
        .update({ status: "paid", paid_by: user.id, paid_at: new Date().toISOString() })
        .eq("id", req.id);
      if (reqError) throw reqError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["finance-transactions"] });
      toast.success("Payment confirmed — expense recorded in Finance");
      setConfirmPayDialogReq(null);
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason, req }: { id: string; reason: string; req: ExpenseRequisition }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("expense_requisitions")
        .update({ status: "rejected", rejected_by: user.id, rejected_at: new Date().toISOString(), rejection_reason: reason })
        .eq("id", id);
      if (error) throw error;
      // Notify the requester
      sendInternalNotification("requisition_rejected", {
        title: req.title,
        amount: req.amount,
        rejection_reason: reason,
        requester_email: "info@yowa.us",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-requisitions"] });
      toast.success("Requisition rejected");
      setRejectDialogId(null);
      setRejectionReason("");
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const canApprove = (req: ExpenseRequisition) => {
    const isFinanceOrAdmin = userRole === "finance" || userRole === "admin";
    const isSuperAdmin = userRole === "super_admin";
    if (req.status === "pending" && (isFinanceOrAdmin || isSuperAdmin)) return true;
    if (req.status === "finance_approved" && isSuperAdmin) return true;
    return false;
  };

  const canConfirmPayment = (req: ExpenseRequisition) =>
    req.status === "approved" && (userRole === "finance" || userRole === "super_admin");

  const canReject = userRole === "finance" || userRole === "admin" || userRole === "super_admin";
  const pendingCount = requisitions.filter(r => r.status === "pending" || r.status === "finance_approved").length;
  const awaitingPaymentCount = requisitions.filter(r => r.status === "approved").length;

  const field = (key: keyof typeof formData, val: string) => setFormData(f => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Expense Requisitions</h2>
          <div className="flex flex-col gap-0.5 mt-1">
            {pendingCount > 0 && (
              <span className="flex items-center gap-1 text-sm text-secondary">
                <AlertTriangle className="h-4 w-4" /> {pendingCount} pending approval
              </span>
            )}
            {awaitingPaymentCount > 0 && (
              <span className="flex items-center gap-1 text-sm text-primary">
                <Banknote className="h-4 w-4" /> {awaitingPaymentCount} awaiting payment
              </span>
            )}
          </div>
        </div>

        {/* ─── New Requisition Dialog ─── */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Requisition</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Expense Requisition</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[75vh] pr-4">
              <form
                id="req-form"
                onSubmit={(e) => { e.preventDefault(); submitMutation.mutate(formData); }}
                className="space-y-5 pb-2"
              >
                {/* Section: Requester Info */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <User className="h-3.5 w-3.5" /> Requester Information
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Full Name *</Label>
                      <Input value={formData.requester_name} onChange={e => field("requester_name", e.target.value)} placeholder="Your full name" required />
                    </div>
                    <div>
                      <Label>Department *</Label>
                      <Select value={formData.department} onValueChange={v => field("department", v)}>
                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Section: Expense Details */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" /> Expense Details
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label>Requisition Title *</Label>
                      <Input value={formData.title} onChange={e => field("title", e.target.value)} placeholder="e.g. Camera equipment for production project" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Amount (UGX) *</Label>
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
                          <SelectContent>
                            {expenseCategories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Brief Description *</Label>
                      <Input value={formData.description} onChange={e => field("description", e.target.value)} placeholder="One-line summary of the expense" required />
                    </div>
                    <div>
                      <Label>Detailed Justification *</Label>
                      <Textarea
                        value={formData.justification}
                        onChange={e => field("justification", e.target.value)}
                        placeholder="Explain why this expense is necessary, how it supports work objectives, and what happens if it is not approved..."
                        className="min-h-[90px]"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Budget Line / Cost Code (Optional)</Label>
                        <Input value={formData.budget_line} onChange={e => field("budget_line", e.target.value)} placeholder="e.g. Q1-PROD-EQUIPMENT" />
                      </div>
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
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Section: Payment & Urgency */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5" /> Payment & Timing
                  </p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Urgency *</Label>
                        <Select value={formData.urgency} onValueChange={v => field("urgency", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {URGENCY_LEVELS.map(u => (
                              <SelectItem key={u.value} value={u.value}>
                                <span className={u.color}>{u.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Expected Payment Date</Label>
                        <Input type="date" value={formData.expected_date} onChange={e => field("expected_date", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>Preferred Payment Method</Label>
                      <Select value={formData.payment_method} onValueChange={v => field("payment_method", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Payee / Vendor Name</Label>
                        <Input value={formData.payee_name} onChange={e => field("payee_name", e.target.value)} placeholder="Who will receive the money?" />
                      </div>
                      <div>
                        <Label>Payee Contact / Account</Label>
                        <Input value={formData.payee_contact} onChange={e => field("payee_contact", e.target.value)} placeholder="Phone, account no., or email" />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Section: Supporting Notes */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" /> Additional Notes
                  </p>
                  <Textarea
                    value={formData.supporting_notes}
                    onChange={e => field("supporting_notes", e.target.value)}
                    placeholder="Any other information Finance should know — quotes received, approvals already given verbally, etc."
                    className="min-h-[70px]"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? "Submitting..." : "Submit Requisition"}
                </Button>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflow Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            <strong>Workflow:</strong> Submit → Finance approves (amounts ≥ UGX 100,000 also require Super Admin) → <strong>Finance confirms payment</strong> → Auto-recorded as expense in Finance ledger.
          </p>
        </CardContent>
      </Card>

      {/* Requisitions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Requisitions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6">Loading...</p>
          ) : requisitions.length === 0 ? (
            <p className="text-muted-foreground text-sm p-6">No requisitions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead className="text-right">Amount (UGX)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requisitions.map((req) => {
                    const config = statusConfig[req.status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    const urgencyLabel = URGENCY_LEVELS.find(u => u.value === (req.urgency || "normal"))?.label.split(" — ")[0] || "Normal";
                    return (
                      <TableRow key={req.id}>
                        <TableCell className="whitespace-nowrap text-sm">{format(new Date(req.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{req.requester_name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{req.department || "—"}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{req.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{req.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{req.category}</TableCell>
                        <TableCell>
                          <Badge variant={urgencyBadgeVariant[req.urgency || "normal"]} className="text-xs">
                            {urgencyLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {Number(req.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="gap-1 text-xs">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                          {req.rejection_reason && (
                            <p className="text-xs text-destructive mt-1 max-w-[150px] truncate">{req.rejection_reason}</p>
                          )}
                          {req.status === "paid" && req.paid_at && (
                            <p className="text-xs text-muted-foreground mt-1">Paid {format(new Date(req.paid_at), "MMM d, yyyy")}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1.5 flex-wrap">
                            <Button size="sm" variant="ghost" onClick={() => setViewReq(req)} title="View details">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {/* Edit — only own pending requisitions */}
                            {req.requester_id === currentUserId && req.status === "pending" && (
                              <Button size="sm" variant="ghost" title="Edit" onClick={() => {
                                setEditReq(req);
                                setFormData({
                                  requester_name: req.requester_name || "",
                                  department: req.department || "",
                                  title: req.title,
                                  description: req.description,
                                  justification: req.justification || "",
                                  amount: String(req.amount),
                                  category: req.category,
                                  budget_line: req.budget_line || "",
                                  project_id: req.project_id || "",
                                  urgency: req.urgency || "normal",
                                  payee_name: req.payee_name || "",
                                  payee_contact: req.payee_contact || "",
                                  payment_method: req.payment_method || "bank_transfer",
                                  expected_date: req.expected_date || "",
                                  supporting_notes: req.supporting_notes || "",
                                });
                              }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {canApprove(req) && (
                              <Button size="sm" variant="outline" className="text-primary text-xs" onClick={() => approveMutation.mutate({ id: req.id, amount: req.amount, req })}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                            )}
                            {canConfirmPayment(req) && (
                              <Button size="sm" variant="default" className="text-xs" onClick={() => setConfirmPayDialogReq(req)}>
                                <Banknote className="h-3.5 w-3.5 mr-1" /> Pay
                              </Button>
                            )}
                            {canReject && (req.status === "pending" || req.status === "finance_approved") && (
                              <Button size="sm" variant="ghost" className="text-destructive text-xs" onClick={() => setRejectDialogId(req.id)}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Edit Requisition Dialog (requester, pending only) ─── */}
      <Dialog open={!!editReq} onOpenChange={(open) => { if (!open) { setEditReq(null); setFormData(EMPTY_FORM); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" /> Edit Requisition
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[75vh] pr-4">
            <form onSubmit={(e) => { e.preventDefault(); editReq && updateMutation.mutate({ id: editReq.id, data: formData }); }} className="space-y-5 pb-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Full Name *</Label><Input value={formData.requester_name} onChange={e => setFormData(f => ({ ...f, requester_name: e.target.value }))} required /></div>
                <div>
                  <Label>Department *</Label>
                  <Select value={formData.department} onValueChange={v => setFormData(f => ({ ...f, department: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div><Label>Requisition Title *</Label><Input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Amount (UGX) *</Label>
                  <Input type="number" step="1" value={formData.amount} onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))} required />
                  {parseFloat(formData.amount) >= 100000 && (
                    <p className="text-xs text-secondary mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Requires Finance + Super Admin approval</p>
                  )}
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={v => setFormData(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{expenseCategories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Brief Description *</Label><Input value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} required /></div>
              <div><Label>Detailed Justification *</Label><Textarea value={formData.justification} onChange={e => setFormData(f => ({ ...f, justification: e.target.value }))} className="min-h-[80px]" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Payee / Vendor Name</Label><Input value={formData.payee_name} onChange={e => setFormData(f => ({ ...f, payee_name: e.target.value }))} /></div>
                <div><Label>Payee Contact / Account</Label><Input value={formData.payee_contact} onChange={e => setFormData(f => ({ ...f, payee_contact: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Payment Method</Label>
                  <Select value={formData.payment_method} onValueChange={v => setFormData(f => ({ ...f, payment_method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Urgency</Label>
                  <Select value={formData.urgency} onValueChange={v => setFormData(f => ({ ...f, urgency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {URGENCY_LEVELS.map(u => <SelectItem key={u.value} value={u.value}>{u.label.split(" — ")[0]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Linked Project (Optional)</Label>
                  <Select value={formData.project_id || "none"} onValueChange={v => setFormData(f => ({ ...f, project_id: v === "none" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Expected Payment Date</Label><Input type="date" value={formData.expected_date} onChange={e => setFormData(f => ({ ...f, expected_date: e.target.value }))} /></div>
              </div>
              <div><Label>Additional Notes</Label><Textarea value={formData.supporting_notes} onChange={e => setFormData(f => ({ ...f, supporting_notes: e.target.value }))} className="min-h-[60px]" /></div>
              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ─── View Detail Dialog (Finance View) ─── */}
      <Dialog open={!!viewReq} onOpenChange={() => setViewReq(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Requisition Detail
            </DialogTitle>
          </DialogHeader>
          {viewReq && (() => {
            const config = statusConfig[viewReq.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const urgencyDef = URGENCY_LEVELS.find(u => u.value === (viewReq.urgency || "normal"));
            const paymentMethodLabel = PAYMENT_METHODS.find(m => m.value === viewReq.payment_method)?.label || viewReq.payment_method;
            const linkedProject = projects.find(p => p.id === viewReq.project_id);
            return (
              <ScrollArea className="max-h-[75vh] pr-2">
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-base">{viewReq.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{viewReq.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={config.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" /> {config.label}
                      </Badge>
                      {urgencyDef && (
                        <Badge variant={urgencyBadgeVariant[viewReq.urgency || "normal"]} className="text-xs">
                          {urgencyDef.label.split(" — ")[0]}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Amount */}
                  <div className="rounded-lg bg-muted p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount Requested</p>
                      <p className="text-2xl font-bold">UGX {Number(viewReq.amount).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Date Submitted</p>
                      <p className="text-sm font-medium">{format(new Date(viewReq.created_at), "MMM d, yyyy")}</p>
                    </div>
                  </div>

                  {/* Requester Info */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Requester</p>
                    <div className="grid grid-cols-2 gap-3">
                      <DetailRow icon={User} label="Full Name" value={viewReq.requester_name} />
                      <DetailRow icon={Building2} label="Department" value={viewReq.department} />
                    </div>
                  </div>

                  <Separator />

                  {/* Expense Details */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Expense Details</p>
                    <div className="space-y-2">
                      <DetailRow icon={FileText} label="Category" value={viewReq.category} />
                      {viewReq.budget_line && <DetailRow icon={FileText} label="Budget Line / Cost Code" value={viewReq.budget_line} />}
                      {linkedProject && <DetailRow icon={FileText} label="Linked Project" value={linkedProject.title} />}
                      {viewReq.justification && (
                        <div>
                          <p className="text-xs text-muted-foreground">Justification</p>
                          <p className="text-sm mt-0.5 bg-muted/50 rounded p-2 whitespace-pre-wrap">{viewReq.justification}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Details */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Payment Details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <DetailRow icon={CreditCard} label="Payment Method" value={paymentMethodLabel} />
                      {viewReq.expected_date && (
                        <DetailRow icon={CalendarDays} label="Expected Date" value={format(new Date(viewReq.expected_date), "MMM d, yyyy")} />
                      )}
                      <DetailRow icon={User} label="Payee / Vendor" value={viewReq.payee_name} />
                      <DetailRow icon={User} label="Payee Contact / Account" value={viewReq.payee_contact} />
                    </div>
                  </div>

                  {viewReq.supporting_notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Additional Notes</p>
                        <p className="text-sm bg-muted/50 rounded p-2 whitespace-pre-wrap">{viewReq.supporting_notes}</p>
                      </div>
                    </>
                  )}

                  {/* Approval Trail */}
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Approval Trail</p>
                    <div className="space-y-1 text-sm">
                  {viewReq.finance_approved_at && (
                        <p className="flex items-center gap-1 text-primary">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Finance approved on {format(new Date(viewReq.finance_approved_at), "MMM d, yyyy h:mm a")}
                        </p>
                      )}
                      {viewReq.super_admin_approved_at && (
                        <p className="flex items-center gap-1 text-primary">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Super Admin approved on {format(new Date(viewReq.super_admin_approved_at), "MMM d, yyyy h:mm a")}
                        </p>
                      )}
                      {viewReq.paid_at && (
                        <p className="flex items-center gap-1 text-foreground font-medium">
                          <Banknote className="h-3.5 w-3.5" />
                          Payment confirmed on {format(new Date(viewReq.paid_at), "MMM d, yyyy h:mm a")}
                        </p>
                      )}
                      {viewReq.rejection_reason && (
                        <div className="rounded bg-destructive/10 p-2 text-destructive">
                          <p className="font-medium text-xs">Rejection Reason:</p>
                          <p>{viewReq.rejection_reason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons in detail view */}
                  <div className="flex gap-2 pt-1">
                    {canApprove(viewReq) && (
                      <Button className="flex-1" variant="outline" onClick={() => { approveMutation.mutate({ id: viewReq.id, amount: viewReq.amount }); setViewReq(null); }}>
                        <CheckCircle className="h-4 w-4 mr-2" /> Approve
                      </Button>
                    )}
                    {canConfirmPayment(viewReq) && (
                      <Button className="flex-1" variant="default" onClick={() => { setConfirmPayDialogReq(viewReq); setViewReq(null); }}>
                        <Banknote className="h-4 w-4 mr-2" /> Confirm Payment
                      </Button>
                    )}
                    {canReject && (viewReq.status === "pending" || viewReq.status === "finance_approved") && (
                      <Button className="flex-1" variant="destructive" onClick={() => { setRejectDialogId(viewReq.id); setViewReq(null); }}>
                        <XCircle className="h-4 w-4 mr-2" /> Reject
                      </Button>
                    )}
                  </div>
                </div>
              </ScrollArea>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ─── Confirm Payment Dialog ─── */}
      <Dialog open={!!confirmPayDialogReq} onOpenChange={() => setConfirmPayDialogReq(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" /> Confirm Payment
            </DialogTitle>
          </DialogHeader>
          {confirmPayDialogReq && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-1.5 text-sm">
                <p><strong>Requester:</strong> {confirmPayDialogReq.requester_name || "—"} ({confirmPayDialogReq.department || "—"})</p>
                <p><strong>Title:</strong> {confirmPayDialogReq.title}</p>
                <p><strong>Category:</strong> {confirmPayDialogReq.category}</p>
                <p><strong>Payee:</strong> {confirmPayDialogReq.payee_name || "—"} {confirmPayDialogReq.payee_contact ? `· ${confirmPayDialogReq.payee_contact}` : ""}</p>
                <p><strong>Payment Via:</strong> {PAYMENT_METHODS.find(m => m.value === confirmPayDialogReq.payment_method)?.label || confirmPayDialogReq.payment_method || "—"}</p>
                <Separator />
                <p className="text-base font-bold">Amount: UGX {Number(confirmPayDialogReq.amount).toLocaleString()}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Confirming payment will <strong>automatically record this as an expense</strong> in the Finance transactions ledger. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmPayDialogReq(null)}>Cancel</Button>
                <Button
                  className="flex-1"
                  variant="default"
                  disabled={confirmPaymentMutation.isPending}
                  onClick={() => confirmPaymentMutation.mutate(confirmPayDialogReq)}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  {confirmPaymentMutation.isPending ? "Recording..." : "Yes, Confirm Payment"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Reject Dialog ─── */}
      <Dialog open={!!rejectDialogId} onOpenChange={() => { setRejectDialogId(null); setRejectionReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Requisition</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Rejection</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a clear reason so the requester can understand and resubmit if needed..."
                className="min-h-[80px]"
                required
              />
            </div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => rejectDialogId && rejectMutation.mutate({ id: rejectDialogId, reason: rejectionReason })}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseRequisitionForm;
