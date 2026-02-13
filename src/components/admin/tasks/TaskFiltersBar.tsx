import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TaskFilters, TaskStatus, TaskPriority, TaskType } from "@/hooks/useTasks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Props {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

const TaskFiltersBar = ({ filters, onFiltersChange }: Props) => {
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [users, setUsers] = useState<{ user_id: string; full_name: string | null }[]>([]);

  useEffect(() => {
    const load = async () => {
      const [p, u] = await Promise.all([
        supabase.from("projects").select("id, title").order("title"),
        supabase.from("profiles").select("user_id, full_name"),
      ]);
      setProjects(p.data || []);
      setUsers(u.data || []);
    };
    load();
  }, []);

  const update = (key: keyof TaskFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFiltersChange({});
  };

  const hasFilters = Object.values(filters).some(v => v && v !== "all");

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={filters.status || "all"} onValueChange={v => update("status", v)}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="backlog">Backlog</SelectItem>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="review">Review</SelectItem>
          <SelectItem value="blocked">Blocked</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.priority || "all"} onValueChange={v => update("priority", v)}>
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.task_type || "all"} onValueChange={v => update("task_type", v)}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="operational">Operational</SelectItem>
          <SelectItem value="project">Project</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.project_id || "all"} onValueChange={v => update("project_id", v)}>
        <SelectTrigger className="w-[150px] h-8 text-xs">
          <SelectValue placeholder="Project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          {projects.map(p => (
            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.assigned_user || "all"} onValueChange={v => update("assigned_user", v)}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue placeholder="Assigned To" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          {users.map(u => (
            <SelectItem key={u.user_id} value={u.user_id}>{u.full_name || "User"}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.due_date_range || "all"} onValueChange={v => update("due_date_range", v)}>
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue placeholder="Due Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any Date</SelectItem>
          <SelectItem value="today">Due Today</SelectItem>
          <SelectItem value="this_week">This Week</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearAll}>
          <X className="h-3 w-3 mr-1" /> Clear
        </Button>
      )}
    </div>
  );
};

export default TaskFiltersBar;
