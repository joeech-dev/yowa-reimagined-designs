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
import { toast } from "sonner";
import { Plus, Printer, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { useUserRole } from "@/hooks/useUserRole";
import QuotationTemplate from "./QuotationTemplate";
import type { InvoiceItem } from "./InvoiceTemplate";

interface QuotationRow {
  id: string;
  quotation_number: string;
  quotation_date: string;
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
  requested_by: string | null;
  provided_by: string | null;
  created_at: string;
}

const defaultItem: InvoiceItem = { description: "", quantity: "1", unit_cost: 0, total: 0 };

const QuotationsManagement = () => {
  const queryClient = useQueryClient();
  const { canEdit } = useUserRole();
  const canEditFinance = canEdit("finance");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewQuotation, setPreviewQuotation] = useState<QuotationRow | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    quotation_number: "",
    quotation_date: new Date().toISOString().split("T")[0],
    client_name: "",
    client_address: "",
    client_phone: "",
    client_email: "",
    title: "",
    items: [{ ...defaultItem }] as InvoiceItem[],
    tax_rate: 0,
    notes: "",
    project_id: "",
    requested_by: "",
    provided_by: "Yowa Innovations Ltd",
  });

  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ["quotations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((q: any) => ({
        ...q,
        items: (typeof q.items === "string" ? JSON.parse(q.items) : q.items) as InvoiceItem[],
      })) as QuotationRow[];
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
    const total = subtotal + taxAmount;
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
      const { error } = await supabase.from("quotations").insert([{
        quotation_number: form.quotation_number,
        quotation_date: form.quotation_date,
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
        requested_by: form.requested_by || null,
        provided_by: form.provided_by || null,
        created_by: user.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation created");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quotations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => {
    setForm({
      quotation_number: "", quotation_date: new Date().toISOString().split("T")[0],
      client_name: "", client_address: "", client_phone: "", client_email: "",
      title: "", items: [{ ...defaultItem }], tax_rate: 0, notes: "", project_id: "",
      requested_by: "", provided_by: "Yowa Innovations Ltd",
    });
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Quotation</title>
      <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: system-ui, -apple-system, sans-serif; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style></head><body>
      ${printRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); createMutation.mutate(); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quotations</h2>
        {canEditFinance && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> New Quotation</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Quotation</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Quotation Number</Label><Input value={form.quotation_number} onChange={(e) => setForm({ ...form, quotation_number: e.target.value })} placeholder="e.g. QT-001" required /></div>
                  <div><Label>Date</Label><Input type="date" value={form.quotation_date} onChange={(e) => setForm({ ...form, quotation_date: e.target.value })} required /></div>
                </div>
                <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Video Production Services" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Client Name</Label><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required /></div>
                  <div><Label>Client Email</Label><Input type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Client Address</Label><Textarea value={form.client_address} onChange={(e) => setForm({ ...form, client_address: e.target.value })} rows={2} /></div>
                  <div><Label>Client Phone</Label><Input value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} /></div>
                </div>
                <div><Label>Linked Project</Label>
                  <Select value={form.project_id || "none"} onValueChange={(v) => setForm({ ...form, project_id: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent><SelectItem value="none">None</SelectItem>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Requested By</Label><Input value={form.requested_by} onChange={(e) => setForm({ ...form, requested_by: e.target.value })} placeholder="Client representative" /></div>
                  <div><Label>Provided By</Label><Input value={form.provided_by} onChange={(e) => setForm({ ...form, provided_by: e.target.value })} /></div>
                </div>
                {/* Line Items */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Line Items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" /> Add Item</Button>
                  </div>
                  {form.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                      <Input className="col-span-5" placeholder="Description" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} required />
                      <Input className="col-span-2" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} required />
                      <Input className="col-span-2" type="number" placeholder="Unit Cost" value={item.unit_cost || ""} onChange={(e) => updateItem(i, "unit_cost", parseFloat(e.target.value) || 0)} required />
                      <div className="col-span-2 flex items-center text-sm font-medium">{Number(item.total).toLocaleString()}/=</div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)} className="col-span-1" disabled={form.items.length <= 1}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Tax Rate (%)</Label><Input type="number" step="0.01" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: parseFloat(e.target.value) || 0 })} /></div>
                  <div className="flex items-end">
                    <div className="text-sm space-y-1">
                      <p>Subtotal: <strong>{calculateTotals(form.items, form.tax_rate).subtotal.toLocaleString()}/=</strong></p>
                      {form.tax_rate > 0 && <p>Tax: <strong>{calculateTotals(form.items, form.tax_rate).taxAmount.toLocaleString()}/=</strong></p>}
                      <p className="text-base">Total: <strong className="text-primary">{calculateTotals(form.items, form.tax_rate).total.toLocaleString()}/=</strong></p>
                    </div>
                  </div>
                </div>
                <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Additional terms or conditions" /></div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>{createMutation.isPending ? "Creating..." : "Create Quotation"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>All Quotations</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p>Loading...</p> : quotations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No quotations yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quotation #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Total (UGX)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.quotation_number}</TableCell>
                    <TableCell>{format(new Date(q.quotation_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{q.client_name}</TableCell>
                    <TableCell className="text-right font-medium">{Number(q.total).toLocaleString()}/=</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" title="View" onClick={() => setPreviewQuotation(q)}><FileText className="h-4 w-4" /></Button>
                        {canEditFinance && <Button variant="ghost" size="sm" title="Delete" onClick={() => deleteMutation.mutate(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
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
      <Dialog open={!!previewQuotation} onOpenChange={(open) => !open && setPreviewQuotation(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Quotation Preview</span>
              <Button onClick={handlePrint} size="sm"><Printer className="h-4 w-4 mr-2" /> Print / Save PDF</Button>
            </DialogTitle>
          </DialogHeader>
          {previewQuotation && (
            <div ref={printRef}>
              <QuotationTemplate data={{
                quotation_number: previewQuotation.quotation_number,
                quotation_date: previewQuotation.quotation_date,
                client_name: previewQuotation.client_name,
                client_address: previewQuotation.client_address || undefined,
                client_phone: previewQuotation.client_phone || undefined,
                client_email: previewQuotation.client_email || undefined,
                items: previewQuotation.items,
                subtotal: previewQuotation.subtotal,
                tax_rate: previewQuotation.tax_rate,
                tax_amount: previewQuotation.tax_amount,
                total: previewQuotation.total,
                notes: previewQuotation.notes || undefined,
                requested_by: previewQuotation.requested_by || undefined,
                provided_by: previewQuotation.provided_by || undefined,
              }} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuotationsManagement;
