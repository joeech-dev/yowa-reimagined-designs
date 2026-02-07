import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, AlertTriangle } from "lucide-react";

const expenseCategories = [
  "Equipment", "Software", "Travel", "Marketing", "Salaries",
  "Utilities", "Production Costs", "Office Supplies", "Other"
];

interface NewRequisitionButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
}

const NewRequisitionButton = ({ variant = "outline", size = "default", className, label = "New Requisition" }: NewRequisitionButtonProps) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    category: "",
    project_id: "",
  });

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
      toast.success("Expense requisition submitted to Finance");
      setFormData({ title: "", description: "", amount: "", category: "", project_id: "" });
      setIsOpen(false);
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Plus className="mr-2 h-4 w-4" /> {label}
        </Button>
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
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
  );
};

export default NewRequisitionButton;
