import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, Briefcase, MapPin } from "lucide-react";

type JobPosting = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  requirements: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
};

const categoryLabel: Record<string, string> = {
  employment: "Full-Time",
  freelancing: "Freelance",
  trainee: "Trainee",
};

const emptyForm = {
  title: "",
  description: "",
  category: "employment",
  location: "Kampala, Uganda",
  requirements: "",
  is_active: true,
  display_order: 0,
};

const JobPostingsManagement = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["admin_job_postings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as JobPosting[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: typeof emptyForm) => {
      if (editingJob) {
        const { error } = await supabase.from("job_postings").update(values).eq("id", editingJob.id);
        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from("job_postings").insert({ ...values, created_by: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_job_postings"] });
      queryClient.invalidateQueries({ queryKey: ["job_postings"] });
      toast.success(editingJob ? "Job posting updated" : "Job posting created");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("job_postings").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_job_postings"] });
      queryClient.invalidateQueries({ queryKey: ["job_postings"] });
      toast.success("Status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("job_postings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_job_postings"] });
      queryClient.invalidateQueries({ queryKey: ["job_postings"] });
      toast.success("Job posting deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = () => {
    setEditingJob(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (job: JobPosting) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      description: job.description || "",
      category: job.category,
      location: job.location || "Kampala, Uganda",
      requirements: job.requirements || "",
      is_active: job.is_active,
      display_order: job.display_order,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    saveMutation.mutate(form);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Job Postings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage open positions on the Careers page</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> New Posting
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
        </div>
      )}

      {!isLoading && jobs.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground font-bold mb-2">No job postings yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Create your first posting to display it on the Careers page.</p>
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Create First Posting
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="bg-background border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">{categoryLabel[job.category] || job.category}</Badge>
                {job.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                )}
                <Badge variant={job.is_active ? "default" : "secondary"} className="text-xs">
                  {job.is_active ? "Live" : "Hidden"}
                </Badge>
              </div>
              <h3 className="font-bold text-foreground">{job.title}</h3>
              {job.description && (
                <p className="text-muted-foreground text-sm mt-0.5 line-clamp-1">{job.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleMutation.mutate({ id: job.id, is_active: !job.is_active })}
                title={job.is_active ? "Hide" : "Show"}
              >
                {job.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => openEdit(job)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm("Delete this job posting?")) deleteMutation.mutate(job.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Edit Job Posting" : "New Job Posting"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Job Title *</label>
              <Input
                placeholder="e.g. Videographer"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Category</label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employment">Full-Time Employment</SelectItem>
                  <SelectItem value="freelancing">Freelancing</SelectItem>
                  <SelectItem value="trainee">Trainee / Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Location</label>
              <Input
                placeholder="Kampala, Uganda"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Description</label>
              <Textarea
                placeholder="Describe the role, responsibilities, and what success looks like..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Requirements</label>
              <Textarea
                placeholder="List skills, experience, and qualifications required..."
                value={form.requirements}
                onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                rows={4}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Display Order</label>
              <Input
                type="number"
                min={0}
                value={form.display_order}
                onChange={(e) => setForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-foreground">
                Visible on Careers page
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {saveMutation.isPending ? "Saving…" : editingJob ? "Save Changes" : "Create Posting"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobPostingsManagement;
