import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MailCheck, MailOpen, MousePointerClick, MailX, RefreshCw } from "lucide-react";

interface EmailEvent {
  id: string;
  event_type: string;
  recipient_email: string;
  subject: string | null;
  occurred_at: string;
  provider_message_id: string | null;
}

const RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const STATUS_STYLES: Record<string, string> = {
  delivered: "bg-primary/10 text-primary border-primary/30",
  opened: "bg-secondary/20 text-secondary-foreground border-secondary/40",
  clicked: "bg-secondary/30 text-secondary-foreground border-secondary/50",
  bounced: "bg-destructive/10 text-destructive border-destructive/30",
  complained: "bg-destructive/10 text-destructive border-destructive/30",
};

const EmailEngagementPanel = () => {
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");
  const [typeFilter, setTypeFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - Number(range) * 86400000).toISOString();
    const { data, error } = await supabase
      .from("email_events")
      .select("id, event_type, recipient_email, subject, occurred_at, provider_message_id")
      .gte("occurred_at", since)
      .order("occurred_at", { ascending: false })
      .limit(200);
    if (error) console.error("Failed to load email events:", error.message);
    setEvents(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const stats = useMemo(() => {
    const count = (type: string) => new Set(
      events.filter((e) => e.event_type === type).map((e) => e.provider_message_id ?? e.id),
    ).size;
    const delivered = count("delivered");
    const opened = count("opened");
    return {
      delivered,
      opened,
      clicked: count("clicked"),
      failed: count("bounced") + count("complained"),
      openRate: delivered ? Math.round((opened / delivered) * 100) : 0,
    };
  }, [events]);

  const visible = typeFilter === "all" ? events : events.filter((e) => e.event_type === typeFilter);

  const cards = [
    { label: "Delivered", value: stats.delivered, icon: MailCheck },
    { label: `Opened (${stats.openRate}%)`, value: stats.opened, icon: MailOpen },
    { label: "Clicked", value: stats.clicked, icon: MousePointerClick },
    { label: "Bounced / Complaints", value: stats.failed, icon: MailX },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[160px]" aria-label="Time range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]" aria-label="Event type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All events</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="opened">Opened</SelectItem>
            <SelectItem value="clicked">Clicked</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
            <SelectItem value="complained">Complaints</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <c.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent email activity</CardTitle>
        </CardHeader>
        <CardContent>
          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {loading
                ? "Loading email activity…"
                : "No email activity recorded yet for this period."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_STYLES[e.event_type] ?? ""}>
                          {e.event_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{e.recipient_email}</TableCell>
                      <TableCell className="text-muted-foreground">{e.subject ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {new Date(e.occurred_at).toLocaleString("en-UG", { timeZone: "Africa/Kampala" })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailEngagementPanel;
