import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "admin" | "finance" | "project_team" | "sales_marketing";

interface RolePermissions {
  role: AppRole | null;
  loading: boolean;
  canView: (section: string) => boolean;
  canEdit: (section: string) => boolean;
}

const viewPermissions: Record<AppRole, string[]> = {
  super_admin: ["dashboard", "projects", "hr", "finance", "requisitions", "blogs", "partners", "leads", "analytics", "ai-assistant", "users", "settings"],
  admin: ["dashboard", "projects", "hr", "finance", "requisitions", "blogs", "partners", "leads", "analytics", "ai-assistant", "users", "settings"],
  finance: ["dashboard", "projects", "finance", "requisitions", "partners", "leads", "analytics"],
  sales_marketing: ["dashboard", "projects", "blogs", "leads"],
  project_team: ["dashboard", "projects"],
};

const editPermissions: Record<AppRole, string[]> = {
  super_admin: ["dashboard", "projects", "hr", "finance", "requisitions", "blogs", "partners", "leads", "analytics", "ai-assistant", "users", "settings"],
  admin: ["dashboard", "projects", "hr", "blogs", "partners", "leads"],
  finance: ["dashboard", "finance", "requisitions"],
  sales_marketing: ["dashboard", "leads", "blogs"],
  project_team: [],
};

export const useUserRole = (): RolePermissions => {
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      setRole((data?.role as AppRole) || null);
      setLoading(false);
    };
    fetchRole();
  }, []);

  const canView = (section: string) => {
    if (!role) return false;
    return viewPermissions[role]?.includes(section) ?? false;
  };

  const canEdit = (section: string) => {
    if (!role) return false;
    return editPermissions[role]?.includes(section) ?? false;
  };

  return { role, loading, canView, canEdit };
};
