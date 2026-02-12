import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  collaborators?: { user_id: string; is_read: boolean; profiles?: { full_name: string | null; avatar_url: string | null } }[];
  creator_profile?: { full_name: string | null; avatar_url: string | null };
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch tasks
      const { data: tasksData, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch collaborators for each task
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

      // Fetch profiles for collaborators and creators
      const allUserIds = new Set<string>();
      tasksData?.forEach(t => allUserIds.add(t.created_by));
      collabData?.forEach(c => allUserIds.add(c.user_id));

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", Array.from(allUserIds));

      const profileMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      const enrichedTasks = tasksData?.map(task => ({
        ...task,
        creator_profile: profileMap.get(task.created_by) || null,
        collaborators: collabData
          ?.filter(c => c.task_id === task.id)
          .map(c => ({ ...c, profiles: profileMap.get(c.user_id) || undefined })) || [],
      })) || [];

      setTasks(enrichedTasks);

      // Count unread tasks where current user is a collaborator
      const unread = collabData?.filter(
        c => c.user_id === user.id && !c.is_read
      ).length || 0;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (title: string, description: string, priority: string, dueDate: string | null, collaboratorIds: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({ title, description, priority, due_date: dueDate, created_by: user.id })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create task");
      throw error;
    }

    if (collaboratorIds.length > 0) {
      const { error: collabError } = await supabase
        .from("task_collaborators")
        .insert(collaboratorIds.map(uid => ({ task_id: task.id, user_id: uid })));

      if (collabError) {
        console.error("Failed to add collaborators:", collabError);
      }
    }

    toast.success("Task created successfully");
    fetchTasks();
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to update task");
      return;
    }
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

  useEffect(() => {
    fetchTasks();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("task-collaborators-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "task_collaborators" }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchTasks]);

  return { tasks, unreadCount, loading, createTask, updateTaskStatus, markAsRead, refetch: fetchTasks };
};
