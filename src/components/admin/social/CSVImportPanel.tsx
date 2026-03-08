import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSocialMediaClients, useCreateSocialMediaReport } from "@/hooks/useSocialMediaReports";
import { PLATFORM_CONFIG } from "./platformConfig";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, CheckCircle2, XCircle, AlertCircle, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// The canonical column order for our CSV template
const CSV_COLUMNS = [
  "platform",
  "report_period_start",
  "report_period_end",
  "followers_count",
  "followers_gained",
  "followers_lost",
  "total_posts",
  "total_reach",
  "total_impressions",
  "total_engagements",
  "total_likes",
  "total_comments",
  "total_shares",
  "total_clicks",
  "video_views",
  "watch_time_minutes",
  "stories_views",
  "profile_visits",
  "engagement_rate",
  "notes",
];

const NUMERIC_COLS = new Set([
  "followers_count","followers_gained","followers_lost","total_posts","total_reach",
  "total_impressions","total_engagements","total_likes","total_comments","total_shares",
  "total_clicks","video_views","watch_time_minutes","stories_views","profile_visits","engagement_rate",
]);

const VALID_PLATFORMS = Object.keys(PLATFORM_CONFIG);

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""));
  const rows = lines.slice(1).map((line) => {
    // Handle quoted fields
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQuotes = !inQuotes; continue; }
      if (line[i] === "," && !inQuotes) { result.push(current.trim()); current = ""; continue; }
      current += line[i];
    }
    result.push(current.trim());
    return result;
  }).filter((r) => r.some((c) => c !== ""));
  return { headers, rows };
}

function mapRow(headers: string[], row: string[]): Record<string, any> {
  const obj: Record<string, any> = {};
  headers.forEach((h, i) => { obj[h] = row[i] ?? ""; });
  return obj;
}

function validateRow(row: Record<string, any>, idx: number): string[] {
  const errors: string[] = [];
  if (!row.platform || !VALID_PLATFORMS.includes(row.platform?.toLowerCase())) {
    errors.push(`Row ${idx + 1}: Invalid platform "${row.platform}". Must be one of: ${VALID_PLATFORMS.join(", ")}`);
  }
  if (!row.report_period_start || !/^\d{4}-\d{2}-\d{2}$/.test(row.report_period_start)) {
    errors.push(`Row ${idx + 1}: report_period_start must be YYYY-MM-DD`);
  }
  if (!row.report_period_end || !/^\d{4}-\d{2}-\d{2}$/.test(row.report_period_end)) {
    errors.push(`Row ${idx + 1}: report_period_end must be YYYY-MM-DD`);
  }
  return errors;
}

