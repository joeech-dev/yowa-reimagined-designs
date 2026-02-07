import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OnlineUser {
  user_id: string;
  email: string | null;
  display_name: string | null;
  role: string | null;
  last_seen_at: string;
  is_online: boolean;
}

export const usePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const updatePresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      // Upsert presence
      await supabase.from("user_presence").upsert({
        user_id: user.id,
        email: user.email,
        display_name: user.email?.split("@")[0] || "User",
        role: roleData?.role || "user",
        last_seen_at: new Date().toISOString(),
        is_online: true,
      }, { onConflict: "user_id" });
    };

    const fetchOnlineUsers = async () => {
      // Consider users online if seen in last 2 minutes
      const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("user_presence")
        .select("*")
        .gte("last_seen_at", cutoff)
        .eq("is_online", true);
      if (data) setOnlineUsers(data as OnlineUser[]);
    };

    // Initial update
    updatePresence();
    fetchOnlineUsers();

    // Heartbeat every 30s
    interval = setInterval(() => {
      updatePresence();
      fetchOnlineUsers();
    }, 30000);

    // Realtime subscription
    const channel = supabase
      .channel("user-presence")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_presence" }, () => {
        fetchOnlineUsers();
      })
      .subscribe();

    // Set offline on unload
    const handleUnload = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("user_presence").update({ is_online: false }).eq("user_id", user.id);
      }
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
      window.removeEventListener("beforeunload", handleUnload);
      handleUnload();
    };
  }, []);

  return onlineUsers;
};
