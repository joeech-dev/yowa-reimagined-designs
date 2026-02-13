import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "blocked" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskType = "project" | "operational";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  task_type: TaskType;
  project_id: string | null;
  task_owner: string;
  start_date: string | null;
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  recurring: boolean;
  recurring_type: string | null;
  reminder_enabled: boolean;
  reminder_time: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  collaborators?: {
    user_id: string;
    is_read: boolean;
    profiles?: { full_name: string | null; avatar_url: string | null };
  }[];
  creator_profile?: { full_name: string | null; avatar_url: string | null };
  owner_profile?: { full_name: string | null; avatar_url: string | null };
  project?: { title: string } | null;
}

export interface TaskFilters {
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  project_id?: string | "all";
  assigned_user?: string | "all";
  task_type?: TaskType | "all";
  due_date_range?: "today" | "this_week" | "overdue" | "all";
}

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "blocked", label: "Blocked" },
  { value: "completed", label: "Completed" },
];

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: tasksData, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const taskIds = tasksData?.map(t => t.id) || [];
      if (taskIds.length === 0) {
        setTasks([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      const { data: collabData } = await supabase
        .from("task_collaborators")
        .select("task_id, user_id, is_read")
        .in("task_id", taskIds);

      const allUserIds = new Set<string>();
      tasksData?.forEach(t => {
        allUserIds.add(t.created_by);
        allUserIds.add(t.task_owner);
      });
      collabData?.forEach(c => allUserIds.add(c.user_id));

      const [profilesRes, projectIds] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", Array.from(allUserIds)),
        Promise.resolve([...new Set(tasksData?.filter(t => t.project_id).map(t => t.project_id!) || [])]),
      ]);

      const profileMap = new Map(profilesRes.data?.map(p => [p.user_id, p]) || []);

      let projectMap = new Map<string, { title: string }>();
      if (projectIds.length > 0) {
        const { data: projectsData } = await supabase
          .from("projects")
          .select("id, title")
          .in("id", projectIds);
        projectMap = new Map(projectsData?.map(p => [p.id, { title: p.title }]) || []);
      }

      const enrichedTasks: Task[] = tasksData?.map(task => ({
        ...task,
        status: task.status as TaskStatus,
        priority: task.priority as TaskPriority,
        task_type: (task.task_type || "operational") as TaskType,
        creator_profile: profileMap.get(task.created_by) || null,
        owner_profile: profileMap.get(task.task_owner) || null,
        project: task.project_id ? projectMap.get(task.project_id) || null : null,
        collaborators: collabData
          ?.filter(c => c.task_id === task.id)
          .map(c => ({ ...c, profiles: profileMap.get(c.user_id) || undefined })) || [],
      })) || [];

      setTasks(enrichedTasks);

      const unread = collabData?.filter(c => c.user_id === user.id && !c.is_read).length || 0;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (taskData: {
    title: string;
    description: string;
    priority: TaskPriority;
    task_type: TaskType;
    project_id: string | null;
    task_owner: string;
    start_date: string | null;
    due_date: string | null;
    estimated_hours: number | null;
    recurring: boolean;
    recurring_type: string | null;
    collaborator_ids: string[];
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        title: taskData.title,
        description: taskData.description || null,
        priority: taskData.priority,
        task_type: taskData.task_type,
        project_id: taskData.project_id,
        task_owner: taskData.task_owner || user.id,
        start_date: taskData.start_date || null,
        due_date: taskData.due_date || null,
        estimated_hours: taskData.estimated_hours,
        recurring: taskData.recurring,
        recurring_type: taskData.recurring_type,
        created_by: user.id,
        status: "todo",
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create task");
      throw error;
    }

    if (taskData.collaborator_ids.length > 0) {
      await supabase
        .from("task_collaborators")
        .insert(taskData.collaborator_ids.map(uid => ({ task_id: task.id, user_id: uid })));
    }

    // Create notifications for assigned users
    const notifyUsers = new Set([taskData.task_owner, ...taskData.collaborator_ids]);
    notifyUsers.delete(user.id);
    if (notifyUsers.size > 0) {
      await supabase.from("notifications").insert(
        Array.from(notifyUsers).map(uid => ({
          user_id: uid,
          title: "New Task Assigned",
          message: `You have been assigned to task: ${taskData.title}`,
          type: "task",
          reference_id: task.id,
        }))
      );
    }

    toast.success("Task created successfully");
    fetchTasks();
    return task;
  };

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const currentTask = tasks.find(t => t.id === taskId);

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to update task");
      return;
    }

    // Log status change
    await supabase.from("task_status_history").insert({
      task_id: taskId,
      old_status: currentTask?.status || null,
      new_status: newStatus,
      changed_by: user.id,
    });

    fetchTasks();
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const { error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to update task");
      return;
    }
    fetchTasks();
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      toast.error("Failed to delete task");
      return;
    }
    toast.success("Task deleted");
    fetchTasks();
  };

  const markAsRead = async (taskId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("task_collaborators")
      .update({ is_read: true })
      .eq("task_id", taskId)
      .eq("user_id", user.id);

    fetchTasks();
  };

  const addComment = async (taskId: string, content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("task_comments").insert({
      task_id: taskId,
      user_id: user.id,
      content,
    });

    if (error) {
      toast.error("Failed to add comment");
      return;
    }
    toast.success("Comment added");
  };

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel("tasks-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => fetchTasks())
      .on("postgres_changes", { event: "*", schema: "public", table: "task_collaborators" }, () => fetchTasks())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchTasks]);

  return {
    tasks,
    unreadCount,
    loading,
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    markAsRead,
    addComment,
    refetch: fetchTasks,
  };
};
