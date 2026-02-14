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
  UserCheck,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/Yowa_Logo_1.png";
import { useUserRole } from "@/hooks/useUserRole";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";


const allMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin", section: "dashboard" },
  { icon: FolderKanban, label: "Projects", path: "/admin/projects", section: "projects" },
  { icon: ClipboardList, label: "Tasks", path: "/admin/tasks", section: "dashboard" },
  { icon: UserCheck, label: "HR", path: "/admin/hr", section: "hr" },
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
  const { canView, role } = useUserRole();
  const { profile } = useProfile();

  const menuItems = allMenuItems.filter(item => canView(item.section));

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const initials = profile?.full_name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <aside className="hidden md:flex w-64 min-h-screen bg-foreground flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Yowa" className="h-10 w-auto brightness-0 invert" />
          <div>
            <span className="font-bold text-lg text-white">Yowa</span>
            <div className="flex items-center gap-1 text-xs text-secondary">
              <Sparkles className="h-3 w-3" />
              <span>AI Dashboard</span>
            </div>
          </div>
        </Link>
      </div>

      {/* User Profile */}
      {profile && (
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-white/20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile.full_name || "Team Member"}
              </p>
              <p className="text-xs text-white/50 truncate">
                {profile.position || role?.replace("_", " ") || ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
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

      {/* Sign Out */}
      <div className="p-4 border-t border-white/10 space-y-2">
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
