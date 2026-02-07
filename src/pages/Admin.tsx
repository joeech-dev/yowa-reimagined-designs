import { useEffect, useState } from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardStats from "@/components/admin/DashboardStats";
import BlogsManagement from "@/components/admin/BlogsManagement";
import PartnersManagement from "@/components/admin/PartnersManagement";
import LeadsManagement from "@/components/admin/LeadsManagement";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import FinanceManagement from "@/components/admin/FinanceManagement";
import ProjectsManagement from "@/components/admin/ProjectsManagement";
import AIAssistantPanel from "@/components/admin/AIAssistantPanel";
import ExpenseRequisitionForm from "@/components/admin/ExpenseRequisitionForm";
import UserManagement from "@/components/admin/UserManagement";
import OnlineUsersWidget from "@/components/admin/OnlineUsersWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, FolderKanban, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    leadsCount: 0,
    blogsCount: 0,
    partnersCount: 0,
    newLeadsThisMonth: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [leadsRes, blogsRes, partnersRes] = await Promise.all([
      supabase.from("leads").select("id, created_at", { count: "exact" }),
      supabase.from("blog_posts").select("id", { count: "exact" }),
      supabase.from("partner_brands").select("id", { count: "exact" }),
    ]);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newLeadsCount = leadsRes.data?.filter(
      (lead) => new Date(lead.created_at || "") >= startOfMonth
    ).length || 0;

    setStats({
      leadsCount: leadsRes.count || 0,
      blogsCount: blogsRes.count || 0,
      partnersCount: partnersRes.count || 0,
      newLeadsThisMonth: newLeadsCount,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your business.</p>
      </div>

      <DashboardStats {...stats} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-primary transition-smooth cursor-pointer">
          <Link to="/admin/projects">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2"><FolderKanban className="h-4 w-4" /> Projects</span>
                <ArrowRight className="h-4 w-4" />
              </CardTitle>
              <CardDescription>Manage active projects</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-primary transition-smooth cursor-pointer">
          <Link to="/admin/finance">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Finance</span>
                <ArrowRight className="h-4 w-4" />
              </CardTitle>
              <CardDescription>Track income & expenses</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-primary transition-smooth cursor-pointer">
          <Link to="/admin/leads">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Recent Leads
                <ArrowRight className="h-4 w-4" />
              </CardTitle>
              <CardDescription>View and manage new inquiries</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-primary transition-smooth cursor-pointer">
          <Link to="/admin/analytics">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Analytics
                <ArrowRight className="h-4 w-4" />
              </CardTitle>
              <CardDescription>View business insights</CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>

      {/* Online Users + AI Assistant Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OnlineUsersWidget />
        <Card className="lg:col-span-2 bg-primary/5 border-primary/20 cursor-pointer hover:shadow-md transition-all" onClick={() => window.location.href = "/admin/ai-assistant"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-secondary" />
              AI Assistant
              <Badge variant="secondary" className="text-xs">Active</Badge>
            </CardTitle>
            <CardDescription>Your intelligent business companion</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Generate blog posts, analyze leads, schedule follow-ups, and convert projects into content — all powered by AI.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/ai-assistant">
                <Sparkles className="h-4 w-4 mr-2" />
                Open AI Assistant
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AdminSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Settings</CardTitle>
      <CardDescription>Configure your dashboard preferences</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Settings panel coming soon...</p>
    </CardContent>
  </Card>
);

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAdminRole = async (userId: string, retries = 3): Promise<boolean> => {
      for (let i = 0; i < retries; i++) {
        try {
          const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId)
            .maybeSingle();
          if (error) {
            console.error("Role check error (attempt " + (i + 1) + "):", error);
            if (i < retries - 1) {
              await new Promise(r => setTimeout(r, 500 * (i + 1)));
              continue;
            }
            return false;
          }
          return !!data;
        } catch (error) {
          console.error("Error checking role:", error);
          if (i < retries - 1) {
            await new Promise(r => setTimeout(r, 500 * (i + 1)));
            continue;
          }
          return false;
        }
      }
      return false;
    };

    // Set up auth listener FIRST (for ongoing changes)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
          navigate("/auth", { replace: true });
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          // Don't block on role check for listener
          checkAdminRole(session.user.id).then(hasAdmin => {
            if (isMounted) setIsAdmin(hasAdmin);
          });
        }
      }
    );

    // THEN do initial load (controls loading state)
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (!session?.user) {
          navigate("/auth", { replace: true });
          return;
        }
        
        setUser(session.user);
        
        // AWAIT role check before setting loading false
        const hasAdminRole = await checkAdminRole(session.user.id);
        
        if (!isMounted) return;
        
        if (!hasAdminRole) {
          toast.error("You don't have admin access");
          navigate("/", { replace: true });
          return;
        }
        
        setIsAdmin(true);
      } catch (error) {
        console.error("Auth check error:", error);
        if (isMounted) {
          navigate("/auth", { replace: true });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

const Admin = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboardHome />} />
        <Route path="projects" element={<ProjectsManagement />} />
        <Route path="finance" element={<FinanceManagement />} />
        <Route path="requisitions" element={<ExpenseRequisitionForm />} />
        <Route path="blogs" element={<BlogsManagement />} />
        <Route path="partners" element={<PartnersManagement />} />
        <Route path="leads" element={<LeadsManagement />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="ai-assistant" element={<AIAssistantPanel />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;
