import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, FileText, IdCard, Eye, Send, Calendar, Clock, DollarSign, Plus, CalendarDays, UserCheck, Camera } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ─── Types ───────────────────────────────────────────────
interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  industry_type: string | null;
  geographic_location: string | null;
  status: string | null;
  created_at: string | null;
  cv_url: string | null;
  national_id_url: string | null;
}

interface TeamMember {
  id: string;
  full_name: string;
  role: string;
  category: "employee" | "freelancer" | "trainee";
  avatar_url: string | null;
  linkedin_url: string | null;
  is_active: boolean | null;
  display_order: number | null;
  created_at: string;
}

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  created_at: string;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  notes: string | null;
}

interface PayrollRecord {
  id: string;
  team_member_id: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  bonuses: number;
  deductions: number;
  net_pay: number;
  status: string;
  paid_at: string | null;
  notes: string | null;
  team_members?: { full_name: string; category: string } | null;
}

// ─── Recruitment Tab ─────────────────────────────────────
const RecruitmentTab = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => { fetchApplicants(); }, []);

  const fetchApplicants = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("is_recruitment", true)
      .order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load applications"); console.error(error); }
    else setApplicants(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) toast.error("Failed to update status");
    else { toast.success("Status updated"); fetchApplicants(); }
  };

  const filtered = applicants.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === "all" || a.industry_type?.toLowerCase() === categoryFilter;
    return matchSearch && matchCategory;
  });

  const statusColors: Record<string, string> = { new: "bg-blue-500", contacted: "bg-yellow-500", qualified: "bg-green-500", closed: "bg-muted-foreground" };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle>Recruitment Applications</CardTitle>
            <CardDescription>Manage team applications from the website</CardDescription>
          </div>
          <div className="flex gap-3">
            <Input placeholder="Search applicants..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="employment">Employment</SelectItem>
                <SelectItem value="freelancing">Freelancing</SelectItem>
                <SelectItem value="trainee">Trainee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <div className="text-center py-8 text-muted-foreground">Loading...</div> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{a.industry_type || "—"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{a.email}</div>
                    <div className="text-sm text-muted-foreground">{a.phone}</div>
                  </TableCell>
                  <TableCell className="text-sm">{a.geographic_location || "—"}</TableCell>
                  <TableCell>
                    <Select value={a.status || "new"} onValueChange={(v) => updateStatus(a.id, v)}>
                      <SelectTrigger className="w-32">
                        <Badge className={statusColors[a.status || "new"]}>{a.status || "new"}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm">{a.created_at ? new Date(a.created_at).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedApplicant(a)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => window.location.href = `mailto:${a.email}`}><Send className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {filtered.length === 0 && !loading && <div className="text-center py-8 text-muted-foreground">No applications found.</div>}

        <Dialog open={!!selectedApplicant} onOpenChange={() => setSelectedApplicant(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Applicant Details</DialogTitle>
              <DialogDescription>Full application information</DialogDescription>
            </DialogHeader>
            {selectedApplicant && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground">Name</label><p className="font-medium">{selectedApplicant.name}</p></div>
                  <div><label className="text-sm text-muted-foreground">Category</label><p className="capitalize">{selectedApplicant.industry_type || "—"}</p></div>
                  <div><label className="text-sm text-muted-foreground">Email</label><p>{selectedApplicant.email}</p></div>
                  <div><label className="text-sm text-muted-foreground">Phone</label><p>{selectedApplicant.phone}</p></div>
                  <div><label className="text-sm text-muted-foreground">Location</label><p>{selectedApplicant.geographic_location || "—"}</p></div>
                  <div><label className="text-sm text-muted-foreground">Status</label><Badge className={statusColors[selectedApplicant.status || "new"]}>{selectedApplicant.status || "new"}</Badge></div>
                </div>
                {(selectedApplicant.cv_url || selectedApplicant.national_id_url) && (
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Attached Documents</h4>
                    <div className="flex gap-3">
                      {selectedApplicant.cv_url && (
                        <Button variant="outline" size="sm" onClick={async (e) => {
                          e.preventDefault();
                          try {
                            const { data, error } = await supabase.storage.from('applicant-documents').createSignedUrl(selectedApplicant.cv_url!, 3600);
                            if (error) { toast.error("Could not access CV: " + error.message); return; }
                            if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                          } catch (err) { toast.error("Failed to access CV file"); }
                        }}><FileText className="h-4 w-4 mr-1" /> View CV</Button>
                      )}
                      {selectedApplicant.national_id_url && (
                        <Button variant="outline" size="sm" onClick={async (e) => {
                          e.preventDefault();
                          try {
                            const { data, error } = await supabase.storage.from('applicant-documents').createSignedUrl(selectedApplicant.national_id_url!, 3600);
                            if (error) { toast.error("Could not access ID: " + error.message); return; }
                            if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                          } catch (err) { toast.error("Failed to access National ID file"); }
                        }}><IdCard className="h-4 w-4 mr-1" /> View National ID</Button>
                      )}
                    </div>
                  </div>
                )}
                <div className="pt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedApplicant(null)}>Close</Button>
                  <Button onClick={() => window.location.href = `mailto:${selectedApplicant.email}`}><Send className="h-4 w-4 mr-2" /> Send Email</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// ─── Team Directory Tab ──────────────────────────────────
const TeamDirectoryTab = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState({ full_name: "", role: "", category: "employee" as const, linkedin_url: "", avatar_url: "" });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase.from("team_members").select("*").order("display_order", { ascending: true });
    if (error) toast.error("Failed to load team members");
    else setMembers(data || []);
    setLoading(false);
  };

  const uploadAvatar = async (file: File, memberId?: string): Promise<string | null> => {
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return null; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `team/${memberId || "new"}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      return publicUrl;
    } catch (e: any) {
      toast.error(`Upload failed: ${e.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const addMember = async () => {
    if (!newMember.full_name || !newMember.role) { toast.error("Name and role required"); return; }
    const { error } = await supabase.from("team_members").insert([{ full_name: newMember.full_name, role: newMember.role, category: newMember.category, linkedin_url: newMember.linkedin_url || null, avatar_url: newMember.avatar_url || null }]);
    if (error) toast.error("Failed to add team member");
    else { toast.success("Team member added"); setShowAddDialog(false); setNewMember({ full_name: "", role: "", category: "employee", linkedin_url: "", avatar_url: "" }); fetchMembers(); }
  };

  const saveEditMember = async () => {
    if (!editMember) return;
    const { error } = await supabase.from("team_members").update({ full_name: editMember.full_name, role: editMember.role, category: editMember.category, linkedin_url: editMember.linkedin_url, avatar_url: editMember.avatar_url }).eq("id", editMember.id);
    if (error) toast.error("Failed to update");
    else { toast.success("Member updated"); setEditMember(null); fetchMembers(); }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from("team_members").update({ is_active: !isActive }).eq("id", id);
    if (error) toast.error("Failed to update");
    else { toast.success(isActive ? "Deactivated" : "Activated"); fetchMembers(); }
  };

  const filtered = members.filter(m => categoryFilter === "all" || m.category === categoryFilter);
  const counts = { employee: members.filter(m => m.category === "employee").length, freelancer: members.filter(m => m.category === "freelancer").length, trainee: members.filter(m => m.category === "trainee").length };
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{counts.employee}</div><p className="text-sm text-muted-foreground">Employees</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{counts.freelancer}</div><p className="text-sm text-muted-foreground">Freelancers</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{counts.trainee}</div><p className="text-sm text-muted-foreground">Trainees</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div><CardTitle>Team Directory</CardTitle><CardDescription>All team members across categories</CardDescription></div>
            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="employee">Employees</SelectItem>
                  <SelectItem value="freelancer">Freelancers</SelectItem>
                  <SelectItem value="trainee">Trainees</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4 mr-2" /> Add Member</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-8 text-muted-foreground">Loading...</div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Photo</TableHead><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={m.avatar_url || ""} alt={m.full_name} className="object-cover" />
                        <AvatarFallback className="text-xs">{getInitials(m.full_name)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{m.full_name}</TableCell>
                    <TableCell>{m.role}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{m.category}</Badge></TableCell>
                    <TableCell><Badge variant={m.is_active ? "default" : "secondary"}>{m.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditMember(m)}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(m.id, !!m.is_active)}>{m.is_active ? "Deactivate" : "Activate"}</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-20 w-20 border-2 border-muted">
                  <AvatarImage src={newMember.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-primary/10">{newMember.full_name ? getInitials(newMember.full_name) : "?"}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{uploading ? "Uploading..." : "Click to add photo"}</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async e => {
                const f = e.target.files?.[0]; if (!f) return;
                const url = await uploadAvatar(f);
                if (url) setNewMember(p => ({ ...p, avatar_url: url }));
              }} />
            </div>
            <div><Label>Full Name</Label><Input value={newMember.full_name} onChange={e => setNewMember(p => ({ ...p, full_name: e.target.value }))} /></div>
            <div><Label>Role</Label><Input value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Video Editor" /></div>
            <div><Label>Category</Label>
              <Select value={newMember.category} onValueChange={(v: any) => setNewMember(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="employee">Employee</SelectItem><SelectItem value="freelancer">Freelancer</SelectItem><SelectItem value="trainee">Trainee</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>LinkedIn URL (optional)</Label><Input value={newMember.linkedin_url} onChange={e => setNewMember(p => ({ ...p, linkedin_url: e.target.value }))} /></div>
            <Button className="w-full" onClick={addMember} disabled={uploading}>Add Member</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={!!editMember} onOpenChange={open => !open && setEditMember(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Team Member</DialogTitle></DialogHeader>
          {editMember && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <div className="relative cursor-pointer group" onClick={() => editFileInputRef.current?.click()}>
                  <Avatar className="h-20 w-20 border-2 border-muted">
                    <AvatarImage src={editMember.avatar_url || ""} className="object-cover" />
                    <AvatarFallback className="bg-primary/10">{getInitials(editMember.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{uploading ? "Uploading..." : "Click to change photo"}</p>
                <input ref={editFileInputRef} type="file" accept="image/*" className="hidden" onChange={async e => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const url = await uploadAvatar(f, editMember.id);
                  if (url) setEditMember(p => p ? { ...p, avatar_url: url } : null);
                }} />
              </div>
              <div><Label>Full Name</Label><Input value={editMember.full_name} onChange={e => setEditMember(p => p ? { ...p, full_name: e.target.value } : null)} /></div>
              <div><Label>Role</Label><Input value={editMember.role} onChange={e => setEditMember(p => p ? { ...p, role: e.target.value } : null)} /></div>
              <div><Label>Category</Label>
                <Select value={editMember.category} onValueChange={(v: any) => setEditMember(p => p ? { ...p, category: v } : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="employee">Employee</SelectItem><SelectItem value="freelancer">Freelancer</SelectItem><SelectItem value="trainee">Trainee</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>LinkedIn URL (optional)</Label><Input value={editMember.linkedin_url || ""} onChange={e => setEditMember(p => p ? { ...p, linkedin_url: e.target.value } : null)} /></div>
              <Button className="w-full" onClick={saveEditMember} disabled={uploading}>Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Leave Management Tab ────────────────────────────────
const LeaveManagementTab = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    const { data, error } = await supabase.from("leave_requests").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Failed to load leave requests");
    else setLeaves(data || []);
    setLoading(false);
  };

  const updateLeaveStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leave_requests").update({ status, approved_at: status === "approved" ? new Date().toISOString() : null }).eq("id", id);
    if (error) toast.error("Failed to update");
    else { toast.success(`Leave ${status}`); fetchLeaves(); }
  };

  const statusColor = (s: string) => s === "approved" ? "bg-green-500" : s === "rejected" ? "bg-destructive" : "bg-yellow-500";

  return (
    <Card>
      <CardHeader><CardTitle>Leave Requests</CardTitle><CardDescription>Manage employee leave applications</CardDescription></CardHeader>
      <CardContent>
        {loading ? <div className="text-center py-8 text-muted-foreground">Loading...</div> : leaves.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No leave requests yet.</div>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Period</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {leaves.map(l => (
                <TableRow key={l.id}>
                  <TableCell><Badge variant="outline" className="capitalize">{l.leave_type}</Badge></TableCell>
                  <TableCell className="text-sm">{new Date(l.start_date).toLocaleDateString()} – {new Date(l.end_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{l.reason || "—"}</TableCell>
                  <TableCell><Badge className={statusColor(l.status)}>{l.status}</Badge></TableCell>
                  <TableCell className="text-right space-x-2">
                    {l.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateLeaveStatus(l.id, "approved")}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => updateLeaveStatus(l.id, "rejected")}>Reject</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Attendance Tab ──────────────────────────────────────
const AttendanceTab = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAttendance(); }, []);

  const fetchAttendance = async () => {
    const { data, error } = await supabase.from("attendance").select("*").order("date", { ascending: false }).limit(100);
    if (error) toast.error("Failed to load attendance");
    else setRecords(data || []);
    setLoading(false);
  };

  const statusColor = (s: string) => ({ present: "bg-green-500", late: "bg-yellow-500", absent: "bg-destructive", half_day: "bg-orange-500", remote: "bg-blue-500" }[s] || "bg-muted-foreground");

  return (
    <Card>
      <CardHeader><CardTitle>Attendance Tracking</CardTitle><CardDescription>Monitor team attendance records</CardDescription></CardHeader>
      <CardContent>
        {loading ? <div className="text-center py-8 text-muted-foreground">Loading...</div> : records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No attendance records yet.</div>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Check In</TableHead><TableHead>Check Out</TableHead><TableHead>Status</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
            <TableBody>
              {records.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                  <TableCell>{r.check_in ? new Date(r.check_in).toLocaleTimeString() : "—"}</TableCell>
                  <TableCell>{r.check_out ? new Date(r.check_out).toLocaleTimeString() : "—"}</TableCell>
                  <TableCell><Badge className={statusColor(r.status)}>{r.status.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{r.notes || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Payroll Tab ─────────────────────────────────────────
const PayrollTab = () => {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPayroll(); }, []);

  const fetchPayroll = async () => {
    const { data, error } = await supabase.from("payroll").select("*, team_members(full_name, category)").order("period_start", { ascending: false });
    if (error) toast.error("Failed to load payroll");
    else setRecords(data || []);
    setLoading(false);
  };

  const statusColor = (s: string) => s === "paid" ? "bg-green-500" : s === "approved" ? "bg-blue-500" : "bg-muted-foreground";

  return (
    <Card>
      <CardHeader><CardTitle>Payroll Overview</CardTitle><CardDescription>Manage salary and compensation</CardDescription></CardHeader>
      <CardContent>
        {loading ? <div className="text-center py-8 text-muted-foreground">Loading...</div> : records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No payroll records yet.</div>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Team Member</TableHead><TableHead>Period</TableHead><TableHead>Base Salary</TableHead><TableHead>Bonuses</TableHead><TableHead>Deductions</TableHead><TableHead>Net Pay</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {records.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.team_members?.full_name || "—"}</TableCell>
                  <TableCell className="text-sm">{new Date(r.period_start).toLocaleDateString()} – {new Date(r.period_end).toLocaleDateString()}</TableCell>
                  <TableCell>{r.base_salary.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">+{r.bonuses.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive">-{r.deductions.toLocaleString()}</TableCell>
                  <TableCell className="font-bold">{r.net_pay.toLocaleString()}</TableCell>
                  <TableCell><Badge className={statusColor(r.status)}>{r.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Main HR Management ──────────────────────────────────
const HRManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">HR Department</h1>
        <p className="text-muted-foreground mt-1">Manage recruitment, team members, leave, attendance, and payroll.</p>
      </div>

      <Tabs defaultValue="recruitment">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="recruitment" className="flex items-center gap-2"><UserCheck className="h-4 w-4" /> Recruitment</TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2"><Users className="h-4 w-4" /> Team</TabsTrigger>
          <TabsTrigger value="leave" className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Leave</TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2"><Clock className="h-4 w-4" /> Attendance</TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="recruitment"><RecruitmentTab /></TabsContent>
        <TabsContent value="team"><TeamDirectoryTab /></TabsContent>
        <TabsContent value="leave"><LeaveManagementTab /></TabsContent>
        <TabsContent value="attendance"><AttendanceTab /></TabsContent>
        <TabsContent value="payroll"><PayrollTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default HRManagement;
