import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSocialMediaClients, useSocialMediaReports, SocialMediaReport } from "@/hooks/useSocialMediaReports";
import { PLATFORM_CONFIG } from "./platformConfig";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Users, Eye, Heart, FileText, Printer } from "lucide-react";

interface Props {
  onPrintReport: (clientId: string) => void;
  tableView?: boolean;
}

function StatCard({ label, value, icon, trend }: { label: string; value: string | number; icon: React.ReactNode; trend?: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold mt-1">{typeof value === "number" ? value.toLocaleString() : value}</p>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
                {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend).toLocaleString()} this period
              </div>
            )}
          </div>
          <div className="text-muted-foreground opacity-60">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SocialReportDashboard({ onPrintReport, tableView = false }: Props) {
  const { data: clients } = useSocialMediaClients();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const { data: allReports } = useSocialMediaReports(selectedClientId || undefined);

  const selectedClient = clients?.find((c) => c.id === selectedClientId);

  const filteredReports = (allReports || []).filter((r) =>
    selectedPlatform === "all" ? true : r.platform === selectedPlatform
  );

  // Aggregate stats across all filtered reports
  const totals = filteredReports.reduce(
    (acc, r) => ({
      followers: acc.followers + (r.followers_count || 0),
      reach: acc.reach + (r.total_reach || 0),
      impressions: acc.impressions + (r.total_impressions || 0),
      engagements: acc.engagements + (r.total_engagements || 0),
      posts: acc.posts + (r.total_posts || 0),
      followers_gained: acc.followers_gained + (r.followers_gained || 0),
    }),
    { followers: 0, reach: 0, impressions: 0, engagements: 0, posts: 0, followers_gained: 0 }
  );

  // Engagement over time (last 6 reports)
  const timelineData = filteredReports
    .slice(0, 6)
    .reverse()
    .map((r) => ({
      period: r.report_period_end?.slice(0, 7) || "",
      Reach: r.total_reach,
      Engagements: r.total_engagements,
      Followers: r.followers_count,
    }));

  // Platform breakdown for pie
  const platformTotals: Record<string, number> = {};
  (allReports || []).forEach((r) => {
    platformTotals[r.platform] = (platformTotals[r.platform] || 0) + (r.total_engagements || 0);
  });
  const pieData = Object.entries(platformTotals).map(([platform, value]) => ({
    name: PLATFORM_CONFIG[platform]?.label || platform,
    value,
    fill: PLATFORM_CONFIG[platform]?.color || "#888",
  }));

  const COLORS = Object.values(PLATFORM_CONFIG).map((p) => p.color);

  if (!selectedClientId) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-10 text-center">
            <BarChart className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-medium mb-3">Select a client to view their performance dashboard</p>
            <Select onValueChange={setSelectedClientId}>
              <SelectTrigger className="max-w-xs mx-auto">
                <SelectValue placeholder="Choose a client..." />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select client..." />
            </SelectTrigger>
            <SelectContent>
              {clients?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {selectedClient?.platforms?.map((p) => (
                <SelectItem key={p} value={p}>{PLATFORM_CONFIG[p]?.icon} {PLATFORM_CONFIG[p]?.label || p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={() => onPrintReport(selectedClientId)}>
          <Printer className="h-4 w-4 mr-2" /> Print Report
        </Button>
      </div>

      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
            No report data yet for this selection. Add data in the "Enter Data" tab.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Total Followers" value={totals.followers} icon={<Users className="h-5 w-5" />} trend={totals.followers_gained} />
            <StatCard label="Total Reach" value={totals.reach} icon={<Eye className="h-5 w-5" />} />
            <StatCard label="Impressions" value={totals.impressions} icon={<Eye className="h-5 w-5" />} />
            <StatCard label="Engagements" value={totals.engagements} icon={<Heart className="h-5 w-5" />} />
            <StatCard label="Posts Published" value={totals.posts} icon={<FileText className="h-5 w-5" />} />
            <StatCard label="Avg. Eng. Rate" value={`${filteredReports.length ? (filteredReports.reduce((a, r) => a + (r.engagement_rate || 0), 0) / filteredReports.length).toFixed(2) : 0}%`} icon={<TrendingUp className="h-5 w-5" />} />
          </div>

          {!tableView && (
            <>
              {/* Timeline Chart */}
              {timelineData.length > 1 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Performance Over Time</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="Reach" stroke="#6366f1" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Engagements" stroke="#ec4899" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Followers" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Engagement bar chart */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Engagement Breakdown</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={filteredReports.slice(0, 5).reverse().map((r) => ({
                        period: r.report_period_end?.slice(0, 7),
                        Likes: r.total_likes,
                        Comments: r.total_comments,
                        Shares: r.total_shares,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="Likes" fill="#ec4899" />
                        <Bar dataKey="Comments" fill="#6366f1" />
                        <Bar dataKey="Shares" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Platform pie */}
                {pieData.length > 1 && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Engagements by Platform</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                            {pieData.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}

          {/* Data Table */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">All Report Entries</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Platform</TableHead>
                      <TableHead className="text-xs">Period</TableHead>
                      <TableHead className="text-xs text-right">Followers</TableHead>
                      <TableHead className="text-xs text-right">Reach</TableHead>
                      <TableHead className="text-xs text-right">Impressions</TableHead>
                      <TableHead className="text-xs text-right">Engagements</TableHead>
                      <TableHead className="text-xs text-right">Eng. Rate</TableHead>
                      <TableHead className="text-xs text-right">Posts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1.5">
                            <span>{PLATFORM_CONFIG[r.platform]?.icon}</span>
                            <span>{PLATFORM_CONFIG[r.platform]?.label || r.platform}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {r.report_period_start} → {r.report_period_end}
                        </TableCell>
                        <TableCell className="text-right text-sm">{r.followers_count?.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm">{r.total_reach?.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm">{r.total_impressions?.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm">{r.total_engagements?.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm">{r.engagement_rate?.toFixed(2)}%</TableCell>
                        <TableCell className="text-right text-sm">{r.total_posts}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
