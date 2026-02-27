import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus, TaskPriority } from "@/hooks/useTasks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Clock, FolderKanban, Trash2, Send, MessageSquare, CheckSquare,
  Paperclip, Plus, X, Upload, FileText, Link2, Activity,
  ChevronRight, Circle, CheckCircle2, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

interface ChecklistItem {
  id: string;
  title: string;
  is_completed: boolean;
  completed_by?: string | null;
  completed_at?: string | null;
  display_order: number;
}

interface StatusHistoryEntry {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  changed_at: string;
  profile?: { full_name: string | null };
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

const statusIcons: Record<string, React.ReactNode> = {
  backlog: <Circle className="h-3.5 w-3.5 text-muted-foreground" />,
  todo: <Circle className="h-3.5 w-3.5 text-blue-500" />,
  in_progress: <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />,
  review: <AlertCircle className="h-3.5 w-3.5 text-purple-500" />,
  blocked: <AlertCircle className="h-3.5 w-3.5 text-destructive" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary/20 text-secondary-foreground",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-destructive/20 text-destructive",
};

const TaskDetailDialog = ({ task, onClose, onStatusChange, onUpdate, onDelete, onAddComment }: Props) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [addingChecklist, setAddingChecklist] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task?.title || "");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(task?.description || "");
  const [actualHoursValue, setActualHoursValue] = useState<string>("");

  useEffect(() => {
    if (!task) return;
    setTitleValue(task.title);
    setDescValue(task.description || "");
    setActualHoursValue(task.actual_hours?.toString() || "");
    fetchAll(task.id);
  }, [task?.id]);

  const fetchAll = async (taskId: string) => {
    const [commentsRes, checklistRes, historyRes] = await Promise.all([
      supabase.from("task_comments").select("*").eq("task_id", taskId).order("created_at", { ascending: true }),
      supabase.from("task_checklist_items").select("*").eq("task_id", taskId).order("display_order"),
      supabase.from("task_status_history").select("*").eq("task_id", taskId).order("changed_at", { ascending: false }).limit(10),
    ]);

    // Enrich comments with profiles
    if (commentsRes.data) {
      const userIds = [...new Set(commentsRes.data.map((c: any) => c.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", userIds);
      const pm = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
      setComments(commentsRes.data.map((c: any) => ({ ...c, profile: pm.get(c.user_id) })));
    }

    if (checklistRes.data) setChecklist(checklistRes.data as ChecklistItem[]);

    // Enrich history with profiles
    if (historyRes.data) {
      const userIds = [...new Set(historyRes.data.map((h: any) => h.changed_by))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const pm = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
      setStatusHistory(historyRes.data.map((h: any) => ({ ...h, profile: pm.get(h.changed_by) })));
    }
  };

  const handleSendComment = async () => {
    if (!task || !newComment.trim()) return;
    setSending(true);
    await onAddComment(task.id, newComment.trim());
    setNewComment("");
    await fetchAll(task.id);
    setSending(false);
  };

  const addChecklistItem = async () => {
    if (!task || !newChecklistItem.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("task_checklist_items").insert({
      task_id: task.id,
      title: newChecklistItem.trim(),
      created_by: user.id,
      display_order: checklist.length,
    });
    if (!error) {
      setNewChecklistItem("");
      setAddingChecklist(false);
      await fetchAll(task.id);
    }
  };

  const toggleChecklistItem = async (item: ChecklistItem) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("task_checklist_items").update({
      is_completed: !item.is_completed,
      completed_by: !item.is_completed ? user?.id : null,
      completed_at: !item.is_completed ? new Date().toISOString() : null,
    }).eq("id", item.id);
    await fetchAll(task!.id);
  };

  const deleteChecklistItem = async (id: string) => {
    await supabase.from("task_checklist_items").delete().eq("id", id);
    await fetchAll(task!.id);
  };

  const saveTitle = async () => {
    if (!task || !titleValue.trim()) return;
    await onUpdate(task.id, { title: titleValue.trim() });
    setEditingTitle(false);
    toast.success("Title updated");
  };

  const saveDesc = async () => {
    if (!task) return;
    await onUpdate(task.id, { description: descValue });
    setEditingDesc(false);
    toast.success("Description updated");
  };

  const saveActualHours = async () => {
    if (!task) return;
    const hours = parseFloat(actualHoursValue);
    if (!isNaN(hours)) {
      await onUpdate(task.id, { actual_hours: hours });
      toast.success("Hours logged");
    }
  };

  if (!task) return null;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";
  const completedCount = checklist.filter(i => i.is_completed).length;
  const checklistProgress = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  // Status flow for quick actions
  const statusFlow: Record<string, TaskStatus> = {
    backlog: "todo",
    todo: "in_progress",
    in_progress: "review",
    review: "completed",
    blocked: "in_progress",
    completed: "todo",
  };
  const nextStatus = statusFlow[task.status];
  const nextStatusLabel = statusLabels[nextStatus];

  return (
    <Dialog open={!!task} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b">
          <div className="flex items-start gap-2 mb-2">
            <div className="mt-0.5">{statusIcons[task.status]}</div>
            {editingTitle ? (
              <div className="flex-1 flex gap-2">
                <Input
                  value={titleValue}
                  onChange={e => setTitleValue(e.target.value)}
                  className="font-semibold text-base"
                  onKeyDown={e => e.key === "Enter" && saveTitle()}
                  autoFocus
                />
                <Button size="sm" onClick={saveTitle}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingTitle(false); setTitleValue(task.title); }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <h2
                className="font-semibold text-base flex-1 cursor-text hover:text-primary transition-colors"
                onClick={() => setEditingTitle(true)}
                title="Click to edit"
              >
                {task.title}
              </h2>
            )}
          </div>

          {/* Quick status move button */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="default"
              className="h-7 text-xs gap-1"
              onClick={() => onStatusChange(task.id, nextStatus)}
            >
              <ChevronRight className="h-3 w-3" />
              Move to {nextStatusLabel}
            </Button>
            <Select value={task.status} onValueChange={(v) => onStatusChange(task.id, v as TaskStatus)}>
              <SelectTrigger className="h-7 text-xs w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className={cn("text-xs h-7", priorityColors[task.priority])}>
              {task.priority}
            </Badge>
            {task.project && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <FolderKanban className="h-3 w-3" />
                {task.project.title}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="mx-6 mt-3 h-8">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="checklist" className="text-xs gap-1">
                <CheckSquare className="h-3 w-3" />
                Checklist {checklist.length > 0 && `(${completedCount}/${checklist.length})`}
              </TabsTrigger>
              <TabsTrigger value="comments" className="text-xs gap-1">
                <MessageSquare className="h-3 w-3" />
                Comments {comments.length > 0 && `(${comments.length})`}
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs gap-1">
                <Activity className="h-3 w-3" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="px-6 pb-6 space-y-4 mt-3">
              {/* Description */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                {editingDesc ? (
                  <div className="space-y-2">
                    <Textarea
                      value={descValue}
                      onChange={e => setDescValue(e.target.value)}
                      rows={4}
                      className="text-sm"
                      placeholder="Add a description..."
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveDesc}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingDesc(false); setDescValue(task.description || ""); }}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "text-sm rounded-md p-2 cursor-text hover:bg-muted/50 transition-colors min-h-[40px]",
                      !task.description && "text-muted-foreground italic"
                    )}
                    onClick={() => setEditingDesc(true)}
                  >
                    {task.description || "Click to add a description..."}
                  </div>
                )}
              </div>

              <Separator />

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Owner</p>
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={task.owner_profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-[8px]">{task.owner_profile?.full_name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{task.owner_profile?.full_name || "—"}</span>
                  </div>
                </div>
                {task.start_date && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                    <p>{format(new Date(task.start_date), "MMM d, yyyy")}</p>
                  </div>
                )}
                {task.due_date && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                    <p className={cn("flex items-center gap-1", isOverdue && "text-destructive font-medium")}>
                      <Clock className="h-3 w-3" />
                      {format(new Date(task.due_date), "MMM d, yyyy")}
                      {isOverdue && " ⚠️"}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Estimated / Actual Hours</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{task.estimated_hours ? `${task.estimated_hours}h est.` : "—"}</span>
                    <span className="text-muted-foreground">/</span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={actualHoursValue}
                        onChange={e => setActualHoursValue(e.target.value)}
                        onBlur={saveActualHours}
                        className="h-6 w-16 text-xs px-1"
                        placeholder="Log hrs"
                        step="0.5"
                        min="0"
                      />
                      <span className="text-xs text-muted-foreground">h</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collaborators */}
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

              {/* Checklist mini preview */}
              {checklist.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <CheckSquare className="h-3 w-3" /> Checklist — {completedCount}/{checklist.length}
                    </p>
                    <span className="text-xs text-muted-foreground">{checklistProgress}%</span>
                  </div>
                  <Progress value={checklistProgress} className="h-1.5 mb-2" />
                </div>
              )}

              <Separator />
              <div className="flex justify-end">
                <Button variant="destructive" size="sm" onClick={() => { onDelete(task.id); onClose(); }}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Task
                </Button>
              </div>
            </TabsContent>

            {/* CHECKLIST TAB */}
            <TabsContent value="checklist" className="px-6 pb-6 mt-3">
              {checklist.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{completedCount} of {checklist.length} done</span>
                    <span className="text-xs font-medium">{checklistProgress}%</span>
                  </div>
                  <Progress value={checklistProgress} className="h-2" />
                </div>
              )}

              <div className="space-y-1.5 mb-4">
                {checklist.map(item => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-2.5 p-2.5 rounded-lg border transition-all group",
                      item.is_completed ? "bg-muted/30 border-muted" : "bg-background hover:border-primary/30"
                    )}
                  >
                    <Checkbox
                      checked={item.is_completed}
                      onCheckedChange={() => toggleChecklistItem(item)}
                      className="h-4 w-4"
                    />
                    <span className={cn("text-sm flex-1", item.is_completed && "line-through text-muted-foreground")}>
                      {item.title}
                    </span>
                    {item.is_completed && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    )}
                    <button
                      onClick={() => deleteChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {addingChecklist ? (
                <div className="flex gap-2">
                  <Input
                    value={newChecklistItem}
                    onChange={e => setNewChecklistItem(e.target.value)}
                    placeholder="Add item (e.g. Fill in spreadsheet, Share document...)"
                    className="text-sm"
                    autoFocus
                    onKeyDown={e => { if (e.key === "Enter") addChecklistItem(); if (e.key === "Escape") setAddingChecklist(false); }}
                  />
                  <Button size="sm" onClick={addChecklistItem} disabled={!newChecklistItem.trim()}>Add</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setAddingChecklist(false); setNewChecklistItem(""); }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 border-dashed"
                  onClick={() => setAddingChecklist(true)}
                >
                  <Plus className="h-3.5 w-3.5" /> Add checklist item
                </Button>
              )}

              {checklist.length === 0 && !addingChecklist && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Break this task into steps</p>
                  <p className="text-xs mt-1">Fill spreadsheets, share documents, review deliverables...</p>
                </div>
              )}
            </TabsContent>

            {/* COMMENTS TAB */}
            <TabsContent value="comments" className="px-6 pb-6 mt-3 flex flex-col gap-3">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <MessageSquare className="h-7 w-7 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No comments yet</p>
                  </div>
                )}
                {comments.map(c => (
                  <div key={c.id} className="flex gap-2.5">
                    <Avatar className="h-7 w-7 mt-0.5 shrink-0">
                      <AvatarImage src={c.profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-[9px]">{c.profile?.full_name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted/40 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium">{c.profile?.full_name || "User"}</span>
                        <span className="text-[10px] text-muted-foreground">{format(new Date(c.created_at), "MMM d, h:mm a")}</span>
                      </div>
                      <p className="text-sm">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-auto">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  rows={2}
                  className="text-sm resize-none"
                  onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSendComment(); }}
                />
                <Button size="sm" className="self-end" onClick={handleSendComment} disabled={!newComment.trim() || sending}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground -mt-2">Ctrl+Enter to send</p>
            </TabsContent>

            {/* ACTIVITY TAB */}
            <TabsContent value="activity" className="px-6 pb-6 mt-3">
              <div className="space-y-2">
                {statusHistory.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Activity className="h-7 w-7 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No status changes yet</p>
                  </div>
                )}
                {statusHistory.map(h => (
                  <div key={h.id} className="flex items-start gap-2.5 py-2 border-b border-muted last:border-0">
                    <Activity className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{h.profile?.full_name || "Someone"}</span>
                        {" moved from "}
                        <Badge variant="outline" className="text-[10px] px-1 py-0">{statusLabels[h.old_status || ""] || h.old_status || "—"}</Badge>
                        {" → "}
                        <Badge variant="outline" className="text-[10px] px-1 py-0">{statusLabels[h.new_status] || h.new_status}</Badge>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {format(new Date(h.changed_at), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailDialog;
