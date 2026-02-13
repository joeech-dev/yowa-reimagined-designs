import { useState } from "react";
import { useTasks, TaskFilters, Task, TaskStatus } from "@/hooks/useTasks";
import TaskKanbanBoard from "./TaskKanbanBoard";
import TaskListView from "./TaskListView";
import CreateTaskDialog from "./CreateTaskDialog";
import TaskFiltersBar from "./TaskFiltersBar";
import TaskDetailDialog from "./TaskDetailDialog";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TasksManagement = () => {
  const { tasks, loading, createTask, updateTaskStatus, updateTask, deleteTask, addComment } = useTasks();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [filters, setFilters] = useState<TaskFilters>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {tasks.length} total · {tasks.filter(t => t.status === "completed").length} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "kanban" | "list")}>
            <TabsList className="h-8">
              <TabsTrigger value="kanban" className="text-xs px-2 gap-1">
                <LayoutGrid className="h-3.5 w-3.5" /> Board
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs px-2 gap-1">
                <List className="h-3.5 w-3.5" /> List
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Task
          </Button>
        </div>
      </div>

      <TaskFiltersBar filters={filters} onFiltersChange={setFilters} />

      {viewMode === "kanban" ? (
        <TaskKanbanBoard
          tasks={tasks}
          filters={filters}
          onStatusChange={updateTaskStatus}
          onTaskClick={setSelectedTask}
        />
      ) : (
        <TaskListView
          tasks={tasks}
          filters={filters}
          onStatusChange={updateTaskStatus}
          onTaskClick={setSelectedTask}
        />
      )}

      <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={createTask} />

      <TaskDetailDialog
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusChange={updateTaskStatus}
        onUpdate={updateTask}
        onDelete={deleteTask}
        onAddComment={addComment}
      />
    </div>
  );
};

export default TasksManagement;
