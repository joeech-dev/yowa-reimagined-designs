import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, MessageSquare } from "lucide-react";

const WHATSAPP_PHONE = "+256779180984";
const DEFAULT_MESSAGE = `Welcome to Yowa Innovations! 👋\nLet's create something amazing together.\n\nWhat service are you interested in?\n🎬 Documentary Production\n📱 Digital Marketing\n🎨 Content Creation`;

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [selected, setSelected] = useState<string | null>(null);

  const presets = useMemo(
    () => [
      "Documentary Production",
      "Digital Marketing",
      "Content Creation",
    ],
    [],
  );

  const openWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${encodeURIComponent(WHATSAPP_PHONE)}?text=${encoded}`;
    window.open(url, "_blank", "noopener");
  };

  const openMessenger = () => {
    // Note: Messenger opens in a new tab (cannot be embedded due to platform restrictions)
    window.open("https://m.me/102134759442547", "_blank", "noopener");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="shadow-md">
            <MessageCircle className="h-4 w-4" />
            Chat
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chat with Yowa Innovations</DialogTitle>
            <DialogDescription>
              Pick a quick message or write your own, then choose a platform.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant={selected === p ? "default" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setSelected(p);
                    setMessage(`Hi! I'm interested in ${p}.`);
                  }}
                >
                  {p}
                </Button>
              ))}
              <Button
                type="button"
                variant={selected === null ? "default" : "secondary"}
                size="sm"
                onClick={() => {
                  setSelected(null);
                  setMessage(DEFAULT_MESSAGE);
                }}
              >
                Use default
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your message</label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button onClick={openWhatsApp} className="w-full" type="button">
                <MessageSquare className="h-4 w-4" /> Open WhatsApp
              </Button>
              <Button onClick={openMessenger} variant="secondary" className="w-full" type="button">
                <MessageCircle className="h-4 w-4" /> Open Messenger
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatWidget;
