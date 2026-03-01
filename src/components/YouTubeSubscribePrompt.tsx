import { useState, useEffect, useRef } from "react";
import { Youtube, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

// Replace with your actual YouTube channel URL / ID
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@yowa_inn?sub_confirmation=1";

interface YouTubeSubscribePromptProps {
  /** Seconds after video starts before the prompt appears */
  delaySeconds?: number;
  onDismiss?: () => void;
}

const YouTubeSubscribePrompt = ({ delaySeconds = 15, onDismiss }: YouTubeSubscribePromptProps) => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem("yt_subscribe_dismissed")) return;

    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, delaySeconds * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [delaySeconds]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("yt_subscribe_dismissed", "1");
    onDismiss?.();
  };

  const handleSubscribe = () => {
    window.open(YOUTUBE_CHANNEL_URL, "_blank", "noopener,noreferrer");
    handleDismiss();
  };

  if (dismissed || !visible) return null;

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500"
      role="dialog"
      aria-label="Subscribe to our YouTube channel"
    >
      <div className="bg-background/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4">
        {/* YouTube icon */}
        <div className="w-11 h-11 rounded-full bg-destructive flex items-center justify-center flex-shrink-0">
          <Youtube className="h-5 w-5 text-destructive-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">Enjoying this?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Subscribe to see more stories from East Africa.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            size="sm"
            onClick={handleSubscribe}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs px-3 h-8 rounded-full gap-1.5"
          >
            <Bell className="h-3 w-3" />
            Subscribe
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouTubeSubscribePrompt;
