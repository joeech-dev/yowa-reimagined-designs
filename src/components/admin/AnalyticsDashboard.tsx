import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, Users, Eye, Clock, BarChart3, Globe, Monitor, Smartphone, Tablet, Facebook, Instagram, Linkedin, Twitter, Youtube, Share2, MessageCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useGA4Analytics } from "@/hooks/useGA4Analytics";
import { Skeleton } from "@/components/ui/skeleton";

const DEVICE_COLORS = ["hsl(164, 100%, 25%)", "hsl(46, 93%, 56%)", "hsl(160, 50%, 40%)"];
const BROWSER_COLORS = ["hsl(164, 100%, 25%)", "hsl(46, 93%, 56%)", "hsl(160, 50%, 40%)", "hsl(160, 30%, 60%)", "hsl(200, 50%, 50%)"];

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

const MetricCard = ({ title, value, change, icon: Icon, suffix }: {
  title: string; value: string | number; change: number; icon: React.ComponentType<{ className?: string }>; suffix?: string;
}) => {
  const isPositive = change > 0;
  return (
    <Card className="shadow-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-primary">{value}{suffix}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <p className={`text-xs mt-2 ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? "↑" : "↓"} {Math.abs(change)}% from previous period
        </p>
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-80" />
      <Skeleton className="h-80" />
    </div>
  </div>
);

const DeviceIcon = ({ device }: { device: string }) => {
  const d = device.toLowerCase();
  if (d === "mobile") return <Smartphone className="h-4 w-4" />;
  if (d === "tablet") return <Tablet className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
};

const AnalyticsDashboard = () => {
  const { data, isLoading, error } = useGA4Analytics();

  if (isLoading) return <LoadingSkeleton />;
  if (error || !data) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Failed to load analytics data. Please check your GA4 configuration.</p>
        <p className="text-sm text-destructive mt-2">{error?.message}</p>
      </Card>
    );
  }

  const { overview, trafficByCountry, trafficByDevice, trafficByBrowser, dailyPageViews, trafficBySource } = data;

  const SOCIAL_PLATFORMS = [
    { key: "facebook", label: "Facebook", icon: Facebook, color: "hsl(220, 46%, 48%)" },
    { key: "instagram", label: "Instagram", icon: Instagram, color: "hsl(340, 75%, 54%)" },
    { key: "linkedin", label: "LinkedIn", icon: Linkedin, color: "hsl(210, 80%, 42%)" },
    { key: "twitter", label: "Twitter/X", icon: Twitter, color: "hsl(203, 89%, 53%)" },
    { key: "youtube", label: "YouTube", icon: Youtube, color: "hsl(0, 100%, 42%)" },
    { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "hsl(142, 70%, 40%)" },
    { key: "tiktok", label: "TikTok", icon: MessageCircle, color: "hsl(343, 80%, 50%)" },
  ];

  const socialTraffic = SOCIAL_PLATFORMS.map((platform) => {
    const matching = trafficBySource.filter(
      (r) => r.source.toLowerCase().includes(platform.key) || r.medium.toLowerCase().includes(platform.key)
    );
    const sessions = matching.reduce((s, r) => s + r.sessions, 0);
    const users = matching.reduce((s, r) => s + r.users, 0);
    return { ...platform, sessions, users };
  });

  const totalSocialSessions = socialTraffic.reduce((s, p) => s + p.sessions, 0);

  const devicePieData = trafficByDevice.map((d, i) => ({
    name: d.dimension,
    value: d.sessions,
    color: DEVICE_COLORS[i % DEVICE_COLORS.length],
  }));

  const totalDeviceSessions = devicePieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">Website Analytics</h2>
        <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
          <Sparkles className="h-3 w-3 mr-1" />
          Live GA4 Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Sessions"
          value={overview.sessions.toLocaleString()}
          change={pctChange(overview.sessions, overview.sessionsPrev)}
          icon={BarChart3}
        />
        <MetricCard
          title="Total Users"
          value={overview.users.toLocaleString()}
          change={pctChange(overview.users, overview.usersPrev)}
          icon={Users}
        />
        <MetricCard
          title="Page Views"
          value={overview.pageViews.toLocaleString()}
          change={pctChange(overview.pageViews, overview.pageViewsPrev)}
          icon={Eye}
        />
        <MetricCard
          title="Bounce Rate"
          value={(overview.bounceRate * 100).toFixed(1)}
          change={-pctChange(overview.bounceRate, overview.bounceRatePrev)}
          icon={TrendingDown}
          suffix="%"
        />
      </div>

      {/* Daily Traffic Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Traffic (Last 30 Days)</CardTitle>
          <CardDescription>Page views and unique users per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyPageViews}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="pageViews" stroke="hsl(164, 100%, 25%)" strokeWidth={2} name="Page Views" dot={false} />
              <Line type="monotone" dataKey="users" stroke="hsl(46, 93%, 56%)" strokeWidth={2} name="Users" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Sessions by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={devicePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {devicePieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {devicePieData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <DeviceIcon device={d.name} />
                    <span className="capitalize">{d.name}</span>
                  </div>
                  <span className="font-medium">{totalDeviceSessions > 0 ? ((d.value / totalDeviceSessions) * 100).toFixed(0) : 0}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Top Countries</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trafficByCountry.slice(0, 8).map((c) => (
                <div key={c.dimension} className="flex items-center justify-between text-sm">
                  <span>{c.dimension}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{c.users || 0} users</span>
                    <span className="font-medium">{c.sessions} sessions</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Browser Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Top Browsers</CardTitle>
            <CardDescription>Sessions by browser</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trafficByBrowser.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="dimension" stroke="hsl(var(--muted-foreground))" width={80} fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="sessions" radius={[0, 4, 4, 0]}>
                  {trafficByBrowser.slice(0, 5).map((_, i) => <Cell key={i} fill={BROWSER_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Social Media Traffic */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" /> Social Media Traffic</CardTitle>
          <CardDescription>Sessions from your social media platforms (last 30 days). Use UTM links for accurate tracking.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {socialTraffic.map((platform) => {
              const Icon = platform.icon;
              return (
                <div key={platform.key} className="flex flex-col items-center p-4 rounded-lg border bg-muted/30">
                  <Icon className="h-6 w-6 mb-2" style={{ color: platform.color }} />
                  <span className="font-medium text-sm">{platform.label}</span>
                  <span className="text-2xl font-bold mt-1">{platform.sessions}</span>
                  <span className="text-xs text-muted-foreground">{platform.users} users</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total social media sessions</span>
              <span className="font-bold text-lg">{totalSocialSessions}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Tip: Add <code className="bg-muted px-1 rounded">?utm_source=facebook&utm_medium=social</code> to your shared links for precise tracking.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
