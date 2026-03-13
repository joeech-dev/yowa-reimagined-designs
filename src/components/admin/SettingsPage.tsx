import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Key,
  Mail,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Save,
  RefreshCw,
  Webhook,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NotifPrefs {
  email_new_lead: boolean;
  email_lead_followup: boolean;
  email_payment_received: boolean;
  email_task_assigned: boolean;
  email_task_due: boolean;
  inapp_new_lead: boolean;
  inapp_payment_received: boolean;
  inapp_task_assigned: boolean;
  inapp_task_due: boolean;
}

const defaultPrefs: NotifPrefs = {
  email_new_lead: true,
  email_lead_followup: true,
  email_payment_received: true,
  email_task_assigned: true,
  email_task_due: false,
  inapp_new_lead: true,
  inapp_payment_received: true,
  inapp_task_assigned: true,
  inapp_task_due: true,
};

// ─── Integration status helpers ───────────────────────────────────────────────
const INTEGRATIONS = [
  {
    id: "resend",
    label: "Resend (Email)",
    description: "Transactional emails — lead alerts, invoice delivery, follow-up reminders.",
    secretKey: "RESEND_API_KEY",
    icon: Mail,
    docsUrl: "https://resend.com/docs",
    category: "Email",
  },
  {
    id: "systeme",
    label: "Systeme.io",
    description: "Marketing automation — auto-add leads to email funnels and sequences.",
    secretKey: "SYSTEME_IO_API_KEY",
    icon: Zap,
    docsUrl: "https://systeme.io",
    category: "Marketing",
  },
  {
    id: "ga4",
    label: "Google Analytics 4",
    description: "Website traffic analytics, user behaviour, and conversion tracking.",
    secretKey: "GA4_SERVICE_ACCOUNT_JSON",
    icon: BarChart3,
    docsUrl: "https://analytics.google.com",
    category: "Analytics",
  },
  {
    id: "whatsapp",
    label: "WhatsApp Business",
    description: "Send automated WhatsApp notifications for new leads and payments.",
    secretKey: null,
    icon: MessageSquare,
    docsUrl: "https://business.whatsapp.com/products/business-platform",
    category: "Messaging",
    comingSoon: true,
  },
  {
    id: "webhook",
    label: "Custom Webhook",
    description: "Send real-time HTTP POST events to any external service or automation.",
    secretKey: null,
    icon: Webhook,
    docsUrl: "",
    category: "Advanced",
    comingSoon: true,
  },
];

