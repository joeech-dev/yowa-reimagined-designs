import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Loader2, CheckCircle2 } from "lucide-react";

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  industry_type: string;
  budget_range: string;
  geographic_location: string;
  notes: string;
}

const budgetRanges = [
  "Below $500 / UGX 1,800,000",
  "$500 – $1,000 / UGX 1.8M – 3.7M",
  "$1,000 – $5,000 / UGX 3.7M – 18.5M",
  "$5,000 – $10,000 / UGX 18.5M – 37M",
  "$10,000+ / UGX 37M+",
  "To be discussed",
];

const industryTypes = [
  "Agriculture",
  "Education",
  "Finance & Banking",
  "Government",
  "Health & Wellness",
  "Hospitality & Tourism",
  "Manufacturing",
  "Media & Entertainment",
  "NGO / Non-profit",
  "Real Estate",
  "Retail & E-commerce",
  "Technology",
  "Transport & Logistics",
  "Other",
];

const LeadAcquisitionForm = () => {
  const { profile } = useProfile();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LeadFormData>();

  const onSubmit = async (data: LeadFormData) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("leads").insert({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        industry_type: data.industry_type || null,
        budget_range: data.budget_range || null,
        geographic_location: data.geographic_location.trim() || null,
        status: "new",
        is_recruitment: false,
        submitted_by_id: user?.id ?? null,
        submitted_by_name: profile?.full_name ?? user?.email ?? "Unknown",
      });

      if (error) throw error;

      setSuccess(true);
      reset();
      toast.success("Lead submitted successfully!");

      // Reset success state after 4 seconds
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      console.error("Lead submission error:", err);
      const message = err instanceof Error ? err.message : "Failed to submit lead";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <UserPlus className="h-7 w-7 text-primary" />
          Submit a Lead
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Capture a new potential client. The lead will be automatically attributed to{" "}
          <span className="font-medium text-foreground">{profile?.full_name || "you"}</span>.
        </p>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5 text-primary">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Lead submitted successfully!</p>
            <p className="text-sm text-muted-foreground">It has been added to the shared leads list.</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lead Details</CardTitle>
          <CardDescription>Fill in the prospect's contact and qualification information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Contact Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  placeholder="e.g. Sarah Nakato"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                <Input
                  id="phone"
                  placeholder="+256 700 000 000"
                  {...register("phone", { required: "Phone is required" })}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="sarah@company.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email address" },
                })}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Qualification Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Industry / Sector</Label>
                <Select onValueChange={(v) => setValue("industry_type", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryTypes.map((i) => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Budget Range</Label>
                <Select onValueChange={(v) => setValue("budget_range", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="geographic_location">Location / City</Label>
              <Input
                id="geographic_location"
                placeholder="e.g. Kampala, Uganda"
                {...register("geographic_location")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any extra context, how you met them, what they need…"
                rows={3}
                {...register("notes")}
              />
            </div>

            {/* Submitter info */}
            <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              This lead will be recorded as submitted by{" "}
              <span className="font-medium text-foreground">{profile?.full_name || "you"}</span>
              {profile?.position ? ` (${profile.position})` : ""}.
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Submit Lead
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadAcquisitionForm;
