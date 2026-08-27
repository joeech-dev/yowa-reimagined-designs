import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Globe } from "lucide-react";
import { toast } from "sonner";

interface ProductOrder {
  id: string;
  product_title: string;
  product_type: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  country: string | null;
  amount: number | null;
  currency: string;
  status: string;
  internal_notes: string | null;
  created_at: string;
}

export const ORDER_STAGES = [
  { value: "new", label: "New order", hint: "Order form submitted — nobody has reached out yet." },
  { value: "contacted", label: "Contacted", hint: "Team has replied to the customer with next steps." },
  { value: "invoiced", label: "Invoiced", hint: "Payment request / invoice sent to the customer." },
  { value: "paid", label: "Paid", hint: "Payment confirmed." },
  { value: "delivered", label: "Delivered", hint: "Product handed over / download shared." },
  { value: "cancelled", label: "Cancelled", hint: "Customer withdrew or order abandoned." },
];

const stageVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
  if (status === "paid" || status === "delivered") return "default";
  if (status === "cancelled") return "destructive";
  if (status === "new") return "secondary";
  return "outline";
};

const ProductOrdersPanel = () => {
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [noteOrder, setNoteOrder] = useState<ProductOrder | null>(null);
  const [noteText, setNoteText] = useState("");

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("product_orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load orders");
    else setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStage = async (order: ProductOrder, status: string) => {
    const patch = {
      status,
      ...(status === "paid" ? { paid_at: new Date().toISOString() } : {}),
      ...(status === "delivered" ? { delivered_at: new Date().toISOString() } : {}),
    };

    const { error } = await supabase.from("product_orders").update(patch).eq("id", order.id);

    if (error) { toast.error("Could not update stage"); return; }
    toast.success(`Order moved to "${ORDER_STAGES.find(s => s.value === status)?.label}"`);
    fetchOrders();
  };

  const saveNote = async () => {
    if (!noteOrder) return;
    const { error } = await supabase
      .from("product_orders")
      .update({ internal_notes: noteText.trim() || null })
      .eq("id", noteOrder.id);
    if (error) { toast.error("Could not save note"); return; }
    toast.success("Note saved");
    setNoteOrder(null);
    fetchOrders();
  };

  const visible = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const counts = ORDER_STAGES.map(s => ({ ...s, count: orders.filter(o => o.status === s.value).length }));

  if (loading) return <p className="text-muted-foreground">Loading orders...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {counts.map(s => (
          <button
            key={s.value}
            onClick={() => setFilter(filter === s.value ? "all" : s.value)}
            className={`rounded-lg border p-3 text-left transition-colors ${filter === s.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
          >
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{o.product_title}</p>
                    {o.product_type && (
                      <p className="text-xs text-muted-foreground capitalize">{o.product_type.replace("_", " ")}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    <p className="font-medium">{o.customer_name}</p>
                    <a href={`mailto:${o.customer_email}`} className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                      <Mail className="h-3 w-3" />{o.customer_email}
                    </a>
                    {o.customer_phone && (
                      <span className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" />{o.customer_phone}</span>
                    )}
                    {o.country && (
                      <span className="flex items-center gap-1 text-muted-foreground"><Globe className="h-3 w-3" />{o.country}</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {o.amount != null ? `${o.currency} ${o.amount}` : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Badge variant={stageVariant(o.status)} className="w-fit capitalize">
                        {ORDER_STAGES.find(s => s.value === o.status)?.label || o.status}
                      </Badge>
                      <Select value={o.status} onValueChange={(v) => updateStage(o, v)}>
                        <SelectTrigger className="h-8 w-[150px]" aria-label={`Change stage for ${o.product_title} order`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STAGES.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setNoteOrder(o); setNoteText(o.internal_notes || ""); }}
                    >
                      {o.internal_notes ? "Edit note" : "Add note"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No orders in this stage yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-2">
          <h2 className="font-semibold">How the order process works</h2>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal pl-5">
            {ORDER_STAGES.map(s => (
              <li key={s.value}><span className="font-medium text-foreground">{s.label}</span> — {s.hint}</li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground pt-2">
            The team is emailed automatically the moment an order reaches the "New order" stage.
          </p>
        </CardContent>
      </Card>

      <Dialog open={!!noteOrder} onOpenChange={(open) => !open && setNoteOrder(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Internal note</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Label>Note for {noteOrder?.customer_name}</Label>
            <Textarea rows={5} value={noteText} onChange={e => setNoteText(e.target.value)} />
            <Button onClick={saveNote} className="w-full">Save note</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductOrdersPanel;
