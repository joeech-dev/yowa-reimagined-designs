import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";

const ExpenseCategoriesManager = () => {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useExpenseCategories(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.display_order)) + 1 : 1;
      const { error } = await supabase.from("expense_categories").insert([{
        name,
        display_order: maxOrder,
        created_by: user.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      toast.success("Category added");
      setNewCategoryName("");
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("expense_categories").update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      toast.success("Category updated");
      setEditingId(null);
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("expense_categories").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      toast.success("Category status updated");
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expense_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      toast.success("Category deleted");
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addMutation.mutate(newCategoryName.trim());
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const saveEdit = () => {
    if (editingId && editingName.trim()) {
      updateMutation.mutate({ id: editingId, name: editingName.trim() });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
          <CardDescription>
            Customize the expense categories used across all requisition forms. Changes apply company-wide.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new category */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name..."
              className="max-w-xs"
            />
            <Button type="submit" disabled={addMutation.isPending || !newCategoryName.trim()}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </form>

          {/* Categories list */}
          {isLoading ? (
            <p className="text-muted-foreground">Loading categories...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Category Name</TableHead>
                  <TableHead className="w-24">Active</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat, idx) => (
                  <TableRow key={cat.id}>
                    <TableCell className="text-muted-foreground">
                      <GripVertical className="h-4 w-4 inline" /> {idx + 1}
                    </TableCell>
                    <TableCell>
                      {editingId === cat.id ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="max-w-xs h-8"
                            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                          />
                          <Button size="sm" variant="ghost" onClick={saveEdit}>
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span
                          className={`cursor-pointer hover:underline ${!cat.is_active ? "text-muted-foreground line-through" : ""}`}
                          onClick={() => startEdit(cat.id, cat.name)}
                        >
                          {cat.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={cat.is_active}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: cat.id, is_active: checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(cat.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No categories yet. Add your first one above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseCategoriesManager;
