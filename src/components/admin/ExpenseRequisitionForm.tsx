import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, CheckCircle, XCircle, Clock, AlertTriangle, Banknote } from "lucide-react";
import { format } from "date-fns";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";

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
  title: string;
  description: string;
  amount: number;
  category: string;
  project_id: string | null;
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

const ExpenseRequisitionForm = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [confirmPayDialogReq, setConfirmPayDialogReq] = useState<ExpenseRequisition | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    category: "",
    project_id: "",
  });

  const [userRole, setUserRole] = useState<string | null>(null);

  useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      setUserRole(data?.role || null);
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
        title: data.title,
        description: data.description,
        amount: parseFloat(data.amount),
        category: data.category,
        project_id: data.project_id || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-requisitions"] });
      toast.success("Expense requisition submitted");
      setFormData({ title: "", description: "", amount: "", category: "", project_id: "" });
      setIsDialogOpen(false);
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const isFinanceOrAdmin = userRole === "finance" || userRole === "admin";
      const isSuperAdmin = userRole === "super_admin";

      if (amount < 100000 && isFinanceOrAdmin) {
        const { error } = await supabase.from("expense_requisitions")
          .update({ status: "approved", finance_approved_by: user.id, finance_approved_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
      } else if (amount >= 100000 && isFinanceOrAdmin) {
        const { error } = await supabase.from("expense_requisitions")
          .update({ status: "finance_approved", finance_approved_by: user.id, finance_approved_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
      } else if (isSuperAdmin) {
        const { error } = await supabase.from("expense_requisitions")
          .update({ status: "approved", super_admin_approved_by: user.id, super_admin_approved_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-requisitions"] });
      toast.success("Requisition approved");
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  // Confirm payment: marks as paid + auto-creates expense in finance_transactions
  const confirmPaymentMutation = useMutation({
    mutationFn: async (req: ExpenseRequisition) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Record as expense in finance_transactions
      const { error: txError } = await supabase.from("finance_transactions").insert([{
        type: "expense",
        amount: req.amount,
        description: req.title + (req.description ? ` — ${req.description}` : ""),
        category: req.category,
        project_id: req.project_id || null,
        transaction_date: new Date().toISOString().split("T")[0],
      }]);
      if (txError) throw txError;

      // 2. Mark requisition as paid
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
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("expense_requisitions")
        .update({ status: "rejected", rejected_by: user.id, rejected_at: new Date().toISOString(), rejection_reason: reason })
        .eq("id", id);
      if (error) throw error;
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
    req.status === "approved" &&
    (userRole === "finance" || userRole === "super_admin");

  const canReject = userRole === "finance" || userRole === "admin" || userRole === "super_admin";

  const pendingCount = requisitions.filter(r => r.status === "pending" || r.status === "finance_approved").length;
  const awaitingPaymentCount = requisitions.filter(r => r.status === "approved").length;

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
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Banknote className="h-4 w-4" /> {awaitingPaymentCount} awaiting payment confirmation
              </span>
            )}
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Requisition</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Expense Requisition</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); submitMutation.mutate(formData); }} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Camera equipment for project" required />
              </div>
              <div>
                <Label>Amount (UGX)</Label>
                <Input type="number" step="1" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                {parseFloat(formData.amount) >= 100000 && (
                  <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Requires Finance + Super Admin approval
                  </p>
                )}
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe what this expense is for..." required />
              </div>
              <div>
                <Label>Linked Project (Optional)</Label>
                <Select value={formData.project_id || "none"} onValueChange={(v) => setFormData({ ...formData, project_id: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
                Submit Requisition
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflow info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            <strong>Workflow:</strong> Submit → Finance approves (amounts ≥ UGX 100,000 also need Super Admin) → <strong>Finance confirms payment</strong> → Auto-recorded as expense in Finance.
          </p>
        </CardContent>
      </Card>

      {/* Requisitions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Requisitions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount (UGX)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requisitions.map((req) => {
                  const config = statusConfig[req.status] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  return (
                    <TableRow key={req.id}>
                      <TableCell>{format(new Date(req.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{req.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{req.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{req.category}</TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(req.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                        {req.rejection_reason && (
                          <p className="text-xs text-destructive mt-1">{req.rejection_reason}</p>
                        )}
                        {req.status === "paid" && req.paid_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Paid {format(new Date(req.paid_at), "MMM d, yyyy")}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          {canApprove(req) && (
                            <Button size="sm" variant="outline" className="text-primary" onClick={() => approveMutation.mutate({ id: req.id, amount: req.amount })}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          )}
                          {canConfirmPayment(req) && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setConfirmPayDialogReq(req)}>
                              <Banknote className="h-4 w-4 mr-1" /> Confirm Payment
                            </Button>
                          )}
                          {canReject && (req.status === "pending" || req.status === "finance_approved") && (
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => setRejectDialogId(req.id)}>
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirm Payment Dialog */}
      <Dialog open={!!confirmPayDialogReq} onOpenChange={() => setConfirmPayDialogReq(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-600" /> Confirm Payment
            </DialogTitle>
          </DialogHeader>
          {confirmPayDialogReq && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-1 text-sm">
                <p><strong>Title:</strong> {confirmPayDialogReq.title}</p>
                <p><strong>Category:</strong> {confirmPayDialogReq.category}</p>
                <p><strong>Amount:</strong> UGX {Number(confirmPayDialogReq.amount).toLocaleString()}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Confirming payment will <strong>automatically record this as an expense</strong> in the Finance transactions sheet. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmPayDialogReq(null)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
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

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialogId} onOpenChange={() => { setRejectDialogId(null); setRejectionReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Requisition</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for rejection</Label>
              <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Provide a reason..." required />
            </div>
            <Button variant="destructive" className="w-full" onClick={() => rejectDialogId && rejectMutation.mutate({ id: rejectDialogId, reason: rejectionReason })} disabled={!rejectionReason.trim()}>
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseRequisitionForm;
