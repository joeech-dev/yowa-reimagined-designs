import { useState, useRef } from "react";
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
import { Plus, Printer, Receipt, Trash2, Eye, FileText } from "lucide-react";
import { format } from "date-fns";
import { useUserRole } from "@/hooks/useUserRole";
import InvoiceTemplate from "./InvoiceTemplate";
import ReceiptTemplate from "./ReceiptTemplate";
import type { InvoiceItem } from "./InvoiceTemplate";

interface InvoiceRow {
  id: string;
  invoice_number: string;
  invoice_date: string;
  client_name: string;
  client_address: string | null;
  client_phone: string | null;
  client_email: string | null;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: string;
  notes: string | null;
  project_id: string | null;
  payment_date: string | null;
  payment_method: string | null;
  is_receipt_generated: boolean;
  created_at: string;
}

const defaultItem: InvoiceItem = { description: "", quantity: "1", unit_cost: 0, total: 0 };

const InvoicesManagement = () => {
  const queryClient = useQueryClient();
  const { canEdit } = useUserRole();
  const canEditFinance = canEdit("finance");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRow | null>(null);
  const [previewType, setPreviewType] = useState<"invoice" | "receipt">("invoice");
  const printRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0],
    client_name: "",
    client_address: "",
    client_phone: "",
    client_email: "",
    title: "",
    items: [{ ...defaultItem }] as InvoiceItem[],
    tax_rate: 6,
    notes: "",
    project_id: "",
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((inv: any) => ({
        ...inv,
        items: (typeof inv.items === "string" ? JSON.parse(inv.items) : inv.items) as InvoiceItem[],
      })) as InvoiceRow[];
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("id, title").order("title");
      if (error) throw error;
      return data as { id: string; title: string }[];
    },
  });

  const calculateTotals = (items: InvoiceItem[], taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0);
    const taxAmount = Math.round(subtotal * (taxRate / 100));
    const total = subtotal - taxAmount;
    return { subtotal, taxAmount, total };
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "unit_cost" || field === "quantity") {
      const qty = parseFloat(String(newItems[index].quantity)) || 1;
      newItems[index].total = qty * Number(newItems[index].unit_cost);
    }
    setForm({ ...form, items: newItems });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { ...defaultItem }] });
  const removeItem = (index: number) => {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { subtotal, taxAmount, total } = calculateTotals(form.items, form.tax_rate);
      const { error } = await supabase.from("invoices").insert([{
        invoice_number: form.invoice_number,
        invoice_date: form.invoice_date,
        client_name: form.client_name,
        client_address: form.client_address || null,
        client_phone: form.client_phone || null,
        client_email: form.client_email || null,
        items: form.items as any,
        subtotal,
        tax_rate: form.tax_rate,
        tax_amount: taxAmount,
        total,
        notes: form.title || null,
        project_id: form.project_id || null,
        created_by: user.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const markPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").update({
        status: "paid",
        payment_date: new Date().toISOString().split("T")[0],
        is_receipt_generated: true,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice marked as paid");
    },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => {
    setForm({
      invoice_number: "",
      invoice_date: new Date().toISOString().split("T")[0],
      client_name: "",
      client_address: "",
      client_phone: "",
      client_email: "",
      title: "",
      items: [{ ...defaultItem }],
      tax_rate: 6,
      notes: "",
      project_id: "",
    });
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${previewType === "invoice" ? "Invoice" : "Receipt"}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>
      ${printRef.current.innerHTML}
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
    };
    return <span className={`px-2 py-1 rounded text-xs ${colors[status] || colors.draft}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoices & Receipts</h2>
        {canEditFinance && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> New Invoice</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Invoice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Invoice Number</Label>
                    <Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} placeholder="e.g. 00107" required />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} required />
                  </div>
                </div>

                <div>
                  <Label>Invoice Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Transcription of documentary interviews" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Client Name</Label>
                    <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Client Email</Label>
                    <Input type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Client Address</Label>
                    <Textarea value={form.client_address} onChange={(e) => setForm({ ...form, client_address: e.target.value })} rows={2} />
                  </div>
                  <div>
                    <Label>Client Phone</Label>
                    <Input value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} />
                  </div>
                </div>

                <div>
                  <Label>Linked Project</Label>
                  <Select value={form.project_id || "none"} onValueChange={(v) => setForm({ ...form, project_id: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Line Items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="h-3 w-3 mr-1" /> Add Item
                    </Button>
                  </div>
                  {form.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                      <Input className="col-span-5" placeholder="Service description" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} required />
                      <Input className="col-span-2" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} required />
                      <Input className="col-span-2" type="number" placeholder="Unit Cost" value={item.unit_cost || ""} onChange={(e) => updateItem(i, "unit_cost", parseFloat(e.target.value) || 0)} required />
                      <div className="col-span-2 flex items-center text-sm font-medium">
                        {Number(item.total).toLocaleString()}/=
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)} className="col-span-1" disabled={form.items.length <= 1}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tax Rate (%)</Label>
                    <Input type="number" step="0.01" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="flex items-end">
                    <div className="text-sm space-y-1">
                      <p>Subtotal: <strong>{calculateTotals(form.items, form.tax_rate).subtotal.toLocaleString()}/=</strong></p>
                      <p>Tax: <strong>-{calculateTotals(form.items, form.tax_rate).taxAmount.toLocaleString()}/=</strong></p>
                      <p className="text-base">Total: <strong className="text-primary">{calculateTotals(form.items, form.tax_rate).total.toLocaleString()}/=</strong></p>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Invoice"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : invoices.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No invoices yet. Create your first one!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Total (UGX)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                    <TableCell>{format(new Date(inv.invoice_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{inv.client_name}</TableCell>
                    <TableCell className="text-right font-medium">{Number(inv.total).toLocaleString()}/=</TableCell>
                    <TableCell>{statusBadge(inv.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" title="View Invoice" onClick={() => { setPreviewInvoice(inv); setPreviewType("invoice"); }}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        {inv.status === "paid" && (
                          <Button variant="ghost" size="sm" title="View Receipt" onClick={() => { setPreviewInvoice(inv); setPreviewType("receipt"); }}>
                            <Receipt className="h-4 w-4" />
                          </Button>
                        )}
                        {canEditFinance && inv.status !== "paid" && (
                          <Button variant="ghost" size="sm" title="Mark as Paid" onClick={() => markPaidMutation.mutate(inv.id)}>
                            <Badge variant="outline" className="text-xs">Pay</Badge>
                          </Button>
                        )}
                        {canEditFinance && (
                          <Button variant="ghost" size="sm" title="Delete" onClick={() => deleteMutation.mutate(inv.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewInvoice} onOpenChange={(open) => !open && setPreviewInvoice(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{previewType === "invoice" ? "Invoice" : "Receipt"} Preview</span>
              <Button onClick={handlePrint} size="sm">
                <Printer className="h-4 w-4 mr-2" /> Print / Save PDF
              </Button>
            </DialogTitle>
          </DialogHeader>
          {previewInvoice && (
            <div ref={printRef}>
              {previewType === "invoice" ? (
                <InvoiceTemplate data={{
                  invoice_number: previewInvoice.invoice_number,
                  invoice_date: previewInvoice.invoice_date,
                  client_name: previewInvoice.client_name,
                  client_address: previewInvoice.client_address || undefined,
                  client_phone: previewInvoice.client_phone || undefined,
                  client_email: previewInvoice.client_email || undefined,
                  items: previewInvoice.items,
                  subtotal: previewInvoice.subtotal,
                  tax_rate: previewInvoice.tax_rate,
                  tax_amount: previewInvoice.tax_amount,
                  total: previewInvoice.total,
                  title: previewInvoice.notes || undefined,
                }} />
              ) : (
                <ReceiptTemplate data={{
                  invoice_number: previewInvoice.invoice_number,
                  invoice_date: previewInvoice.invoice_date,
                  client_name: previewInvoice.client_name,
                  client_address: previewInvoice.client_address || undefined,
                  client_phone: previewInvoice.client_phone || undefined,
                  client_email: previewInvoice.client_email || undefined,
                  items: previewInvoice.items,
                  subtotal: previewInvoice.subtotal,
                  tax_rate: previewInvoice.tax_rate,
                  tax_amount: previewInvoice.tax_amount,
                  total: previewInvoice.total,
                  title: previewInvoice.notes || undefined,
                  payment_date: previewInvoice.payment_date || undefined,
                  payment_method: previewInvoice.payment_method || undefined,
                }} />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoicesManagement;
