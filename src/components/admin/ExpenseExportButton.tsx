import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import { toast } from "sonner";
import { Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

const ExpenseExportButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { data: categories = [] } = useExpenseCategories();
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    status: "all",
    category: "all",
    projectId: "all",
  });

  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);

  const loadProjects = async () => {
    const { data } = await supabase.from("projects").select("id, title").order("title");
    setProjects(data || []);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      let query = supabase
        .from("expense_requisitions")
        .select("*, projects(title)")
        .order("created_at", { ascending: false });

      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo + "T23:59:59");
      }
      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters.category !== "all") {
        query = query.eq("category", filters.category);
      }
      if (filters.projectId !== "all") {
        query = query.eq("project_id", filters.projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info("No requisitions found with the selected filters");
        setExporting(false);
        return;
      }

      // Format data for export
      const exportData = data.map((req: any) => ({
        "Date": new Date(req.created_at).toLocaleDateString(),
        "Title": req.title,
        "Description": req.description,
        "Category": req.category,
        "Amount (UGX)": Number(req.amount),
        "Status": req.status === "approved" ? "Approved" :
                  req.status === "finance_approved" ? "Finance Approved" :
                  req.status === "rejected" ? "Rejected" : "Pending",
        "Project": req.projects?.title || "N/A",
        "Rejection Reason": req.rejection_reason || "",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Expense Requisitions");

      // Auto-size columns
      const colWidths = Object.keys(exportData[0]).map(key => ({
        wch: Math.max(key.length, ...exportData.map((row: any) => String(row[key] || "").length)) + 2
      }));
      ws["!cols"] = colWidths;

      const fileName = `expense_requisitions_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Exported ${data.length} requisitions`);
      setIsOpen(false);
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (open) loadProjects(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Export Expense Requisitions
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
          <div>
            <Label>Status</Label>
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="finance_approved">Finance Approved</SelectItem>
                <SelectItem value="approved">Fully Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Project</Label>
            <Select value={filters.projectId} onValueChange={(v) => setFilters({ ...filters, projectId: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleExport} className="w-full" disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Download Excel File"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseExportButton;
