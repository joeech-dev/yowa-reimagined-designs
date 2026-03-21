import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Send, User, Mail, Phone, MapPin } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().min(10, "Phone must be at least 10 characters").max(20),
  service: z.string().min(1, "Please select a service"),
  geographic_location: z.string().min(2, "Location is required").max(100),
  website: z.string().max(0, "").optional(),
});

type FormData = z.infer<typeof formSchema>;

const services = [
  { value: "video-production", label: "Video Production" },
  { value: "photography", label: "Photography" },
  { value: "photowalk", label: "Photowalk" },
  { value: "post-production", label: "Post Production" },
  { value: "creative-strategy", label: "Creative Strategy" },
  { value: "digital-marketing", label: "Digital Marketing" },
];

export const LeadCaptureForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get("service") || "";

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: preselectedService,
      geographic_location: "",
      website: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (data.website) {
      setSubmitted(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        industry_type: data.service,
        geographic_location: data.geographic_location,
        status: "new",
        is_recruitment: false,
      }]);
      if (error) throw error;

      supabase.functions.invoke("notify-new-lead", {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          industry_type: data.service,
          geographic_location: data.geographic_location,
          is_recruitment: false,
        },
      }).catch(console.error);

      try {
        await supabase.functions.invoke("systeme-add-contact", {
          body: {
            email: data.email,
            name: data.name,
            phone: data.phone,
            tags: ["new-lead", "website-form", `service-${data.service}`, `location-${data.geographic_location.toLowerCase().replace(/\s+/g, "-")}`],
          },
        });
      } catch (e) {
        console.error("Email automation error:", e);
      }

      setSubmitted(true);
      form.reset();
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-background rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="bg-primary p-8 text-center">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-7 w-7 text-secondary-foreground" />
          </div>
          <h3 className="text-primary-foreground text-2xl font-display font-bold mb-2">You're all set!</h3>
          <p className="text-primary-foreground/80 text-sm">We've received your message and will get back to you within 24 hours.</p>
        </div>
        <div className="p-8 text-center">
          <p className="text-muted-foreground text-sm mb-4">In the meantime, explore our work or reach out via WhatsApp.</p>
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => setSubmitted(false)}
          >
            Submit Another Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Form header */}
      <div className="bg-primary px-8 py-6">
        <h2 className="text-primary-foreground text-xl font-display font-bold">Get in Touch</h2>
        <p className="text-primary-foreground/70 text-sm mt-1">Tell us about your project</p>
      </div>

      {/* Progress indicator */}
      <div className="h-1 bg-muted">
        <div className="h-1 bg-secondary w-0 transition-all duration-500" />
      </div>

      <div className="px-8 py-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Name & Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> Full Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" className="bg-muted border-0 focus-visible:ring-primary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" className="bg-muted border-0 focus-visible:ring-primary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Phone & Location row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> Phone
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+256 700 000 000" className="bg-muted border-0 focus-visible:ring-primary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="geographic_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Location
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Kampala, Uganda" className="bg-muted border-0 focus-visible:ring-primary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Service selector */}
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    What service are you interested in?
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-muted border-0 focus:ring-primary">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Honeypot */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem className="hidden" aria-hidden="true">
                  <FormControl><Input tabIndex={-1} autoComplete="off" {...field} /></FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base rounded-xl flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Submitting…
                </span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>

            {/* Careers nudge */}
            <p className="text-xs text-muted-foreground text-center">
              Looking to join our team?{" "}
              <Link to="/careers" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> View open positions
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
};
