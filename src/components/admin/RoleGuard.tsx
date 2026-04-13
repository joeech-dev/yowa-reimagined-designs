import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";

interface RoleGuardProps {
  section: string;
  children: React.ReactNode;
}

const RoleGuard = ({ section, children }: RoleGuardProps) => {
  const { canView, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!canView(section)) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2">
              <ShieldX className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to access this section. Contact your administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
