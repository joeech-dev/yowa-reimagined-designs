import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Cookie, Settings2 } from "lucide-react";

const STORAGE_KEY = "cookie-consent-v2";
const POLICY_VERSION = "2026-05-17";

type Prefs = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

const DEFAULT_PREFS: Prefs = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    openCookieSettings?: () => void;
  }
}

const applyConsent = (prefs: Prefs) => {
  const w = window as any;
  // Google Consent Mode v2
  if (typeof w.gtag === "function") {
    w.gtag("consent", "update", {
      ad_storage: prefs.marketing ? "granted" : "denied",
      ad_user_data: prefs.marketing ? "granted" : "denied",
      ad_personalization: prefs.marketing ? "granted" : "denied",
      analytics_storage: prefs.analytics ? "granted" : "denied",
      functionality_storage: prefs.functional ? "granted" : "denied",
      personalization_storage: prefs.functional ? "granted" : "denied",
    });
  }
  // Meta Pixel consent
  if (typeof w.fbq === "function") {
    w.fbq("consent", prefs.marketing ? "grant" : "revoke");
  }
  // GTM event hook for custom triggers
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: "cookie_consent_update", consent: prefs });
};

const persist = (prefs: Prefs) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: POLICY_VERSION, ts: Date.now(), prefs })
  );
};

const CookieConsent = () => {
  const [show, setShow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setShow(true);
      } else {
        const parsed = JSON.parse(raw);
        if (parsed?.version !== POLICY_VERSION) {
          setShow(true);
        } else if (parsed?.prefs) {
          setPrefs({ ...DEFAULT_PREFS, ...parsed.prefs });
          applyConsent({ ...DEFAULT_PREFS, ...parsed.prefs });
        }
      }
    } catch {
      setShow(true);
    }
    window.openCookieSettings = () => {
      setShowSettings(true);
      setShow(true);
    };
  }, []);

  const acceptAll = () => {
    const next: Prefs = { necessary: true, functional: true, analytics: true, marketing: true };
    setPrefs(next);
    persist(next);
    applyConsent(next);
    setShow(false);
    setShowSettings(false);
  };

  const rejectAll = () => {
    const next: Prefs = { ...DEFAULT_PREFS };
    setPrefs(next);
    persist(next);
    applyConsent(next);
    setShow(false);
    setShowSettings(false);
  };

  const saveChoices = () => {
    persist(prefs);
    applyConsent(prefs);
    setShow(false);
    setShowSettings(false);
  };

  if (!show) return null;

  return (
    <>
      {/* Modal overlay for settings */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
          onClick={() => setShowSettings(false)}
          aria-hidden="true"
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-desc"
        className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
      >
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
          {!showSettings ? (
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Cookie className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h2 id="cookie-consent-title" className="font-display font-semibold text-lg mb-2">
                    Your privacy choices
                  </h2>
                  <p id="cookie-consent-desc" className="text-sm text-muted-foreground leading-relaxed">
                    We use strictly necessary cookies to make our site work. With your consent, we also
                    use functional, analytics and marketing cookies to improve your experience and measure
                    performance. You can accept all, reject non-essential, or choose by category. Read our{" "}
                    <Link to="/cookie-policy" className="text-primary underline hover:no-underline">
                      Cookie Policy
                    </Link>
                    {" and "}
                    <Link to="/privacy-policy" className="text-primary underline hover:no-underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowSettings(true)}
                  className="sm:mr-auto"
                >
                  <Settings2 className="h-4 w-4 mr-2" aria-hidden="true" />
                  Customise
                </Button>
                <Button variant="outline" onClick={rejectAll}>
                  Reject non-essential
                </Button>
                <Button onClick={acceptAll}>Accept all</Button>
              </div>
            </div>
          ) : (
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <h2 className="font-display font-semibold text-lg mb-1">Cookie preferences</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Choose which categories of cookies you allow. You can change this at any time from our{" "}
                <Link to="/cookie-policy" className="text-primary underline hover:no-underline">
                  Cookie Policy
                </Link>{" "}
                page.
              </p>

              <div className="space-y-4">
                <CategoryRow
                  title="Strictly necessary"
                  description="Required for the site to function (security, navigation, session)."
                  checked
                  disabled
                />
                <CategoryRow
                  title="Functional"
                  description="Remembers preferences such as language or region for a more personalised experience."
                  checked={prefs.functional}
                  onChange={(v) => setPrefs((p) => ({ ...p, functional: v }))}
                />
                <CategoryRow
                  title="Analytics / performance"
                  description="Helps us understand how visitors use the site so we can improve it (e.g. Google Analytics)."
                  checked={prefs.analytics}
                  onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
                />
                <CategoryRow
                  title="Marketing / advertising"
                  description="Used to deliver relevant ads and measure campaign performance (e.g. Meta Pixel, Google Ads)."
                  checked={prefs.marketing}
                  onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
                />
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3">
                <Button variant="ghost" onClick={rejectAll} className="sm:mr-auto">
                  Reject non-essential
                </Button>
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  Back
                </Button>
                <Button onClick={saveChoices}>Save choices</Button>
                <Button variant="secondary" onClick={acceptAll}>
                  Accept all
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const CategoryRow = ({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) => (
  <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
    <div className="flex-1">
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
    </div>
    <Switch
      checked={checked}
      disabled={disabled}
      onCheckedChange={onChange}
      aria-label={`${title} cookies`}
    />
  </div>
);

export default CookieConsent;
