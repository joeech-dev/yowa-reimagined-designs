import { useDraggable } from "@dnd-kit/core";
import { Task } from "@/hooks/useTasks";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Clock, FolderKanban } from "lucide-react";

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary/20 text-secondary-foreground",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-destructive/20 text-destructive",
};

interface Props {
  task: Task;
  onClick: () => void;
  isDragging?: boolean;
}

const TaskCard = ({ task, onClick, isDragging }: Props) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border bg-background cursor-pointer hover:shadow-sm transition-all",
        isDragging && "opacity-50 shadow-lg rotate-2",
        isOverdue && "border-destructive/50"
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <p className={cn("font-medium text-sm leading-tight", task.status === "completed" && "line-through text-muted-foreground")}>
          {task.title}
        </p>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
      )}

      {task.project && (
        <div className="flex items-center gap-1 mt-1.5">
          <FolderKanban className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground truncate">{task.project.title}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", priorityColors[task.priority])}>
          {task.priority}
        </Badge>
        {task.due_date && (
          <span className={cn("text-[10px] flex items-center gap-0.5", isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
            <Clock className="h-2.5 w-2.5" />
            {format(new Date(task.due_date), "MMM d")}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex -space-x-1">
          {task.owner_profile && (
            <Avatar className="h-5 w-5 border-2 border-background">
              <AvatarImage src={task.owner_profile.avatar_url || undefined} />
              <AvatarFallback className="text-[8px] bg-primary text-primary-foreground">
                {task.owner_profile.full_name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
          )}
          {task.collaborators?.slice(0, 2).map((c, i) => (
            <Avatar key={i} className="h-5 w-5 border-2 border-background">
              <AvatarImage src={c.profiles?.avatar_url || undefined} />
              <AvatarFallback className="text-[8px] bg-muted">{c.profiles?.full_name?.[0] || "?"}</AvatarFallback>
            </Avatar>
          ))}
          {(task.collaborators?.length || 0) > 2 && (
            <span className="text-[10px] text-muted-foreground ml-1">+{(task.collaborators?.length || 0) - 2}</span>
          )}
        </div>
        {task.task_type === "project" && (
          <Badge variant="outline" className="text-[10px] px-1">Project</Badge>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
