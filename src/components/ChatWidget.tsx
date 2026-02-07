import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle, X, Send, Phone, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const WHATSAPP_PHONE = "+256779180984";
const EMAIL = "info@yowainnovations.com";

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    service: "",
  });

  const quickActions = [
    { label: "Documentary Production", message: "Hi! I'm interested in documentary production services." },
    { label: "Digital Marketing", message: "Hi! I'd like to learn about your digital marketing services." },
    { label: "Content Creation", message: "Hi! I need help with content creation." },
    { label: "Get a Quote", message: "Hi! I'd like to request a quote for my project." },
  ];

  const openWhatsApp = (message: string) => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`, "_blank", "noopener");
  };

  const openEmail = () => {
    window.location.href = `mailto:${EMAIL}?subject=Project Inquiry`;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;
    
    setSubmitting(true);
    try {
      // Save to website_messages (goes to Sales Inbox)
      const { error: msgError } = await supabase.from("website_messages").insert([{
        visitor_name: formData.name.trim(),
        visitor_email: formData.email.trim(),
        visitor_phone: formData.phone.trim() || null,
        message: formData.message.trim(),
        service_interest: formData.service || null,
      }]);
      if (msgError) throw msgError;

      // Auto-create lead
      const { error: leadError } = await supabase.from("leads").insert([{
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || "Not provided",
        industry_type: formData.service || null,
        geographic_location: null,
        status: "new",
      }]);
      // Don't throw on lead error (might be duplicate email), just log
      if (leadError) console.warn("Lead creation note:", leadError.message);

      toast.success("Message sent! Our team will reach out to you soon.");
      setFormData({ name: "", email: "", phone: "", message: "", service: "" });
      setShowForm(false);
    } catch (error: any) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
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
                onClick={() => { setOpen(false); setShowForm(false); }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {showForm ? (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div>
                  <Label className="text-xs">Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Email *</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Service Interest</Label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    className="w-full h-8 text-sm border rounded-md px-2 bg-background"
                  >
                    <option value="">Select a service</option>
                    <option value="Video Production">Video Production</option>
                    <option value="Photography">Photography</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Post Production">Post Production</option>
                    <option value="Creative Strategy">Creative Strategy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Message *</Label>
                  <Textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required className="text-sm min-h-[60px]" placeholder="Tell us about your project..." />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setShowForm(false)}>Back</Button>
                  <Button type="submit" size="sm" className="flex-1" disabled={submitting}>
                    <Send className="h-3 w-3 mr-1" /> Send
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {/* Send Message Button */}
                <Button
                  variant="default"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setShowForm(true)}
                >
                  <Mail className="h-4 w-4" />
                  Send us a message
                </Button>

                {/* Quick WhatsApp Actions */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Quick WhatsApp:</p>
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
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1 gap-2" onClick={() => openWhatsApp("Hi! I'd like to connect with Yowa Innovations.")}>
                      <Phone className="h-4 w-4" /> WhatsApp
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1 gap-2" onClick={openEmail}>
                      <Mail className="h-4 w-4" /> Email
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
              </>
            )}
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
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default ChatWidget;
