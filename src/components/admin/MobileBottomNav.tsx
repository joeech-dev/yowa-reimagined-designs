import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  DollarSign,
  Users,
  MoreHorizontal,
  FileText,
  Building2,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
  UserCheck,
  ClipboardList,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const primaryTabs = [
  { icon: LayoutDashboard, label: "Home", path: "/admin", section: "dashboard" },
  { icon: FolderKanban, label: "Projects", path: "/admin/projects", section: "projects" },
  { icon: DollarSign, label: "Finance", path: "/admin/finance", section: "finance" },
  { icon: Users, label: "Leads", path: "/admin/leads", section: "leads" },
];

const moreItems = [
  { icon: ClipboardList, label: "Tasks", path: "/admin/tasks", section: "dashboard" },
  { icon: UserCheck, label: "HR", path: "/admin/hr", section: "hr" },
  { icon: FileText, label: "Billing", path: "/admin/billing", section: "finance" },
  { icon: FileText, label: "Blog Posts", path: "/admin/blogs", section: "blogs" },
  { icon: Building2, label: "Partners", path: "/admin/partners", section: "partners" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics", section: "analytics" },
  { icon: Sparkles, label: "AI Assistant", path: "/admin/ai-assistant", section: "ai-assistant" },
  { icon: Users, label: "Users", path: "/admin/users", section: "users" },
  { icon: Settings, label: "Settings", path: "/admin/settings", section: "settings" },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { canView } = useUserRole();
  const [moreOpen, setMoreOpen] = useState(false);

  const visibleTabs = primaryTabs.filter(item => canView(item.section));
  const visibleMore = moreItems.filter(item => canView(item.section));

  const isInMore = visibleMore.some(item => location.pathname === item.path);

  const handleSignOut = async () => {
    setMoreOpen(false);
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-foreground border-t border-white/10 safe-area-bottom md:hidden">
        <div className="flex items-center justify-around h-16">
          {visibleTabs.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] transition-colors",
                  isActive
                    ? "text-secondary font-semibold"
                    : "text-white/60"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* More button */}
          {visibleMore.length > 0 && (
            <button
              onClick={() => setMoreOpen(true)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] transition-colors",
                isInMore ? "text-secondary font-semibold" : "text-white/60"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span>More</span>
            </button>
          )}
        </div>
      </nav>

      {/* More menu sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-2 pb-8">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-base">More</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2">
            {visibleMore.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-center leading-tight">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-6 w-6" />
              <span>Sign Out</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileBottomNav;
