import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Users, Trash2, Edit, ArrowRight, FolderKanban } from "lucide-react";
import { format } from "date-fns";

type ProjectStatus = "lead" | "in_progress" | "completed" | "cancelled";

interface Project {
  id: string;
  title: string;
  description: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  status: ProjectStatus;
  lead_id: string | null;
  budget: number | null;
  start_date: string | null;
  deadline: string | null;
  completed_at: string | null;
  created_at: string;
}

interface TeamMember {
  id: string;
  project_id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  industry_type: string | null;
  geographic_location: string | null;
}

const statusColors: Record<ProjectStatus, string> = {
  lead: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const teamRoles = ["Director", "Producer", "Editor", "Cinematographer", "Sound Engineer", "Writer", "Designer", "Marketing"];

const ProjectsManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client_name: "",
    client_email: "",
    client_phone: "",
    status: "lead" as ProjectStatus,
    budget: "",
    start_date: "",
    deadline: "",
    video_url: "",
    show_on_website: false,
  });
  const [teamForm, setTeamForm] = useState({ name: "", role: "", email: "", phone: "" });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["unconverted-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("status", "new")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team-members", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const { data, error } = await supabase
        .from("project_team_members")
        .select("*")
        .eq("project_id", selectedProjectId);
      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!selectedProjectId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("projects").insert([{
        title: data.title,
        description: data.description || null,
        client_name: data.client_name,
        client_email: data.client_email || null,
        client_phone: data.client_phone || null,
        status: data.status,
        budget: data.budget ? parseFloat(data.budget) : null,
        start_date: data.start_date || null,
        deadline: data.deadline || null,
        video_url: data.video_url || null,
        show_on_website: data.show_on_website,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created");
      resetForm();
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const updateData: any = {
        title: data.title,
        description: data.description || null,
        client_name: data.client_name,
        client_email: data.client_email || null,
        client_phone: data.client_phone || null,
        status: data.status,
        budget: data.budget ? parseFloat(data.budget) : null,
        start_date: data.start_date || null,
        deadline: data.deadline || null,
        video_url: data.video_url || null,
        show_on_website: data.show_on_website,
      };
      if (data.status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }
      const { error } = await supabase.from("projects").update(updateData).eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated");
      resetForm();
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const convertLeadMutation = useMutation({
    mutationFn: async (lead: Lead) => {
      const { error: projectError } = await supabase.from("projects").insert([{
        title: `Project for ${lead.name}`,
        client_name: lead.name,
        client_email: lead.email,
        client_phone: lead.phone,
        lead_id: lead.id,
        status: "lead",
      }]);
      if (projectError) throw projectError;
      
      const { error: leadError } = await supabase.from("leads").update({ status: "converted" }).eq("id", lead.id);
      if (leadError) throw leadError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["unconverted-leads"] });
      toast.success("Lead converted to project");
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const addTeamMemberMutation = useMutation({
    mutationFn: async (data: typeof teamForm & { project_id: string }) => {
      const { error } = await supabase.from("project_team_members").insert([{
        project_id: data.project_id,
        name: data.name,
        role: data.role,
        email: data.email || null,
        phone: data.phone || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Team member added");
      setTeamForm({ name: "", role: "", email: "", phone: "" });
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const removeTeamMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Team member removed");
    },
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", client_name: "", client_email: "", client_phone: "", status: "lead", budget: "", start_date: "", deadline: "", video_url: "", show_on_website: false });
    setEditingProject(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || "",
      client_name: project.client_name,
      client_email: project.client_email || "",
      client_phone: project.client_phone || "",
      status: project.status,
      budget: project.budget?.toString() || "",
      start_date: project.start_date || "",
      deadline: project.deadline || "",
      video_url: (project as any).video_url || "",
      show_on_website: (project as any).show_on_website || false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateMutation.mutate({ ...formData, id: editingProject.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openTeamDialog = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsTeamDialogOpen(true);
  };

  const stats = {
    total: projects.length,
    lead: projects.filter(p => p.status === "lead").length,
    inProgress: projects.filter(p => p.status === "in_progress").length,
    completed: projects.filter(p => p.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit" : "Create"} Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Project Title</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div>
                  <Label>Client Name</Label>
                  <Input value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} required />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v: ProjectStatus) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Client Email</Label>
                  <Input type="email" value={formData.client_email} onChange={(e) => setFormData({ ...formData, client_email: e.target.value })} />
                </div>
                <div>
                  <Label>Client Phone</Label>
                  <Input value={formData.client_phone} onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })} />
                </div>
                <div>
                  <Label>Budget ($)</Label>
                  <Input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Video URL (YouTube embed)</Label>
                  <Input value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} placeholder="https://www.youtube.com/embed/..." />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="show_on_website" checked={formData.show_on_website} onChange={(e) => setFormData({ ...formData, show_on_website: e.target.checked })} className="h-4 w-4" />
                  <Label htmlFor="show_on_website">Show on website (only completed projects will display)</Label>
                </div>
              </div>
              <Button type="submit" className="w-full">{editingProject ? "Update" : "Create"} Project</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Leads</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{stats.lead}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">In Progress</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Completed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.completed}</div></CardContent></Card>
      </div>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects"><FolderKanban className="mr-2 h-4 w-4" />Projects</TabsTrigger>
          <TabsTrigger value="convert"><ArrowRight className="mr-2 h-4 w-4" />Convert Leads ({leads.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <Card>
            <CardContent className="pt-6">
              {isLoading ? <p>Loading...</p> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.title}</TableCell>
                        <TableCell>{p.client_name}</TableCell>
                        <TableCell><Badge className={statusColors[p.status]}>{p.status.replace("_", " ")}</Badge></TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${(p as any).show_on_website ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>
                            {(p as any).show_on_website ? "Visible" : "Hidden"}
                          </span>
                        </TableCell>
                        <TableCell>{p.budget ? `$${Number(p.budget).toLocaleString()}` : "-"}</TableCell>
                        <TableCell>{p.deadline ? format(new Date(p.deadline), "MMM d, yyyy") : "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openTeamDialog(p.id)}><Users className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="convert">
          <Card>
            <CardHeader>
              <CardTitle>Unconverted Leads</CardTitle>
              <CardDescription>Convert new leads into projects</CardDescription>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? <p className="text-muted-foreground">No unconverted leads</p> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.industry_type || "-"}</TableCell>
                        <TableCell>{lead.geographic_location || "-"}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => convertLeadMutation.mutate(lead)}>
                            <ArrowRight className="mr-2 h-4 w-4" /> Convert
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Team Management Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Team Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <Input placeholder="Name" value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} />
              <Select value={teamForm.role} onValueChange={(v) => setTeamForm({ ...teamForm, role: v })}>
                <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  {teamRoles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Email" value={teamForm.email} onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })} />
              <Button onClick={() => selectedProjectId && addTeamMemberMutation.mutate({ ...teamForm, project_id: selectedProjectId })} disabled={!teamForm.name || !teamForm.role}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.name}</TableCell>
                    <TableCell><Badge variant="outline">{m.role}</Badge></TableCell>
                    <TableCell>{m.email || "-"}</TableCell>
                    <TableCell><Button variant="ghost" size="sm" onClick={() => removeTeamMemberMutation.mutate(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsManagement;
