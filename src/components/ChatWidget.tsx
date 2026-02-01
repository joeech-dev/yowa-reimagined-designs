import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Phone, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const WHATSAPP_PHONE = "+256779180984";
const EMAIL = "info@yowainnovations.com";

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);

  const quickActions = [
    {
      label: "Documentary Production",
      message: "Hi! I'm interested in documentary production services.",
    },
    {
      label: "Digital Marketing",
      message: "Hi! I'd like to learn about your digital marketing services.",
    },
    {
      label: "Content Creation",
      message: "Hi! I need help with content creation.",
    },
    {
      label: "Get a Quote",
      message: "Hi! I'd like to request a quote for my project.",
    },
  ];

  const openWhatsApp = (message: string) => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`, "_blank", "noopener");
  };

  const openEmail = () => {
    window.location.href = `mailto:${EMAIL}?subject=Project Inquiry`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Panel */}
      <div
        className={cn(
          "absolute bottom-16 right-0 w-80 transition-all duration-300 origin-bottom-right",
          open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        <Card className="shadow-xl border-border overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Hey there! 👋</CardTitle>
                <p className="text-sm opacity-90 mt-1">How can we help you today?</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-white/20"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Quick start:</p>
              <div className="grid gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto py-2 px-3 text-left"
                    onClick={() => openWhatsApp(action.message)}
                  >
                    <Send className="h-3 w-3 mr-2 shrink-0" />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Contact Options */}
            <div className="pt-2 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Or reach us via:</p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => openWhatsApp("Hi! I'd like to connect with Yowa Innovations.")}
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={openEmail}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              </div>
            </div>

            {/* Office Info */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                <span>Kampala, Uganda • Response within 24 hours</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toggle Button */}
      <Button
        size="lg"
        className={cn(
          "rounded-full h-14 w-14 shadow-lg transition-all duration-300",
          open ? "bg-foreground hover:bg-foreground/90 rotate-0" : "bg-primary hover:bg-primary/90"
        )}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};

export default ChatWidget;
