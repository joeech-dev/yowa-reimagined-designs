import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Copy,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const LOVABLE_IP = "185.158.133.1";
const TXT_NAME = "_lovable";

type DnsCheck = {
  apex: { ok: boolean; current?: string };
  www: { ok: boolean; current?: string };
};

const STEPS = [
  "Domain",
  "Lovable Settings",
  "DNS A Records",
  "TXT Verification",
  "Verify & Activate",
];

const CopyField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <div className="flex gap-2">
      <Input readOnly value={value} className="font-mono text-sm" />
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          navigator.clipboard.writeText(value);
          toast.success(`Copied ${label}`);
        }}
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

const DomainReconnectWizard = () => {
  const [step, setStep] = useState(0);
  const [domain, setDomain] = useState("yowa.us");
  const [txtValue, setTxtValue] = useState("");
  const [checking, setChecking] = useState(false);
  const [dns, setDns] = useState<DnsCheck | null>(null);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();

  const checkDns = async () => {
    setChecking(true);
    setDns(null);
    try {
      const fetchA = async (host: string) => {
        const res = await fetch(
          `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`
        );
        const json = await res.json();
        const answers: string[] =
          json.Answer?.filter((a: any) => a.type === 1).map((a: any) => a.data) ?? [];
        return { ok: answers.includes(LOVABLE_IP), current: answers.join(", ") || "—" };
      };
      const [apex, www] = await Promise.all([
        fetchA(cleanDomain),
        fetchA(`www.${cleanDomain}`),
      ]);
      setDns({ apex, www });
      if (apex.ok && www.ok) toast.success("DNS records correctly point to Lovable!");
      else toast.warning("DNS not yet pointing to Lovable. Check records / wait for propagation.");
    } catch (e) {
      toast.error("DNS lookup failed. Try again in a moment.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-primary" />
          Custom Domain Reconnect Wizard
        </CardTitle>
        <CardDescription>
          Step-by-step guide to restore your custom domain. Don't skip any step — each
          field below is required for SSL provisioning.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </span>
            <span className="text-muted-foreground">
              {Math.round(((step + 1) / STEPS.length) * 100)}%
            </span>
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} />
        </div>

        <Separator />

        {/* Step 0 — Domain */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">1. Confirm the domain you want to reconnect</h3>
            <div className="space-y-2">
              <Label>Domain (without https://)</Label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="yowa.us"
              />
              <p className="text-xs text-muted-foreground">
                We will configure both <code className="font-mono">{cleanDomain}</code> and{" "}
                <code className="font-mono">www.{cleanDomain}</code>.
              </p>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Keep your email working</AlertTitle>
              <AlertDescription>
                Only the <strong>A records</strong> for <code>@</code> and <code>www</code>{" "}
                change. Do <strong>not</strong> touch your existing MX, SPF, DKIM, or DMARC
                records — Namecheap email will keep working.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Step 1 — Lovable settings */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold">2. Add the domain in Lovable Project Settings</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Open this project in Lovable.</li>
              <li>
                Click <strong>Project Settings → Domains</strong> (top-right gear icon).
              </li>
              <li>
                Click <strong>Connect Domain</strong> and enter:{" "}
                <code className="font-mono bg-muted px-1.5 py-0.5 rounded">{cleanDomain}</code>
              </li>
              <li>
                Repeat for the www variant:{" "}
                <code className="font-mono bg-muted px-1.5 py-0.5 rounded">www.{cleanDomain}</code>
              </li>
              <li>
                Lovable will display a unique <strong>TXT verification value</strong> — copy
                it for Step 4.
              </li>
            </ol>
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  "https://docs.lovable.dev/features/custom-domain",
                  "_blank"
                )
              }
              className="gap-2"
            >
              Open Lovable Docs <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2 — A records */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">3. Update A records in Namecheap</h3>
            <p className="text-sm text-muted-foreground">
              Log in to Namecheap → <strong>Domain List → Manage → Advanced DNS</strong>.
              Delete any existing A records for <code>@</code> and <code>www</code>, then add:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-muted/30">
                <CardContent className="p-4 space-y-3">
                  <Badge variant="secondary">Record 1 — Root</Badge>
                  <CopyField label="Type" value="A Record" />
                  <CopyField label="Host" value="@" />
                  <CopyField label="Value (IP)" value={LOVABLE_IP} />
                  <CopyField label="TTL" value="Automatic" />
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="p-4 space-y-3">
                  <Badge variant="secondary">Record 2 — WWW</Badge>
                  <CopyField label="Type" value="A Record" />
                  <CopyField label="Host" value="www" />
                  <CopyField label="Value (IP)" value={LOVABLE_IP} />
                  <CopyField label="TTL" value="Automatic" />
                </CardContent>
              </Card>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Remove any old <strong>URL Redirect</strong>, <strong>CNAME</strong>, or
                Namecheap parking A record (e.g. <code>198.54.115.89</code>) for{" "}
                <code>@</code> / <code>www</code>. Conflicting records will block SSL.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Step 3 — TXT */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">4. Add the TXT verification record</h3>
            <p className="text-sm text-muted-foreground">
              Paste the <code>lovable_verify=…</code> value you copied in Step 2 below to
              build the exact record:
            </p>
            <div className="space-y-2">
              <Label>TXT value from Lovable</Label>
              <Input
                value={txtValue}
                onChange={(e) => setTxtValue(e.target.value)}
                placeholder="lovable_verify=abc123…"
                className="font-mono"
              />
            </div>
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-3">
                <Badge variant="secondary">TXT Record</Badge>
                <CopyField label="Type" value="TXT Record" />
                <CopyField label="Host" value={TXT_NAME} />
                <CopyField
                  label="Value"
                  value={txtValue || "lovable_verify=PASTE_VALUE_FROM_LOVABLE"}
                />
                <CopyField label="TTL" value="Automatic" />
              </CardContent>
            </Card>
            {!txtValue && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Paste the TXT value above before proceeding. Without it, Lovable cannot
                  verify domain ownership.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Step 4 — Verify */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold">5. Verify DNS propagation</h3>
            <p className="text-sm text-muted-foreground">
              Click below to check (via Google DNS) whether your A records resolve to
              Lovable. DNS can take up to 72 hours to propagate.
            </p>
            <Button onClick={checkDns} disabled={checking} className="gap-2">
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Run DNS check for {cleanDomain}
            </Button>

            {dns && (
              <div className="space-y-2">
                {(["apex", "www"] as const).map((k) => {
                  const r = dns[k];
                  const host = k === "apex" ? cleanDomain : `www.${cleanDomain}`;
                  return (
                    <Card key={k} className={r.ok ? "border-primary/40" : "border-destructive/40"}>
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-mono text-sm">{host}</p>
                          <p className="text-xs text-muted-foreground">
                            Resolves to: {r.current}
                          </p>
                        </div>
                        {r.ok ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Pointing to Lovable
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" /> Not yet correct
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {dns?.apex.ok && dns?.www.ok && (
              <Alert className="border-primary/40 bg-primary/5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <AlertTitle>DNS looks good!</AlertTitle>
                <AlertDescription>
                  Return to Lovable → <strong>Project Settings → Domains</strong> and click{" "}
                  <strong>Verify</strong>. SSL will be issued automatically (usually within
                  a few minutes).
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Separator />

        {/* Nav */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={prev} disabled={step === 0} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} className="gap-2">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setStep(0)}
              className="gap-2"
            >
              Restart wizard <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainReconnectWizard;
