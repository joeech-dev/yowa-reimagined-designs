import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Users, FileText, Eye, MousePointerClick } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const monthlyLeads = [
  { month: "Jan", leads: 12 },
  { month: "Feb", leads: 19 },
  { month: "Mar", leads: 15 },
  { month: "Apr", leads: 22 },
  { month: "May", leads: 28 },
  { month: "Jun", leads: 35 },
];

const blogViews = [
  { month: "Jan", views: 450 },
  { month: "Feb", views: 620 },
  { month: "Mar", views: 580 },
  { month: "Apr", views: 890 },
  { month: "May", views: 1200 },
  { month: "Jun", views: 1450 },
];

const leadSources = [
  { name: "Website Form", value: 45, color: "hsl(164, 100%, 25%)" },
  { name: "Newsletter", value: 25, color: "hsl(46, 93%, 56%)" },
  { name: "Social Media", value: 20, color: "hsl(160, 50%, 40%)" },
  { name: "Referral", value: 10, color: "hsl(160, 30%, 60%)" },
];

const AnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">Business Analytics</h2>
        <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Insights
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold text-primary">24.5%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">↑ 4.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Visitors</p>
                <p className="text-3xl font-bold">8,420</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">↑ 12.3% from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blog Engagement</p>
                <p className="text-3xl font-bold">5,190</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">↑ 21.1% from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CTA Clicks</p>
                <p className="text-3xl font-bold">1,847</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <MousePointerClick className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">↑ 8.7% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Generation Trend</CardTitle>
            <CardDescription>Monthly leads captured through website</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyLeads}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Bar dataKey="leads" fill="hsl(164, 100%, 25%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blog Traffic Growth</CardTitle>
            <CardDescription>Monthly blog page views</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={blogViews}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(46, 93%, 56%)" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(46, 93%, 56%)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>Where your leads come from</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={leadSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {leadSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {leadSources.map((source) => (
                <div key={source.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                    <span>{source.name}</span>
                  </div>
                  <span className="font-medium">{source.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-secondary" />
              AI Insights & Recommendations
            </CardTitle>
            <CardDescription>Powered by machine learning analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold text-primary mb-2">📈 Growth Opportunity</h4>
                <p className="text-sm text-muted-foreground">
                  Your blog content is driving 45% of leads. Consider increasing publishing frequency 
                  to 3 posts/week in the "Livelihood" category which has the highest engagement.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/30">
                <h4 className="font-semibold mb-2">🎯 Lead Quality Alert</h4>
                <p className="text-sm text-muted-foreground">
                  Leads from the NGO sector show 32% higher conversion rates. 
                  Consider creating targeted content for this audience segment.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-semibold mb-2">⚡ Quick Win</h4>
                <p className="text-sm text-muted-foreground">
                  8 leads haven't been contacted in 7+ days. Sending follow-up emails 
                  could recover potential revenue of ~$15,000.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
