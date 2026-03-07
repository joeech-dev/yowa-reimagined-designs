import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  Clock,
  MessageSquare,
  CheckCircle,
  User,
  AtSign,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const stats = [
  { value: "24h", label: "Response Time", icon: Clock },
  { value: "info@yowa.us", label: "Email Us", icon: Mail },
  { value: "+256 786 155 557", label: "Call / WhatsApp", icon: Phone },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Save to website_messages (shows in Sales Inbox)
      const { error: msgError } = await supabase
        .from("website_messages")
        .insert([
          {
            visitor_name: formData.name.trim(),
            visitor_email: formData.email.trim(),
            message: `Subject: ${formData.subject.trim()}\n\n${formData.message.trim()}`,
            service_interest: formData.subject.trim() || null,
          },
        ]);
      if (msgError) throw msgError;

      // Auto-create lead (best-effort)
      const { error: leadError } = await supabase.from("leads").insert([
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: "Not provided",
          status: "new",
        },
      ]);
      if (leadError) console.warn("Lead note:", leadError.message);

      // Trigger email notification (best-effort)
      supabase.functions
        .invoke("notify-new-lead", {
          body: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: "Not provided",
            subject: formData.subject.trim(),
            message: formData.message.trim(),
          },
        })
        .catch(console.error);

      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Contact Yowa Innovations Ltd | Free Consultation – Uganda Creative Agency"
        description="Contact Yowa Innovations for video production, photography & digital marketing services. Free consultation available. Based in Kampala, serving all of East Africa."
        keywords="contact yowa innovations, Uganda creative agency contact, video production inquiry Kampala, content creation consultation, digital marketing Uganda"
        url="https://yowa.us/contact"
      />
      <Navbar />

      <main className="flex-1">
        {/* ── Hero banner ── */}
        <section className="bg-primary pt-28 pb-16 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-secondary opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-secondary opacity-10 rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <div className="max-w-7xl mx-auto relative">
            <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/40 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-secondary text-sm font-semibold tracking-wide uppercase">
                Get in Touch
              </span>
            </div>
            <h1 className="text-primary-foreground text-4xl md:text-6xl font-display font-bold leading-tight max-w-3xl mb-4">
              Let's Start a{" "}
              <span className="text-secondary">Conversation</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl leading-relaxed">
              Whether you have a project idea, a question, or just want to say
              hello — we'd love to hear from you. Our team typically responds
              within 24 hours.
            </p>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <div className="bg-secondary">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-6 justify-around">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-secondary-foreground/70" />
                <span className="text-base font-display font-bold text-secondary-foreground">
                  {value}
                </span>
                <span className="text-secondary-foreground/70 text-sm font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main two-column section ── */}
        <section className="bg-muted py-16 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* ── Left: contact info ── */}
            <div>
              <h2 className="text-foreground text-3xl font-display font-bold mb-3">
                Find Us Here
              </h2>
              <p className="text-muted-foreground mb-8 text-base leading-relaxed">
                We're headquartered in Kampala and serve clients across Uganda
                and East Africa. Reach us by any channel that's most convenient
                for you.
              </p>

              <div className="space-y-5">
                {/* Address */}
                <div className="bg-background rounded-2xl border border-border p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Address
                    </p>
                    <p className="text-foreground font-medium text-sm leading-relaxed">
                      5th Street Industrial Area
                      <br />
                      Kampala, Uganda
                    </p>
                    <a
                      href="https://www.google.com/maps/place/Swangz+Avenue+Ltd/@0.3218743,32.6031823,18z"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs mt-1.5 inline-block font-semibold"
                    >
                      Get Directions →
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-background rounded-2xl border border-border p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Phone
                    </p>
                    <p className="text-foreground font-medium text-sm">
                      Press Contact:{" "}
                      <a
                        href="tel:+256786155557"
                        className="text-primary hover:underline"
                      >
                        +256 (0) 786 155 557
                      </a>
                    </p>
                    <p className="text-foreground font-medium text-sm mt-0.5">
                      Booking Agent:{" "}
                      <a
                        href="tel:+256779180984"
                        className="text-primary hover:underline"
                      >
                        +256 (0) 779 180 984
                      </a>
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-background rounded-2xl border border-border p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Email
                    </p>
                    <a
                      href="mailto:info@yowa.us"
                      className="text-primary hover:underline text-sm font-medium block"
                    >
                      info@yowa.us
                    </a>
                    <a
                      href="mailto:yowaaffiliatedigital@gmail.com"
                      className="text-primary hover:underline text-sm font-medium block mt-0.5"
                    >
                      yowaaffiliatedigital@gmail.com
                    </a>
                  </div>
                </div>

                {/* Working hours */}
                <div className="bg-background rounded-2xl border border-border p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Working Hours
                    </p>
                    <p className="text-foreground font-medium text-sm">
                      Mon – Fri: 8:00 AM – 6:00 PM (EAT)
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Sat: 9:00 AM – 2:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: contact form ── */}
            <div>
              {submitted ? (
                <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm">
                  <div className="bg-primary p-10 text-center">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-7 w-7 text-secondary-foreground" />
                    </div>
                    <h3 className="text-primary-foreground text-2xl font-display font-bold mb-2">
                      Message Received!
                    </h3>
                    <p className="text-primary-foreground/80 text-sm">
                      Thank you for reaching out. We'll get back to you within
                      24 hours.
                    </p>
                  </div>
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground text-sm mb-4">
                      In the meantime, explore our work or reach out via
                      WhatsApp.
                    </p>
                    <Button
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm">
                  {/* Form header */}
                  <div className="bg-primary px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <h2 className="text-primary-foreground text-xl font-display font-bold">
                          Send Us a Message
                        </h2>
                        <p className="text-primary-foreground/70 text-xs mt-0.5">
                          We read every message and respond promptly
                        </p>
                      </div>
                    </div>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="px-8 py-7 space-y-5"
                  >
                    {/* Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2"
                        >
                          <User className="h-3.5 w-3.5" /> Full Name
                        </label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          required
                          className="bg-muted border-0 focus-visible:ring-primary"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2"
                        >
                          <AtSign className="h-3.5 w-3.5" /> Email Address
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          className="bg-muted border-0 focus-visible:ring-primary"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label
                        htmlFor="subject"
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2"
                      >
                        <FileText className="h-3.5 w-3.5" /> Subject
                      </label>
                      <Input
                        id="subject"
                        placeholder="How can we help you?"
                        required
                        className="bg-muted border-0 focus-visible:ring-primary"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subject: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your project, idea or enquiry…"
                        rows={5}
                        required
                        className="bg-muted border-0 focus-visible:ring-primary resize-none"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            message: e.target.value,
                          })
                        }
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base rounded-xl flex items-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Sending…
                        </span>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Prefer chatting? Use the chat bubble at the
                      bottom-right.
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
