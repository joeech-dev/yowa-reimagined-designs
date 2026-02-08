import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ExpenseCategory {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export const useExpenseCategories = (includeInactive = false) => {
  return useQuery({
    queryKey: ["expense-categories", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("expense_categories")
        .select("*")
        .order("display_order");
      
      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ExpenseCategory[];
    },
  });
};
