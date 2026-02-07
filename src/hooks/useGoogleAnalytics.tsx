import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_MEASUREMENT_ID = "G-9H1PRWJ0YM";

const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (consent !== "accepted") return;

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
    const consent = localStorage.getItem("cookie-consent");
    if (consent !== "accepted") return;

    if (typeof window.gtag === "function") {
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
};

export default useGoogleAnalytics;
