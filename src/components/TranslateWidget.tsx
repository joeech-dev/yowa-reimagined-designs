import { useEffect, useState } from "react";
import { Globe, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Countries where we proactively offer translation (non-primarily-English)
const TRANSLATE_COUNTRIES: Record<string, { name: string; lang: string; nativeName: string }> = {
  FR: { name: "France", lang: "fr", nativeName: "Français" },
  DE: { name: "Germany", lang: "de", nativeName: "Deutsch" },
  NL: { name: "Netherlands", lang: "nl", nativeName: "Nederlands" },
  BE: { name: "Belgium", lang: "fr", nativeName: "Français" },
  ES: { name: "Spain", lang: "es", nativeName: "Español" },
  PT: { name: "Portugal", lang: "pt", nativeName: "Português" },
  IT: { name: "Italy", lang: "it", nativeName: "Italiano" },
  JP: { name: "Japan", lang: "ja", nativeName: "日本語" },
  CN: { name: "China", lang: "zh-CN", nativeName: "中文" },
  KR: { name: "South Korea", lang: "ko", nativeName: "한국어" },
  RU: { name: "Russia", lang: "ru", nativeName: "Русский" },
  AR: { name: "Argentina", lang: "es", nativeName: "Español" },
  MX: { name: "Mexico", lang: "es", nativeName: "Español" },
  BR: { name: "Brazil", lang: "pt", nativeName: "Português" },
  SA: { name: "Saudi Arabia", lang: "ar", nativeName: "العربية" },
  AE: { name: "UAE", lang: "ar", nativeName: "العربية" },
  EG: { name: "Egypt", lang: "ar", nativeName: "العربية" },
  PL: { name: "Poland", lang: "pl", nativeName: "Polski" },
  SE: { name: "Sweden", lang: "sv", nativeName: "Svenska" },
  NO: { name: "Norway", lang: "no", nativeName: "Norsk" },
  DK: { name: "Denmark", lang: "da", nativeName: "Dansk" },
  FI: { name: "Finland", lang: "fi", nativeName: "Suomi" },
  TR: { name: "Turkey", lang: "tr", nativeName: "Türkçe" },
  ID: { name: "Indonesia", lang: "id", nativeName: "Bahasa Indonesia" },
  TH: { name: "Thailand", lang: "th", nativeName: "ภาษาไทย" },
  VN: { name: "Vietnam", lang: "vi", nativeName: "Tiếng Việt" },
  IN: { name: "India", lang: "hi", nativeName: "हिन्दी" },
};

const loadGoogleTranslate = (targetLang: string) => {
  // Remove existing Google Translate elements
  const existing = document.getElementById("google_translate_element");
  if (existing) existing.innerHTML = "";

  // Remove old script if any
  const oldScript = document.getElementById("gt-script");
  if (oldScript) oldScript.remove();

  // Set the cookie for Google Translate to the desired language
  document.cookie = `googtrans=/en/${targetLang}; path=/`;
  document.cookie = `googtrans=/en/${targetLang}; domain=${window.location.hostname}; path=/`;

  // Load the Google Translate script
  const script = document.createElement("script");
  script.id = "gt-script";
  script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);

  (window as any).googleTranslateElementInit = () => {
    new (window as any).google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: targetLang,
        autoDisplay: true,
        layout: (window as any).google.translate.TranslateElement?.InlineLayout?.SIMPLE,
      },
      "google_translate_element"
    );
  };
};

const SESSION_KEY = "yowa_translate_dismissed";
const COUNTRY_KEY = "yowa_detected_country";

const TranslateWidget = () => {
  const [countryInfo, setCountryInfo] = useState<{
    countryCode: string;
    countryName: string;
    lang: string;
    nativeName: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [translated, setTranslated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Check if user already dismissed this session
    if (sessionStorage.getItem(SESSION_KEY)) {
      setDismissed(true);
      return;
    }

    // Check if we cached the country already
    const cached = sessionStorage.getItem(COUNTRY_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const match = TRANSLATE_COUNTRIES[parsed.code];
        if (match) {
          setCountryInfo({ countryCode: parsed.code, countryName: match.name, lang: match.lang, nativeName: match.nativeName });
        }
      } catch {}
      return;
    }

    // Detect country via IP
    fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) })
      .then((r) => r.json())
      .then((data) => {
        const code = data.country_code as string;
        sessionStorage.setItem(COUNTRY_KEY, JSON.stringify({ code }));
        const match = TRANSLATE_COUNTRIES[code];
        if (match) {
          setCountryInfo({ countryCode: code, countryName: match.name, lang: match.lang, nativeName: match.nativeName });
        }
      })
      .catch(() => {});
  }, []);

  const handleTranslate = (lang?: string) => {
    const targetLang = lang || countryInfo?.lang || "fr";
    loadGoogleTranslate(targetLang);
    setTranslated(true);
    setShowDropdown(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setDismissed(true);
  };

  if (dismissed || !countryInfo) return (
    // Hidden container required for Google Translate
    <div id="google_translate_element" className="hidden" />
  );

  return (
    <>
      <div id="google_translate_element" className="hidden" />
      {!translated && (
        <div className="fixed bottom-24 left-4 z-50 max-w-xs animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-card border border-border rounded-xl shadow-lg p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Translate this page?</p>
                  <p className="text-xs text-muted-foreground">We detected you're in {countryInfo.countryName}</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleTranslate()}
              >
                Translate to {countryInfo.nativeName}
              </Button>
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs px-2"
                  onClick={() => setShowDropdown(!showDropdown)}
                  aria-label="Other languages"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                {showDropdown && (
                  <div className="absolute bottom-full right-0 mb-1 w-44 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="max-h-48 overflow-y-auto">
                      {Object.entries(TRANSLATE_COUNTRIES)
                        .filter(([code]) => code !== countryInfo.countryCode)
                        .slice(0, 12)
                        .map(([code, info]) => (
                          <button
                            key={code}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors"
                            onClick={() => handleTranslate(info.lang)}
                          >
                            {info.nativeName} <span className="text-muted-foreground">({info.name})</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Powered by Google Translate
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default TranslateWidget;
