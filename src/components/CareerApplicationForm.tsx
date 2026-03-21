import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { FileText, IdCard, Send, User, Mail, Phone, MapPin } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().min(10, "Phone must be at least 10 characters").max(20),
  position_type: z.string().min(1, "Please select a position type"),
  geographic_location: z.string().min(2, "Location is required").max(100),
  website: z.string().max(0, "").optional(),
});

type FormData = z.infer<typeof formSchema>;

const positionTypes = [
  { value: "employment", label: "Full-Time Employment" },
  { value: "freelancing", label: "Freelancing" },
  { value: "trainee", label: "Trainee / Internship" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

type Props = {
  jobTitle?: string;
  jobCategory?: string;
  onSuccess?: () => void;
};

export const CareerApplicationForm = ({ jobTitle, jobCategory, onSuccess }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [fileErrors, setFileErrors] = useState<{ cv?: string; id?: string }>({});

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      position_type: jobCategory || "",
      geographic_location: "",
      website: "",
    },
  });

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
    const { error } = await supabase.storage.from("applicant-documents").upload(path, file, { upsert: false });
    if (error) { console.error("Upload error:", error); return null; }
    return path;
  };

  const onSubmit = async (data: FormData) => {
    if (data.website) { setSubmitted(true); return; }

    const cvValid = validateFile(cvFile, "cv");
    const idValid = validateFile(idFile, "id");
    if (!cvValid || !idValid) return;

    setIsSubmitting(true);
    try {
      const [cvResult, idResult] = await Promise.all([
        uploadFile(cvFile!, "cv", data.email),
        uploadFile(idFile!, "national-id", data.email),
      ]);
      if (!cvResult || !idResult) {
        toast.error("Failed to upload documents. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const industryType = jobTitle
        ? `${data.position_type} - ${jobTitle}`
        : data.position_type;

      const { error } = await supabase.from("leads").insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        industry_type: industryType,
        geographic_location: data.geographic_location,
        status: "new",
        cv_url: cvResult,
        national_id_url: idResult,
        is_recruitment: true,
      }]);
      if (error) throw error;

      supabase.functions.invoke("notify-new-lead", {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          industry_type: industryType,
          geographic_location: data.geographic_location,
          is_recruitment: true,
        },
      }).catch(console.error);

      setSubmitted(true);
      form.reset();
      setCvFile(null);
      setIdFile(null);
      setFileErrors({});
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="bg-primary p-8 text-center">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-7 w-7 text-secondary-foreground" />
          </div>
          <h3 className="text-primary-foreground text-2xl font-display font-bold mb-2">Application Received!</h3>
          <p className="text-primary-foreground/80 text-sm">
            Thank you for your interest in joining Yowa Innovations. We'll review your application and get in touch within 5–7 business days.
          </p>
        </div>
        <div className="p-8 text-center">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => setSubmitted(false)}
          >
            Submit Another Application
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="bg-primary px-8 py-6">
        <h2 className="text-primary-foreground text-xl font-display font-bold">
          {jobTitle ? `Apply: ${jobTitle}` : "Join Our Team"}
        </h2>
        <p className="text-primary-foreground/70 text-sm mt-1">
          Complete the form below and attach your documents.
        </p>
      </div>

      <div className="px-8 py-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Full Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="bg-muted border-0 focus-visible:ring-primary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" className="bg-muted border-0 focus-visible:ring-primary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Phone & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Phone
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+256 700 000 000" className="bg-muted border-0 focus-visible:ring-primary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="geographic_location" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Location
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Kampala, Uganda" className="bg-muted border-0 focus-visible:ring-primary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Position type */}
            <FormField control={form.control} name="position_type" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Position Type
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-muted border-0 focus:ring-primary">
                      <SelectValue placeholder="Select position type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {positionTypes.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Document uploads */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
              <p className="text-primary text-sm font-semibold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">!</span>
                Required documents
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <FileText className="h-3.5 w-3.5" /> CV / Resume
                  </label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="bg-background border-border cursor-pointer text-xs"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setCvFile(file);
                      if (file) validateFile(file, "cv");
                    }}
                  />
                  {cvFile && <p className="text-xs text-primary mt-1">✓ {cvFile.name}</p>}
                  {fileErrors.cv && <p className="text-xs text-destructive mt-1">{fileErrors.cv}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <IdCard className="h-3.5 w-3.5" /> National ID
                  </label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="bg-background border-border cursor-pointer text-xs"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setIdFile(file);
                      if (file) validateFile(file, "id");
                    }}
                  />
                  {idFile && <p className="text-xs text-primary mt-1">✓ {idFile.name}</p>}
                  {fileErrors.id && <p className="text-xs text-destructive mt-1">{fileErrors.id}</p>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Accepted: PDF, DOC, DOCX, JPG, PNG · Max 5MB each</p>
            </div>

            {/* Honeypot */}
            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem className="hidden" aria-hidden="true">
                <FormControl><Input tabIndex={-1} autoComplete="off" {...field} /></FormControl>
              </FormItem>
            )} />

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
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
