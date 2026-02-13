import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core";
import { Task, TaskStatus, TASK_STATUSES, TaskFilters } from "@/hooks/useTasks";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";

interface Props {
  tasks: Task[];
  filters: TaskFilters;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}

const TaskKanbanBoard = ({ tasks, filters, onStatusChange, onTaskClick }: Props) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const filteredTasks = tasks.filter(task => {
    if (filters.status && filters.status !== "all" && task.status !== filters.status) return false;
    if (filters.priority && filters.priority !== "all" && task.priority !== filters.priority) return false;
    if (filters.project_id && filters.project_id !== "all" && task.project_id !== filters.project_id) return false;
    if (filters.task_type && filters.task_type !== "all" && task.task_type !== filters.task_type) return false;
    if (filters.assigned_user && filters.assigned_user !== "all") {
      const isAssigned = task.task_owner === filters.assigned_user ||
        task.collaborators?.some(c => c.user_id === filters.assigned_user);
      if (!isAssigned) return false;
    }
    if (filters.due_date_range && filters.due_date_range !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (filters.due_date_range === "today" && task.due_date) {
        const due = new Date(task.due_date);
        if (due.toDateString() !== today.toDateString()) return false;
      }
      if (filters.due_date_range === "overdue" && task.due_date) {
        if (new Date(task.due_date) >= today || task.status === "completed") return false;
      } else if (filters.due_date_range === "overdue" && !task.due_date) return false;
    }
    return true;
  });

  const handleDragStart = (event: DragStartEvent) => {
    const task = filteredTasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = filteredTasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      onStatusChange(taskId, newStatus);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
        {TASK_STATUSES.map(status => (
          <KanbanColumn
            key={status.value}
            status={status.value}
            label={status.label}
            tasks={filteredTasks.filter(t => t.status === status.value)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} onClick={() => {}} isDragging />}
      </DragOverlay>
    </DndContext>
  );
};

export default TaskKanbanBoard;
