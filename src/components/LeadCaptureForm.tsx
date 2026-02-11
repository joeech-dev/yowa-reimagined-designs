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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, FileText, IdCard } from "lucide-react";

const POSITION_VALUES = ["employment", "freelancing", "trainee"];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().min(10, "Phone must be at least 10 characters").max(20),
  service: z.string().min(1, "Please select a service"),
  geographic_location: z.string().min(2, "Location is required").max(100),
  website: z.string().max(0, "").optional(), // honeypot field
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

const positions = [
  { value: "employment", label: "Employment" },
  { value: "freelancing", label: "Freelancing" },
  { value: "trainee", label: "Trainee" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"];

export const LeadCaptureForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get("service") || "";
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [fileErrors, setFileErrors] = useState<{ cv?: string; id?: string }>({});

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

  const selectedService = form.watch("service");
  const isPosition = POSITION_VALUES.includes(selectedService);

  const validateFile = (file: File | null, field: "cv" | "id"): boolean => {
    if (!file) {
      setFileErrors((prev) => ({ ...prev, [field]: `Please attach your ${field === "cv" ? "CV" : "National ID"}` }));
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileErrors((prev) => ({ ...prev, [field]: "File must be under 5MB" }));
      return false;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileErrors((prev) => ({ ...prev, [field]: "Only PDF, DOC, DOCX, JPG, PNG allowed" }));
      return false;
    }
    setFileErrors((prev) => ({ ...prev, [field]: undefined }));
    return true;
  };

  const uploadFile = async (file: File, prefix: string, email: string): Promise<string | null> => {
    const safeName = email.replace(/[^a-zA-Z0-9]/g, "_");
    const ext = file.name.split(".").pop();
    const path = `${prefix}/${safeName}_${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("applicant-documents")
      .upload(path, file, { upsert: false });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    return path;
  };

  const onSubmit = async (data: FormData) => {
    if (data.website) {
      toast.success("Thank you! We'll be in touch soon.");
      form.reset();
      return;
    }

    // Validate files if position selected
    if (isPosition) {
      const cvValid = validateFile(cvFile, "cv");
      const idValid = validateFile(idFile, "id");
      if (!cvValid || !idValid) return;
    }

    setIsSubmitting(true);

    try {
      let cvUrl: string | null = null;
      let idUrl: string | null = null;

      if (isPosition && cvFile && idFile) {
        const [cvResult, idResult] = await Promise.all([
          uploadFile(cvFile, "cv", data.email),
          uploadFile(idFile, "national-id", data.email),
        ]);

        if (!cvResult || !idResult) {
          toast.error("Failed to upload documents. Please try again.");
          setIsSubmitting(false);
          return;
        }
        cvUrl = cvResult;
        idUrl = idResult;
      }

      const { error } = await supabase.from("leads").insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        industry_type: data.service,
        geographic_location: data.geographic_location,
        status: "new",
        cv_url: cvUrl,
        national_id_url: idUrl,
        is_recruitment: isPosition,
      }]);

      if (error) throw error;

      try {
        await supabase.functions.invoke('systeme-add-contact', {
          body: {
            email: data.email,
            name: data.name,
            phone: data.phone,
            tags: [
              'new-lead',
              'website-form',
              `service-${data.service}`,
              `location-${data.geographic_location.toLowerCase().replace(/\s+/g, '-')}`,
            ],
          },
        });
      } catch (emailError) {
        console.error('Email automation error:', emailError);
      }

      toast.success("Thank you! We'll be in touch soon.");
      form.reset();
      setCvFile(null);
      setIdFile(null);
      setFileErrors({});
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Get Started</CardTitle>
        <CardDescription>
          Tell us about your project or apply to join our team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What are you interested in?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem disabled value="services-header" className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                        Our Services
                      </SelectItem>
                      {services.map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          {service.label}
                        </SelectItem>
                      ))}
                      <SelectItem disabled value="positions-header" className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mt-2">
                        Join Our Team
                      </SelectItem>
                      {positions.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditionally show file uploads for positions */}
            {isPosition && (
              <div className="space-y-4 p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5">
                <p className="text-sm font-medium text-primary">
                  Please attach the following documents:
                </p>

                {/* CV Upload */}
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" /> CV / Resume
                  </label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setCvFile(file);
                        if (file) validateFile(file, "cv");
                      }}
                    />
                  </div>
                  {cvFile && <p className="text-xs text-muted-foreground mt-1">✓ {cvFile.name}</p>}
                  {fileErrors.cv && <p className="text-xs text-destructive mt-1">{fileErrors.cv}</p>}
                </div>

                {/* National ID Upload */}
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <IdCard className="h-4 w-4" /> Copy of National ID
                  </label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setIdFile(file);
                        if (file) validateFile(file, "id");
                      }}
                    />
                  </div>
                  {idFile && <p className="text-xs text-muted-foreground mt-1">✓ {idFile.name}</p>}
                  {fileErrors.id && <p className="text-xs text-destructive mt-1">{fileErrors.id}</p>}
                </div>

                <p className="text-xs text-muted-foreground">
                  Accepted: PDF, DOC, DOCX, JPG, PNG (max 5MB each)
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="geographic_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Honeypot field */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem className="hidden" aria-hidden="true">
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input tabIndex={-1} autoComplete="off" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : isPosition ? "Submit Application" : "Submit"}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Prefer chatting? Use the chat bubble at the bottom-right.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
