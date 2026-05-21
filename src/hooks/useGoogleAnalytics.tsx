import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_MEASUREMENT_ID = "G-9H1PRWJ0YM";
const STORAGE_KEY = "cookie-consent-v2";

const hasAnalyticsConsent = (): boolean => {
  try {
    // New consent banner (v2) — JSON with granular prefs
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.prefs?.analytics === true;
    }
    // Backwards compatibility with old banner
    return localStorage.getItem("cookie-consent") === "accepted";
  } catch {
    return false;
  }
};

const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!hasAnalyticsConsent()) return;

    // Load gtag script if not already loaded
    if (!document.getElementById("ga-script")) {
      const script = document.createElement("script");
      script.id = "ga-script";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);

      const inlineScript = document.createElement("script");
      inlineScript.id = "ga-inline";
      inlineScript.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
      `;
      document.head.appendChild(inlineScript);
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (!hasAnalyticsConsent()) return;

    if (typeof window.gtag === "function") {
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
};

export default useGoogleAnalytics;
