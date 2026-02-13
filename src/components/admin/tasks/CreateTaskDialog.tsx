import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TaskPriority, TaskType } from "@/hooks/useTasks";
import { Plus } from "lucide-react";

interface TeamMember {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    priority: TaskPriority;
    task_type: TaskType;
    project_id: string | null;
    task_owner: string;
    start_date: string | null;
    due_date: string | null;
    estimated_hours: number | null;
    recurring: boolean;
    recurring_type: string | null;
    collaborator_ids: string[];
  }) => Promise<any>;
}

const CreateTaskDialog = ({ open, onOpenChange, onSubmit }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [taskType, setTaskType] = useState<TaskType>("operational");
  const [projectId, setProjectId] = useState<string>("");
  const [taskOwner, setTaskOwner] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);
      setTaskOwner(user.id);

      const [membersRes, projectsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, avatar_url"),
        supabase.from("projects").select("id, title").neq("status", "cancelled").order("title"),
      ]);
      setTeamMembers(membersRes.data || []);
      setProjects(projectsRes.data || []);
    };
    load();
  }, [open]);

  const toggleMember = (uid: string) => {
    setSelectedMembers(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        priority,
        task_type: taskType,
        project_id: taskType === "project" && projectId ? projectId : null,
        task_owner: taskOwner || currentUserId,
        start_date: startDate || null,
        due_date: dueDate || null,
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
        recurring,
        recurring_type: recurring && recurringType ? recurringType : null,
        collaborator_ids: selectedMembers.filter(id => id !== taskOwner),
      });
      // Reset
      setTitle(""); setDescription(""); setPriority("medium"); setTaskType("operational");
      setProjectId(""); setStartDate(""); setDueDate(""); setEstimatedHours("");
      setRecurring(false); setRecurringType(""); setSelectedMembers([]);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Task Type</Label>
              <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {taskType === "project" && (
            <div>
              <Label>Project *</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Task Owner</Label>
            <Select value={taskOwner} onValueChange={setTaskOwner}>
              <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
              <SelectContent>
                {teamMembers.map(m => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    {m.full_name || "Team Member"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Estimated Hours</Label>
            <Input type="number" placeholder="e.g. 4" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)} />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={recurring} onCheckedChange={setRecurring} />
            <Label>Recurring Task</Label>
            {recurring && (
              <Select value={recurringType} onValueChange={setRecurringType}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Frequency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {teamMembers.length > 0 && (
            <div>
              <Label>Assign Collaborators</Label>
              <div className="max-h-32 overflow-y-auto space-y-1 mt-1 border rounded-md p-2">
                {teamMembers.filter(m => m.user_id !== taskOwner).map(m => (
                  <label key={m.user_id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer">
                    <Checkbox checked={selectedMembers.includes(m.user_id)} onCheckedChange={() => toggleMember(m.user_id)} />
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={m.avatar_url || undefined} />
                      <AvatarFallback className="text-[8px]">{m.full_name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate">{m.full_name || "Team Member"}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={!title.trim() || submitting || (taskType === "project" && !projectId)} className="w-full">
            <Plus className="h-4 w-4 mr-1" /> Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
