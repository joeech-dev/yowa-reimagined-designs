import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus, TaskPriority } from "@/hooks/useTasks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Clock, FolderKanban, Trash2, Send, MessageSquare } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

interface Props {
  task: Task | null;
  onClose: () => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onAddComment: (taskId: string, content: string) => void;
}

const statusLabels: Record<string, string> = {
  backlog: "Backlog", todo: "To Do", in_progress: "In Progress",
  review: "Review", blocked: "Blocked", completed: "Completed",
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary/20 text-secondary-foreground",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-destructive/20 text-destructive",
};

const TaskDetailDialog = ({ task, onClose, onStatusChange, onUpdate, onDelete, onAddComment }: Props) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!task) return;
    const fetchComments = async () => {
      const { data } = await supabase
        .from("task_comments")
        .select("*")
        .eq("task_id", task.id)
        .order("created_at", { ascending: true });

      if (!data) return;
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      setComments(data.map(c => ({ ...c, profile: profileMap.get(c.user_id) })));
    };
    fetchComments();
  }, [task]);

  const handleSendComment = async () => {
    if (!task || !newComment.trim()) return;
    setSending(true);
    await onAddComment(task.id, newComment);
    // Refresh comments
    const { data } = await supabase
      .from("task_comments")
      .select("*")
      .eq("task_id", task.id)
      .order("created_at", { ascending: true });
    if (data) {
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      setComments(data.map(c => ({ ...c, profile: profileMap.get(c.user_id) })));
    }
    setNewComment("");
    setSending(false);
  };

  if (!task) return null;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

  return (
    <Dialog open={!!task} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Select value={task.status} onValueChange={(v) => onStatusChange(task.id, v as TaskStatus)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Priority</p>
              <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority])}>
                {task.priority}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Owner</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={task.owner_profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-[8px]">{task.owner_profile?.full_name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{task.owner_profile?.full_name || "—"}</span>
              </div>
            </div>
            {task.project && (
              <div>
                <p className="text-xs text-muted-foreground">Project</p>
                <div className="flex items-center gap-1 mt-1">
                  <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm">{task.project.title}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {task.start_date && (
              <div>
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="mt-0.5">{format(new Date(task.start_date), "MMM d, yyyy")}</p>
              </div>
            )}
            {task.due_date && (
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className={cn("mt-0.5 flex items-center gap-1", isOverdue && "text-destructive font-medium")}>
                  <Clock className="h-3 w-3" />
                  {format(new Date(task.due_date), "MMM d, yyyy")}
                  {isOverdue && " (Overdue)"}
                </p>
              </div>
            )}
          </div>

          {(task.estimated_hours || task.actual_hours) && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {task.estimated_hours && (
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Hours</p>
                  <p className="mt-0.5">{task.estimated_hours}h</p>
                </div>
              )}
              {task.actual_hours && (
                <div>
                  <p className="text-xs text-muted-foreground">Actual Hours</p>
                  <p className="mt-0.5">{task.actual_hours}h</p>
                </div>
              )}
            </div>
          )}

          {task.collaborators && task.collaborators.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Collaborators</p>
              <div className="flex flex-wrap gap-2">
                {task.collaborators.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-muted/50 rounded-full px-2 py-0.5">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={c.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="text-[7px]">{c.profiles?.full_name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{c.profiles?.full_name || "User"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Comments */}
          <div>
            <p className="text-sm font-medium flex items-center gap-1.5 mb-2">
              <MessageSquare className="h-4 w-4" /> Comments ({comments.length})
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <Avatar className="h-6 w-6 mt-0.5">
                    <AvatarImage src={c.profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-[8px]">{c.profile?.full_name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{c.profile?.full_name || "User"}</span>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(c.created_at), "MMM d, h:mm a")}</span>
                    </div>
                    <p className="text-sm">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                rows={1}
                className="text-sm resize-none"
              />
              <Button size="sm" onClick={handleSendComment} disabled={!newComment.trim() || sending}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button variant="destructive" size="sm" onClick={() => { onDelete(task.id); onClose(); }}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailDialog;
