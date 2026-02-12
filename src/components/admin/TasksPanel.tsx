import { useState, useEffect } from "react";
import { useTasks, Task } from "@/hooks/useTasks";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList, Plus, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Pending", icon: Circle, color: "text-muted-foreground" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-blue-500" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-green-500" },
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary/20 text-secondary-foreground",
  high: "bg-destructive/20 text-destructive",
};

interface TeamMember {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const TaskItem = ({ task, onStatusChange, onRead }: { task: Task; onStatusChange: (id: string, status: string) => void; onRead: (id: string) => void }) => {
  const StatusIcon = statusConfig[task.status]?.icon || Circle;
  const isUnread = task.collaborators?.some(c => !c.is_read);

  useEffect(() => {
    if (isUnread) onRead(task.id);
  }, []);

  const nextStatus = task.status === "pending" ? "in_progress" : task.status === "in_progress" ? "completed" : "pending";

  return (
    <div className={cn("p-3 rounded-lg border transition-all hover:shadow-sm", isUnread && "border-primary/50 bg-primary/5")}>
      <div className="flex items-start gap-2">
        <button onClick={() => onStatusChange(task.id, nextStatus)} className="mt-1">
          <StatusIcon className={cn("h-4 w-4", statusConfig[task.status]?.color)} />
        </button>
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-sm", task.status === "completed" && "line-through text-muted-foreground")}>{task.title}</p>
          {task.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority])}>{task.priority}</Badge>
            {task.due_date && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {format(new Date(task.due_date), "MMM d")}
              </span>
            )}
            {task.collaborators && task.collaborators.length > 0 && (
              <div className="flex -space-x-1.5">
                {task.collaborators.slice(0, 3).map((c, i) => (
                  <Avatar key={i} className="h-5 w-5 border border-background">
                    <AvatarImage src={c.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="text-[8px] bg-muted">{c.profiles?.full_name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                ))}
                {task.collaborators.length > 3 && <span className="text-xs text-muted-foreground ml-1">+{task.collaborators.length - 3}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateTaskForm = ({ onSubmit, teamMembers }: { onSubmit: (title: string, desc: string, priority: string, dueDate: string | null, collabs: string[]) => Promise<void>; teamMembers: TeamMember[] }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleMember = (uid: string) => {
    setSelectedMembers(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(title, description, priority, dueDate || null, selectedMembers);
      setTitle(""); setDescription(""); setPriority("medium"); setDueDate(""); setSelectedMembers([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Input placeholder="Task title *" value={title} onChange={e => setTitle(e.target.value)} />
      <Textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
      <div className="flex gap-2">
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="flex-1" />
      </div>

      {teamMembers.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Collaborate with:</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {teamMembers.map(m => (
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

      <Button onClick={handleSubmit} disabled={!title.trim() || submitting} className="w-full" size="sm">
        <Plus className="h-4 w-4 mr-1" /> Create Task
      </Button>
    </div>
  );
};

const TasksPanel = () => {
  const { tasks, unreadCount, createTask, updateTaskStatus, markAsRead } = useTasks();
  const [showCreate, setShowCreate] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("user_id, full_name, avatar_url").neq("user_id", user.id);
      setTeamMembers(data || []);
    };
    if (open) fetchTeam();
  }, [open]);

  const handleCreate = async (title: string, desc: string, priority: string, dueDate: string | null, collabs: string[]) => {
    await createTask(title, desc, priority, dueDate, collabs);
    setShowCreate(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-1.5">
          <ClipboardList className="h-4 w-4" />
          Tasks
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[420px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Tasks</span>
            <Button variant={showCreate ? "secondary" : "default"} size="sm" onClick={() => setShowCreate(!showCreate)}>
              {showCreate ? "Cancel" : <><Plus className="h-4 w-4 mr-1" /> New Task</>}
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-4">
          {showCreate && (
            <div className="p-3 border rounded-lg bg-muted/30">
              <CreateTaskForm onSubmit={handleCreate} teamMembers={teamMembers} />
            </div>
          )}

          {tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs mt-1">Create a task to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => (
                <TaskItem key={task.id} task={task} onStatusChange={updateTaskStatus} onRead={markAsRead} />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TasksPanel;
