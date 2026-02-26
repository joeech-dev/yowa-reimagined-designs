import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const WHATSAPP_URL = "https://wa.me/256786155557";

/**
 * Floating WhatsApp button shown on all public pages.
 * Tapping it opens a WhatsApp conversation directly — safe because
 * wa.me is WhatsApp's official link scheme, no personal data is
 * transmitted in the URL, and the link is opened in a new tab with
 * noopener to prevent tab-napping.
 */
export const WhatsAppButton = () => {
  const location = useLocation();

  // Hide on admin and auth routes
  if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-14 h-14 rounded-full shadow-lg",
        "flex items-center justify-center",
        "bg-[#25D366] hover:bg-[#1ebe5d] active:bg-[#17a84f]",
        "transition-transform duration-200 hover:scale-110 active:scale-95",
        "focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      )}
    >
      {/* Official WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-8 h-8"
        fill="white"
        aria-hidden="true"
      >
        <path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.65 4.77 1.78 6.78L2 30l7.4-1.75A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.2 0-4.3-.58-6.13-1.6l-.44-.26-4.58 1.08 1.1-4.44-.28-.46A11.47 11.47 0 0 1 4.5 16C4.5 9.6 9.6 4.5 16 4.5S27.5 9.6 27.5 16 22.4 27.5 16 27.5zm6.3-8.62c-.35-.17-2.06-1.02-2.38-1.13-.32-.12-.56-.17-.79.17-.24.34-.9 1.13-1.1 1.37-.2.23-.41.26-.76.09-.35-.17-1.47-.54-2.8-1.72-1.04-.93-1.74-2.07-1.94-2.42-.2-.35-.02-.54.15-.71.16-.16.35-.41.52-.62.18-.2.24-.35.35-.58.12-.23.06-.44-.03-.61-.09-.17-.79-1.9-1.08-2.6-.28-.69-.57-.6-.79-.61-.2-.01-.44-.01-.67-.01s-.61.09-.93.44c-.32.35-1.22 1.19-1.22 2.9s1.25 3.36 1.42 3.59c.17.23 2.45 3.74 5.94 5.25.83.36 1.48.57 1.98.73.83.26 1.59.23 2.19.14.67-.1 2.06-.84 2.35-1.65.29-.81.29-1.5.2-1.65-.09-.15-.32-.24-.67-.41z" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
