import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSocialMediaClients, useCreateSocialMediaReport, useUpdateSocialMediaReport, useSocialMediaReports, useDeleteSocialMediaReport } from "@/hooks/useSocialMediaReports";
import { PLATFORM_CONFIG } from "./platformConfig";
import { CSVImportPanel } from "./CSVImportPanel";
import { Save, Trash2, Pencil, Upload, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Props {
  selectedClientId: string | null;
  onClientSelected: (id: string) => void;
}

export function SocialReportEntry({ selectedClientId, onClientSelected }: Props) {
  const { data: clients } = useSocialMediaClients();
  const { data: reports } = useSocialMediaReports(selectedClientId || undefined);
  const createReport = useCreateSocialMediaReport();
  const updateReport = useUpdateSocialMediaReport();
  const deleteReport = useDeleteSocialMediaReport();

  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      report_period_start: "",
      report_period_end: "",
      followers_count: 0,
      followers_gained: 0,
      followers_lost: 0,
      total_posts: 0,
      total_reach: 0,
      total_impressions: 0,
      total_engagements: 0,
      total_likes: 0,
      total_comments: 0,
      total_shares: 0,
      total_clicks: 0,
      video_views: 0,
      watch_time_minutes: 0,
      stories_views: 0,
      profile_visits: 0,
      engagement_rate: 0,
      notes: "",
    },
  });

  const selectedClient = clients?.find((c) => c.id === selectedClientId);

  async function onSubmit(values: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !selectedClientId || !selectedPlatform) return;

    const payload = {
      client_id: selectedClientId,
      platform: selectedPlatform,
      ...values,
      followers_count: Number(values.followers_count),
      followers_gained: Number(values.followers_gained),
      followers_lost: Number(values.followers_lost),
      total_posts: Number(values.total_posts),
      total_reach: Number(values.total_reach),
      total_impressions: Number(values.total_impressions),
      total_engagements: Number(values.total_engagements),
      total_likes: Number(values.total_likes),
      total_comments: Number(values.total_comments),
      total_shares: Number(values.total_shares),
      total_clicks: Number(values.total_clicks),
      video_views: Number(values.video_views),
      watch_time_minutes: Number(values.watch_time_minutes),
      stories_views: Number(values.stories_views),
      profile_visits: Number(values.profile_visits),
      engagement_rate: Number(values.engagement_rate),
      created_by: user.id,
    };

    if (editingId) {
      await updateReport.mutateAsync({ id: editingId, ...payload });
      setEditingId(null);
    } else {
      await createReport.mutateAsync(payload);
    }
    reset();
    setSelectedPlatform("");
  }

  function handleEdit(report: any) {
    setEditingId(report.id);
    setSelectedPlatform(report.platform);
    reset({
      report_period_start: report.report_period_start,
      report_period_end: report.report_period_end,
      followers_count: report.followers_count,
      followers_gained: report.followers_gained,
      followers_lost: report.followers_lost,
      total_posts: report.total_posts,
      total_reach: report.total_reach,
      total_impressions: report.total_impressions,
      total_engagements: report.total_engagements,
      total_likes: report.total_likes,
      total_comments: report.total_comments,
      total_shares: report.total_shares,
      total_clicks: report.total_clicks,
      video_views: report.video_views,
      watch_time_minutes: report.watch_time_minutes,
      stories_views: report.stories_views,
      profile_visits: report.profile_visits,
      engagement_rate: report.engagement_rate,
      notes: report.notes || "",
    });
  }

  const numericField = (name: string, label: string, placeholder = "0") => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type="number" min={0} placeholder={placeholder} className="h-9" {...register(name as any)} />
    </div>
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="manual">
        <TabsList className="w-full grid grid-cols-2 max-w-sm">
          <TabsTrigger value="manual" className="text-xs flex items-center gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" /> Manual Entry
          </TabsTrigger>
          <TabsTrigger value="csv" className="text-xs flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5" /> CSV Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-4 space-y-4">
      {/* Client selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Client & Platform</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Client</Label>
            <Select value={selectedClientId || ""} onValueChange={onClientSelected}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Platform</Label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform} disabled={!selectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform..." />
              </SelectTrigger>
              <SelectContent>
                {(selectedClient?.platforms || []).map((p) => (
                  <SelectItem key={p} value={p}>
                    {PLATFORM_CONFIG[p]?.icon} {PLATFORM_CONFIG[p]?.label || p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedClientId && selectedPlatform && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>{PLATFORM_CONFIG[selectedPlatform]?.icon}</span>
                  {PLATFORM_CONFIG[selectedPlatform]?.label} — Metrics Entry
                </CardTitle>
                {editingId && <Badge variant="outline" className="text-xs">Editing</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Period */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Period Start *</Label>
                  <Input type="date" className="h-9" {...register("report_period_start", { required: true })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Period End *</Label>
                  <Input type="date" className="h-9" {...register("report_period_end", { required: true })} />
                </div>
              </div>

              {/* Audience */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Audience</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {numericField("followers_count", "Total Followers")}
                  {numericField("followers_gained", "Followers Gained")}
                  {numericField("followers_lost", "Followers Lost")}
                </div>
              </div>

              {/* Reach & Impressions */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Reach & Visibility</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {numericField("total_posts", "Posts Published")}
                  {numericField("total_reach", "Total Reach")}
                  {numericField("total_impressions", "Impressions")}
                  {numericField("profile_visits", "Profile Visits")}
                  {(selectedPlatform === "facebook" || selectedPlatform === "instagram") && numericField("stories_views", "Stories Views")}
                  {selectedPlatform === "youtube" && numericField("video_views", "Video Views")}
                  {selectedPlatform === "youtube" && numericField("watch_time_minutes", "Watch Time (mins)")}
                </div>
              </div>

              {/* Engagement */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Engagement</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {numericField("total_engagements", "Total Engagements")}
                  {numericField("total_likes", "Likes")}
                  {numericField("total_comments", "Comments")}
                  {numericField("total_shares", "Shares")}
                  {numericField("total_clicks", "Link Clicks")}
                  <div className="space-y-1">
                    <Label className="text-xs">Engagement Rate (%)</Label>
                    <Input type="number" step="0.01" min={0} max={100} placeholder="0.00" className="h-9" {...register("engagement_rate")} />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <Label className="text-xs">Notes / Comments</Label>
                <Textarea placeholder="Key observations, highlights, recommendations..." rows={3} {...register("notes")} />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createReport.isPending || updateReport.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? "Update Report" : "Save Report"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={() => { setEditingId(null); reset(); setSelectedPlatform(""); }}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Existing reports for this client */}
      {selectedClientId && reports && reports.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Saved Reports for {selectedClient?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{PLATFORM_CONFIG[r.platform]?.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{PLATFORM_CONFIG[r.platform]?.label}</p>
                      <p className="text-xs text-muted-foreground">{r.report_period_start} → {r.report_period_end}</p>
                    </div>
                    <div className="hidden md:flex gap-3 text-xs text-muted-foreground ml-4">
                      <span>👥 {r.followers_count?.toLocaleString()}</span>
                      <span>👁 {r.total_reach?.toLocaleString()}</span>
                      <span>❤️ {r.total_engagements?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(r)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive">
                           <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteReport.mutate(r.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="csv" className="mt-4">
          <CSVImportPanel
            selectedClientId={selectedClientId}
            onClientSelected={onClientSelected}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
