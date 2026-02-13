import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ClipboardList, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary/20 text-secondary-foreground",
  high: "bg-destructive/20 text-destructive",
  urgent: "bg-destructive text-destructive-foreground",
};

const statusLabels: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  blocked: "Blocked",
  completed: "Completed",
};

const TasksPanel = () => {
  const { tasks, unreadCount } = useTasks();
  const [open, setOpen] = useState(false);

  const activeTasks = tasks.filter(t => t.status !== "completed").slice(0, 10);

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
            <span>Tasks Overview</span>
            <Button variant="default" size="sm" asChild>
              <Link to="/admin/tasks">
                <ExternalLink className="h-4 w-4 mr-1" /> Full Board
              </Link>
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-2">
          {activeTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No active tasks</p>
            </div>
          ) : (
            activeTasks.map(task => (
              <div key={task.id} className="p-3 rounded-lg border hover:shadow-sm transition-all">
                <p className="font-medium text-sm">{task.title}</p>
                {task.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">{statusLabels[task.status] || task.status}</Badge>
                  <Badge variant="outline" className={cn("text-[10px]", priorityColors[task.priority])}>{task.priority}</Badge>
                  {task.due_date && (
                    <span className="text-[10px] text-muted-foreground">
                      Due {format(new Date(task.due_date), "MMM d")}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TasksPanel;
