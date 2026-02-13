import { useDroppable } from "@dnd-kit/core";
import { Task, TaskStatus } from "@/hooks/useTasks";
import TaskCard from "./TaskCard";
import { cn } from "@/lib/utils";
import { Circle, Clock, CheckCircle2, AlertCircle, Eye, Archive } from "lucide-react";

const statusIcons: Record<TaskStatus, React.ElementType> = {
  backlog: Archive,
  todo: Circle,
  in_progress: Clock,
  review: Eye,
  blocked: AlertCircle,
  completed: CheckCircle2,
};

const statusColors: Record<TaskStatus, string> = {
  backlog: "text-muted-foreground",
  todo: "text-blue-500",
  in_progress: "text-amber-500",
  review: "text-purple-500",
  blocked: "text-destructive",
  completed: "text-green-500",
};

interface Props {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const KanbanColumn = ({ status, label, tasks, onTaskClick }: Props) => {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  const Icon = statusIcons[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-[280px] rounded-lg border bg-muted/30 flex flex-col",
        isOver && "ring-2 ring-primary/50 bg-primary/5"
      )}
    >
      <div className="p-3 border-b flex items-center gap-2">
        <Icon className={cn("h-4 w-4", statusColors[status])} />
        <span className="font-medium text-sm">{label}</span>
        <span className="ml-auto text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <div className="p-2 flex-1 space-y-2 overflow-y-auto max-h-[calc(60vh-48px)]">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-xs">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
