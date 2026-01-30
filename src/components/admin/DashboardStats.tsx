import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, FileText, Building2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const StatCard = ({ title, value, change, icon: Icon, description }: StatCardProps) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className="shadow-card hover:shadow-primary transition-smooth">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {isPositive && <TrendingUp className="h-4 w-4 text-green-600" />}
            {isNegative && <TrendingDown className="h-4 w-4 text-red-600" />}
            <span className={cn(
              "text-sm font-medium",
              isPositive && "text-green-600",
              isNegative && "text-red-600",
              !isPositive && !isNegative && "text-muted-foreground"
            )}>
              {isPositive && "+"}{change}%
            </span>
            <span className="text-sm text-muted-foreground">from last month</span>
          </div>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  leadsCount: number;
  blogsCount: number;
  partnersCount: number;
  newLeadsThisMonth: number;
}

const DashboardStats = ({ leadsCount, blogsCount, partnersCount, newLeadsThisMonth }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Leads"
        value={leadsCount}
        change={12}
        icon={Users}
      />
      <StatCard
        title="New Leads"
        value={newLeadsThisMonth}
        change={8}
        icon={Mail}
        description="This month"
      />
      <StatCard
        title="Blog Posts"
        value={blogsCount}
        icon={FileText}
      />
      <StatCard
        title="Partner Brands"
        value={partnersCount}
        icon={Building2}
      />
    </div>
  );
};

export default DashboardStats;
