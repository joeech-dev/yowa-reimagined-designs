import { useState, useEffect } from "react";
import { X, ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BANNER_DISMISSED_KEY = "yowa_blog_cta_dismissed";

const BlogStickyCTA = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(BANNER_DISMISSED_KEY, "1");
  };

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <ShoppingBag className="h-5 w-5 shrink-0 text-secondary" />
            <p className="text-sm font-medium truncate">
              <span className="hidden sm:inline">Love this content? </span>
              Explore our creative resources — eBooks, videos & more.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              asChild
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <Link to="/shop">
                Visit Shop
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
            <button
              onClick={dismiss}
              className="p-1.5 rounded-full hover:bg-primary-foreground/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogStickyCTA;