function downloadTemplate() {
  const exampleRow = [
    "facebook", "2024-03-01", "2024-03-31",
    "12500", "340", "12", "28", "45000", "98000",
    "3200", "2100", "430", "670", "0", "0", "0", "4200", "0", "7.1",
    "Great month overall",
  ];
  const csv = [CSV_COLUMNS.join(","), exampleRow.join(",")].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "social_media_report_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

interface ParsedRow {
  raw: Record<string, any>;
  errors: string[];
  status: "valid" | "error" | "imported" | "duplicate";
}

interface Props {
  selectedClientId: string | null;
  onClientSelected: (id: string) => void;
}

export function CSVImportPanel({ selectedClientId, onClientSelected }: Props) {
  const { data: clients } = useSocialMediaClients();
  const createReport = useCreateSocialMediaReport();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  const selectedClient = clients?.find((c) => c.id === selectedClientId);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setDone(false);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { headers, rows } = parseCSV(text);
      const parsed: ParsedRow[] = rows.map((row, idx) => {
        const raw = mapRow(headers, row);
        const errors = validateRow(raw, idx);
        return { raw, errors, status: errors.length === 0 ? "valid" : "error" };
      });
      setParsedRows(parsed);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!selectedClientId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setImporting(true);
    const updated = [...parsedRows];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== "valid") continue;
      const raw = updated[i].raw;
      try {
        await createReport.mutateAsync({
          client_id: selectedClientId,
          platform: raw.platform.toLowerCase(),
          report_period_start: raw.report_period_start,
          report_period_end: raw.report_period_end,
          created_by: user.id,
          followers_count: raw.followers_count ? Number(raw.followers_count) : 0,
          followers_gained: raw.followers_gained ? Number(raw.followers_gained) : 0,
          followers_lost: raw.followers_lost ? Number(raw.followers_lost) : 0,
          total_posts: raw.total_posts ? Number(raw.total_posts) : 0,
          total_reach: raw.total_reach ? Number(raw.total_reach) : 0,
          total_impressions: raw.total_impressions ? Number(raw.total_impressions) : 0,
          total_engagements: raw.total_engagements ? Number(raw.total_engagements) : 0,
          total_likes: raw.total_likes ? Number(raw.total_likes) : 0,
          total_comments: raw.total_comments ? Number(raw.total_comments) : 0,
          total_shares: raw.total_shares ? Number(raw.total_shares) : 0,
          total_clicks: raw.total_clicks ? Number(raw.total_clicks) : 0,
          video_views: raw.video_views ? Number(raw.video_views) : 0,
          watch_time_minutes: raw.watch_time_minutes ? Number(raw.watch_time_minutes) : 0,
          stories_views: raw.stories_views ? Number(raw.stories_views) : 0,
          profile_visits: raw.profile_visits ? Number(raw.profile_visits) : 0,
          engagement_rate: raw.engagement_rate ? Number(raw.engagement_rate) : 0,
          notes: raw.notes || null,
        });
        updated[i] = { ...updated[i], status: "imported" };
        successCount++;
      } catch (err: any) {
        updated[i] = { ...updated[i], errors: [err.message], status: "error" };
        errorCount++;
      }
      setParsedRows([...updated]);
    }

    setImporting(false);
    setDone(true);
    toast({
      title: `Import complete`,
      description: `${successCount} rows imported${errorCount > 0 ? `, ${errorCount} failed` : ""}.`,
      variant: errorCount > 0 ? "destructive" : "default",
    });
  }

  const validCount = parsedRows.filter((r) => r.status === "valid").length;
  const errorCount = parsedRows.filter((r) => r.status === "error").length;
  const importedCount = parsedRows.filter((r) => r.status === "imported").length;

  return (
    <div className="space-y-4">
      {/* Step 1: Download template */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" /> Step 1 — Download Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Download the CSV template, fill it with data from your platform dashboards (Facebook Insights, Instagram Insights, YouTube Studio, etc.), then upload it below.
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
              <Badge key={key} variant="secondary" className="text-xs gap-1">
                <span>{cfg.icon}</span> {cfg.label}
              </Badge>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" /> Download CSV Template
          </Button>
        </CardContent>
      </Card>

      {/* Step 2: Select client */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Step 2 — Select Client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs space-y-1.5">
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
        </CardContent>
      </Card>

      {/* Step 3: Upload CSV */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" /> Step 3 — Upload CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm font-medium">{fileName || "Click to upload CSV file"}</p>
            <p className="text-xs text-muted-foreground mt-1">Supports .csv files exported from any platform</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />

          {parsedRows.length > 0 && (
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="h-4 w-4" /> {validCount} valid
              </span>
              {importedCount > 0 && (
                <span className="flex items-center gap-1 text-primary">
                  <CheckCircle2 className="h-4 w-4" /> {importedCount} imported
                </span>
              )}
              {errorCount > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <XCircle className="h-4 w-4" /> {errorCount} errors
                </span>
              )}
              <span className="text-muted-foreground">({parsedRows.length} total rows)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview table */}
      {parsedRows.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Preview ({parsedRows.length} rows)</CardTitle>
              <Button
                onClick={handleImport}
                disabled={importing || validCount === 0 || !selectedClientId || done}
                size="sm"
              >
                {importing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...</>
                ) : done ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2" /> Imported</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" /> Import {validCount} Rows</>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!selectedClientId && (
              <Alert className="m-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Please select a client before importing.</AlertDescription>
              </Alert>
            )}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-8">#</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Platform</TableHead>
                    <TableHead className="text-xs">Period</TableHead>
                    <TableHead className="text-xs text-right">Followers</TableHead>
                    <TableHead className="text-xs text-right">Reach</TableHead>
                    <TableHead className="text-xs text-right">Engagements</TableHead>
                    <TableHead className="text-xs text-right">Posts</TableHead>
                    <TableHead className="text-xs">Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedRows.map((row, i) => (
                    <TableRow key={i} className={row.status === "error" ? "bg-destructive/5" : row.status === "imported" ? "bg-green-50 dark:bg-green-950/20" : ""}>
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        {row.status === "valid" && <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Ready</Badge>}
                        {row.status === "imported" && <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">Imported</Badge>}
                        {row.status === "error" && <Badge variant="destructive" className="text-xs">Error</Badge>}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="mr-1">{PLATFORM_CONFIG[row.raw.platform?.toLowerCase()]?.icon}</span>
                        {PLATFORM_CONFIG[row.raw.platform?.toLowerCase()]?.label || row.raw.platform || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {row.raw.report_period_start} → {row.raw.report_period_end}
                      </TableCell>
                      <TableCell className="text-right text-xs">{Number(row.raw.followers_count || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-xs">{Number(row.raw.total_reach || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-xs">{Number(row.raw.total_engagements || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-xs">{row.raw.total_posts || 0}</TableCell>
                      <TableCell className="text-xs text-destructive max-w-xs">
                        {row.errors.length > 0 ? row.errors.join("; ") : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
