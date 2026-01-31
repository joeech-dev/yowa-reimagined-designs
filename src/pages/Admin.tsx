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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Clock, ArrowRight } from "lucide-react";
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <Link to="/admin/blogs">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Content Hub
                <ArrowRight className="h-4 w-4" />
              </CardTitle>
              <CardDescription>Create and manage blog posts</CardDescription>
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

      {/* AI Assistant Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-secondary" />
            AI Assistant
          </CardTitle>
          <CardDescription>Your intelligent business companion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">
                The AI assistant can help you with content creation, lead analysis, 
                and business recommendations. It's integrated throughout the dashboard.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Blog Post
                </Button>
                <Button variant="outline" size="sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Followups
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (!session?.user) {
          navigate("/auth", { replace: true });
          return;
        }
        
        setUser(session.user);
        
        // Check admin role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        if (!isMounted) return;
        
        if (!roleData) {
          toast.error("You don't have admin access");
          navigate("/", { replace: true });
          return;
        }
        
        setIsAdmin(true);
        setAuthChecked(true);
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

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      if (event === 'SIGNED_OUT') {
        navigate("/auth", { replace: true });
        return;
      }
      
      if (session?.user && !authChecked) {
        setUser(session.user);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, authChecked]);

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
        <Route path="blogs" element={<BlogsManagement />} />
        <Route path="partners" element={<PartnersManagement />} />
        <Route path="leads" element={<LeadsManagement />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;
