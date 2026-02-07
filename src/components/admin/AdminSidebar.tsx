import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Sparkles,
  DollarSign,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/Yowa_Logo_1.png";
import { useUserRole } from "@/hooks/useUserRole";

const allMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin", section: "dashboard" },
  { icon: FolderKanban, label: "Projects", path: "/admin/projects", section: "projects" },
  { icon: DollarSign, label: "Finance", path: "/admin/finance", section: "finance" },
  { icon: FileText, label: "Blog Posts", path: "/admin/blogs", section: "blogs" },
  { icon: Building2, label: "Partner Brands", path: "/admin/partners", section: "partners" },
  { icon: Users, label: "Leads", path: "/admin/leads", section: "leads" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics", section: "analytics" },
  { icon: Sparkles, label: "AI Assistant", path: "/admin/ai-assistant", section: "ai-assistant" },
  { icon: Users, label: "Users", path: "/admin/users", section: "users" },
  { icon: Settings, label: "Settings", path: "/admin/settings", section: "settings" },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { canView } = useUserRole();

  const menuItems = allMenuItems.filter(item => canView(item.section));

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-foreground flex flex-col">
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Yowa" className="h-10 w-auto" />
          <div>
            <span className="font-bold text-lg text-white">Yowa</span>
            <div className="flex items-center gap-1 text-xs text-secondary">
              <Sparkles className="h-3 w-3" />
              <span>AI Dashboard</span>
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth",
                isActive 
                  ? "bg-primary text-white font-medium" 
                  : "hover:bg-white/10 text-white/90"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full hover:bg-white/10 text-white/90 transition-smooth"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
