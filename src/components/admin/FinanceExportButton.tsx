import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, FileSpreadsheet } from "lucide-react";

const escapeCsvValue = (value: string | number | null | undefined): string => {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const exportToCsv = (data: Record<string, unknown>[], fileName: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.map(escapeCsvValue).join(","),
    ...data.map(row => headers.map(h => escapeCsvValue(row[h] as string | number | null)).join(","))
  ];
  const csvContent = csvRows.join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const FinanceExportButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    type: "all",
    reportType: "transactions",
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      if (filters.reportType === "transactions") {
        let query = supabase
          .from("finance_transactions")
          .select("*, projects(title)")
          .order("transaction_date", { ascending: false });

        if (filters.dateFrom) query = query.gte("transaction_date", filters.dateFrom);
        if (filters.dateTo) query = query.lte("transaction_date", filters.dateTo);
        if (filters.type !== "all") query = query.eq("type", filters.type);

        const { data, error } = await query;
        if (error) throw error;
        if (!data || data.length === 0) { toast.info("No transactions found"); setExporting(false); return; }

        const exportData = data.map((t: Record<string, unknown> & { projects?: { title?: string } }) => ({
          "Date": new Date(t.transaction_date as string).toLocaleDateString(),
          "Type": t.type === "income" ? "Income" : "Expense",
          "Category": t.category,
          "Description": t.description,
          "Amount (UGX)": Number(t.amount),
          "Project": t.projects?.title || "N/A",
        }));

        const totalIncome = data.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
        const totalExpense = data.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
        exportData.push(
          { "Date": "", "Type": "", "Category": "", "Description": "TOTAL INCOME", "Amount (UGX)": totalIncome, "Project": "" },
          { "Date": "", "Type": "", "Category": "", "Description": "TOTAL EXPENSES", "Amount (UGX)": totalExpense, "Project": "" },
          { "Date": "", "Type": "", "Category": "", "Description": "NET PROFIT", "Amount (UGX)": totalIncome - totalExpense, "Project": "" },
        );

        exportToCsv(exportData, `finance_transactions_${new Date().toISOString().split("T")[0]}.csv`);
        toast.success(`Exported ${data.length} transactions`);

      } else {
        // Full combined report: income + expenses + requisitions summary
        const [txRes, reqRes] = await Promise.all([
          supabase.from("finance_transactions").select("*, projects(title)").order("transaction_date", { ascending: false }),
          supabase.from("expense_requisitions").select("*, projects(title)").order("created_at", { ascending: false }),
        ]);
        if (txRes.error) throw txRes.error;
        if (reqRes.error) throw reqRes.error;

        const txData = (txRes.data || []).map((t: Record<string, unknown> & { projects?: { title?: string } }) => ({
          "Sheet": "Transactions",
          "Date": new Date(t.transaction_date as string).toLocaleDateString(),
          "Type": t.type === "income" ? "Income" : "Expense",
          "Category": t.category,
          "Description": t.description,
          "Amount (UGX)": Number(t.amount),
          "Project": t.projects?.title || "N/A",
          "Status": "Recorded",
        }));

        const reqData = (reqRes.data || []).map((r: Record<string, unknown> & { projects?: { title?: string } }) => ({
          "Sheet": "Requisitions",
          "Date": new Date(r.created_at as string).toLocaleDateString(),
          "Type": "Expense",
          "Category": r.category,
          "Description": `${r.title} — ${r.description}`,
          "Amount (UGX)": Number(r.amount),
          "Project": r.projects?.title || "N/A",
          "Status": r.status === "paid" ? "Paid/Recorded" : r.status === "approved" ? "Approved (Unpaid)" : String(r.status),
        }));

        exportToCsv([...txData, ...reqData], `finance_full_report_${new Date().toISOString().split("T")[0]}.csv`);
        toast.success(`Exported full report (${txData.length} transactions + ${reqData.length} requisitions)`);
      }

      setIsOpen(false);
    } catch (error: unknown) {
      toast.error(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Download Finance Report
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Report Type</Label>
            <Select value={filters.reportType} onValueChange={(v) => setFilters({ ...filters, reportType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="transactions">Transactions Only (Income & Expenses)</SelectItem>
                <SelectItem value="full">Full Report (Transactions + Requisitions)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filters.reportType === "transactions" && (
            <div>
              <Label>Transaction Type</Label>
              <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All (Income & Expenses)</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                  <SelectItem value="expense">Expenses Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>From Date</Label>
              <Input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
            </div>
            <div>
              <Label>To Date</Label>
              <Input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            The CSV file includes totals summary row at the bottom. Open with Excel, Google Sheets, or any spreadsheet app.
          </p>
          <Button onClick={handleExport} className="w-full" disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Generating..." : "Download CSV Spreadsheet"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinanceExportButton;
