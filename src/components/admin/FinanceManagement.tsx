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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { useUserRole } from "@/hooks/useUserRole";
import ExpenseRequisitionForm from "./ExpenseRequisitionForm";
import ExpenseCategoriesManager from "./ExpenseCategoriesManager";
import ExpenseExportButton from "./ExpenseExportButton";

type TransactionType = "income" | "expense";

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  project_id: string | null;
  transaction_date: string;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
}

const categories = {
  income: ["Project Payment", "Retainer", "Consultation", "Other Income"],
  expense: ["Equipment", "Software", "Travel", "Marketing", "Salaries", "Utilities", "Other Expense"],
};

const FinanceManagement = () => {
  const queryClient = useQueryClient();
  const { canEdit } = useUserRole();
  const canEditFinance = canEdit("finance");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    type: "income" as TransactionType,
    amount: "",
    description: "",
    category: "",
    project_id: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["finance-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("finance_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title")
        .order("title");
      if (error) throw error;
      return data as Project[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("finance_transactions").insert([{
        type: data.type,
        amount: parseFloat(data.amount),
        description: data.description,
        category: data.category,
        project_id: data.project_id || null,
        transaction_date: data.transaction_date,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-transactions"] });
      toast.success("Transaction added successfully");
      resetForm();
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const { error } = await supabase.from("finance_transactions")
        .update({
          type: data.type,
          amount: parseFloat(data.amount),
          description: data.description,
          category: data.category,
          project_id: data.project_id || null,
          transaction_date: data.transaction_date,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-transactions"] });
      toast.success("Transaction updated successfully");
      resetForm();
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("finance_transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-transactions"] });
      toast.success("Transaction deleted");
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const resetForm = () => {
    setFormData({
      type: "income",
      amount: "",
      description: "",
      category: "",
      project_id: "",
      transaction_date: new Date().toISOString().split("T")[0],
    });
    setEditingTransaction(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      project_id: transaction.project_id || "",
      transaction_date: transaction.transaction_date,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
      updateMutation.mutate({ ...formData, id: editingTransaction.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Finance Management</h2>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
          {canEditFinance && <TabsTrigger value="categories">Expense Categories</TabsTrigger>}
        </TabsList>

        <TabsContent value="transactions" className="space-y-6 mt-4">
          <div className="flex justify-end">
            {canEditFinance && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingTransaction ? "Edit" : "Add"} Transaction</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label>Type</Label>
                      <Select value={formData.type} onValueChange={(v: TransactionType) => setFormData({ ...formData, type: v, category: "" })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Amount ($)</Label>
                      <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {categories[formData.type].map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
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
                    <div>
                      <Label>Date</Label>
                      <Input type="date" value={formData.transaction_date} onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })} required />
                    </div>
                    <Button type="submit" className="w-full">{editingTransaction ? "Update" : "Add"} Transaction</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${totalExpense.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${netProfit.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      {canEditFinance && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{format(new Date(t.transaction_date), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${t.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {t.type}
                          </span>
                        </TableCell>
                        <TableCell>{t.category}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{t.description}</TableCell>
                        <TableCell className={`text-right font-medium ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                          {t.type === "income" ? "+" : "-"}${Number(t.amount).toLocaleString()}
                        </TableCell>
                        {canEditFinance && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requisitions" className="mt-4">
          <div className="flex justify-end mb-4">
            <ExpenseExportButton />
          </div>
          <ExpenseRequisitionForm />
        </TabsContent>

        {canEditFinance && (
          <TabsContent value="categories" className="mt-4">
            <ExpenseCategoriesManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default FinanceManagement;