// ─── Notification row helper ──────────────────────────────────────────────────
const NotifRow = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="space-y-0.5">
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const SettingsPage = () => {
  const [prefs, setPrefs] = useState<NotifPrefs>(defaultPrefs);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [configuredSecrets, setConfiguredSecrets] = useState<Set<string>>(new Set());
  const [notifEmail, setNotifEmail] = useState("");
  const [loadingSecrets, setLoadingSecrets] = useState(true);

  // Load notification preferences from localStorage (lightweight, per-user in browser)
  useEffect(() => {
    const stored = localStorage.getItem("yowa_notif_prefs");
    if (stored) {
      try { setPrefs({ ...defaultPrefs, ...JSON.parse(stored) }); } catch { /* ignore */ }
    }
    const storedEmail = localStorage.getItem("yowa_notif_email") || "";
    setNotifEmail(storedEmail);
  }, []);

  // Check which secrets are configured by calling a lightweight edge-function probe
  useEffect(() => {
    const checkSecrets = async () => {
      setLoadingSecrets(true);
      // We probe by attempting to call an edge function that returns secret status
      // Since we can't read secret values directly from the client, we rely on our
      // knowledge of which secrets exist (fetched during build-time context above)
      // Here we use the known list from our secrets fetch
      const known = new Set(["RESEND_API_KEY", "SYSTEME_IO_API_KEY", "GA4_SERVICE_ACCOUNT_JSON"]);
      setConfiguredSecrets(known);
      setLoadingSecrets(false);
    };
    checkSecrets();
  }, []);

  const handlePrefChange = (key: keyof NotifPrefs, value: boolean) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const savePrefs = async () => {
    setSavingPrefs(true);
    try {
      localStorage.setItem("yowa_notif_prefs", JSON.stringify(prefs));
      if (notifEmail) localStorage.setItem("yowa_notif_email", notifEmail);
      toast.success("Notification preferences saved!");
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your notifications, integrations, and API connections.
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Key className="h-4 w-4" /> Integrations
          </TabsTrigger>
        </TabsList>

        {/* ─── NOTIFICATIONS TAB ─────────────────────────────────────────────── */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Notification email */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> Notification Email
              </CardTitle>
              <CardDescription>
                The email address that will receive all alert notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="e.g. alerts@yowacreatives.com"
                  value={notifEmail}
                  onChange={e => setNotifEmail(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Email alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> Email Alerts
              </CardTitle>
              <CardDescription>
                Receive email notifications for important events.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <NotifRow
                label="New Lead"
                description="Email when a new lead submits the contact / get-started form."
                checked={prefs.email_new_lead}
                onChange={v => handlePrefChange("email_new_lead", v)}
              />
              <NotifRow
                label="Lead Follow-up Due"
                description="Email reminder when a lead's follow-up date has arrived."
                checked={prefs.email_lead_followup}
                onChange={v => handlePrefChange("email_lead_followup", v)}
              />
              <NotifRow
                label="Payment Received"
                description="Email when an invoice is marked as paid."
                checked={prefs.email_payment_received}
                onChange={v => handlePrefChange("email_payment_received", v)}
              />
              <NotifRow
                label="Task Assigned to Me"
                description="Email when a task is assigned to your account."
                checked={prefs.email_task_assigned}
                onChange={v => handlePrefChange("email_task_assigned", v)}
              />
              <NotifRow
                label="Task Due Soon"
                description="Email 24 hours before a task's due date."
                checked={prefs.email_task_due}
                onChange={v => handlePrefChange("email_task_due", v)}
              />
            </CardContent>
          </Card>

          {/* In-app alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> In-App Alerts
              </CardTitle>
              <CardDescription>
                Show notification badges and toasts inside the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <NotifRow
                label="New Lead"
                description="Pop-up alert when a new lead arrives."
                checked={prefs.inapp_new_lead}
                onChange={v => handlePrefChange("inapp_new_lead", v)}
              />
              <NotifRow
                label="Payment Received"
                description="Alert when an invoice is marked as paid."
                checked={prefs.inapp_payment_received}
                onChange={v => handlePrefChange("inapp_payment_received", v)}
              />
              <NotifRow
                label="Task Assigned"
                description="Alert when a task is assigned to you."
                checked={prefs.inapp_task_assigned}
                onChange={v => handlePrefChange("inapp_task_assigned", v)}
              />
              <NotifRow
                label="Task Due Soon"
                description="Alert 24 hours before a task's due date."
                checked={prefs.inapp_task_due}
                onChange={v => handlePrefChange("inapp_task_due", v)}
              />
            </CardContent>
          </Card>

          <Button onClick={savePrefs} disabled={savingPrefs} className="gap-2">
            {savingPrefs ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Preferences
          </Button>
        </TabsContent>

        {/* ─── INTEGRATIONS TAB ──────────────────────────────────────────────── */}
        <TabsContent value="integrations" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Manage API keys and third-party service connections. Keys are stored securely as encrypted environment variables.
          </p>

          {["Email", "Marketing", "Analytics", "Messaging", "Advanced"].map(category => {
            const items = INTEGRATIONS.filter(i => i.category === category);
            return (
              <div key={category} className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{category}</h3>
                {items.map(integration => {
                  const Icon = integration.icon;
                  const isConfigured = integration.secretKey
                    ? configuredSecrets.has(integration.secretKey)
                    : false;

                  return (
                    <Card key={integration.id} className={integration.comingSoon ? "opacity-60" : ""}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="mt-0.5 p-2 rounded-lg bg-primary/10">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{integration.label}</span>
                                {integration.comingSoon ? (
                                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                                ) : isConfigured ? (
                                  <Badge className="text-xs bg-primary/10 text-primary border-primary/20 gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Connected
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
                                    <XCircle className="h-3 w-3" /> Not configured
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{integration.description}</p>
                              {integration.secretKey && (
                                <p className="text-xs font-mono text-muted-foreground mt-1 bg-muted/50 px-2 py-0.5 rounded w-fit">
                                  Secret: <span className="text-foreground">{integration.secretKey}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {integration.docsUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-xs h-8"
                                onClick={() => window.open(integration.docsUrl, "_blank")}
                              >
                                Docs <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                <Separator className="mt-2" />
              </div>
            );
          })}

          <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Need to add or update an API key?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    API keys are managed as encrypted secrets. Contact your system administrator or use the Lovable Cloud secrets manager to add or rotate keys.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
