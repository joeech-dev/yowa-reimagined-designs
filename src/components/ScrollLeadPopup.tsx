import { useState, useEffect } from "react";
import { X, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const POPUP_DISMISSED_KEY = "yowa_lead_popup_dismissed";
const DISMISS_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

const ScrollLeadPopup = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(POPUP_DISMISSED_KEY);
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DURATION_MS) return;

    let triggered = false;
    const timer = setTimeout(() => {
      if (!triggered) {
        triggered = true;
        setVisible(true);
      }
    }, 15000);

    const handleScroll = () => {
      if (triggered) return;
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent >= 0.4) {
        triggered = true;
        setVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(POPUP_DISMISSED_KEY, String(Date.now()));
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">Free Resources</p>
            <h3 className="font-display font-bold text-xl text-foreground">Grow Your Brand</h3>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          Explore our collection of eBooks, videos, and creative tools designed to help you tell impactful stories and scale your business.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1" onClick={dismiss}>
            <Link to="/shop">
              Browse Shop
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1" onClick={dismiss}>
            <Link to="/get-started">
              Get Started
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground/60 text-center mt-4">
          No spam. Just creative resources.
        </p>
      </div>
    </div>
  );
};

export default ScrollLeadPopup;
