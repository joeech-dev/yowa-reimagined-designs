import { Task, TaskStatus, TaskFilters } from "@/hooks/useTasks";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, FolderKanban } from "lucide-react";

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary/20 text-secondary-foreground",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-destructive/20 text-destructive",
};

const statusLabels: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  blocked: "Blocked",
  completed: "Completed",
};

interface Props {
  tasks: Task[];
  filters: TaskFilters;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}

const TaskListView = ({ tasks, filters, onStatusChange, onTaskClick }: Props) => {
  const filteredTasks = tasks.filter(task => {
    if (filters.status && filters.status !== "all" && task.status !== filters.status) return false;
    if (filters.priority && filters.priority !== "all" && task.priority !== filters.priority) return false;
    if (filters.project_id && filters.project_id !== "all" && task.project_id !== filters.project_id) return false;
    if (filters.task_type && filters.task_type !== "all" && task.task_type !== filters.task_type) return false;
    return true;
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map(task => {
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";
            return (
              <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onTaskClick(task)}>
                <TableCell>
                  <div>
                    <p className={cn("font-medium text-sm", task.status === "completed" && "line-through text-muted-foreground")}>
                      {task.title}
                    </p>
                    {task.description && <p className="text-xs text-muted-foreground truncate max-w-[280px]">{task.description}</p>}
                  </div>
                </TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <Select value={task.status} onValueChange={(v) => onStatusChange(task.id, v as TaskStatus)}>
                    <SelectTrigger className="h-7 text-xs w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-[10px]", priorityColors[task.priority])}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={task.owner_profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-[8px]">{task.owner_profile?.full_name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs truncate max-w-[80px]">{task.owner_profile?.full_name || "—"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {task.project ? (
                    <div className="flex items-center gap-1">
                      <FolderKanban className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs truncate max-w-[100px]">{task.project.title}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {task.due_date ? (
                    <span className={cn("text-xs flex items-center gap-1", isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
                      <Clock className="h-3 w-3" />
                      {format(new Date(task.due_date), "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {filteredTasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No tasks match the current filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskListView;
