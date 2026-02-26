import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OnlineUser {
  user_id: string;
  email: string | null;
  display_name: string | null;
  role: string | null;
  last_seen_at: string;
  is_online: boolean;
  location?: string | null;
}

/** Fetch approximate city/country from ipapi.co (free, no key required) */
const getIpLocation = async (): Promise<string | null> => {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = await res.json();
    const city = data.city || "";
    const country = data.country_name || "";
    return [city, country].filter(Boolean).join(", ") || null;
  } catch {
    return null;
  }
};

export const usePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let cachedLocation: string | null = null;

    const updatePresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch location once per session
      if (!cachedLocation) {
        cachedLocation = await getIpLocation();
      }

      await (supabase.from("user_presence") as any).upsert({
        user_id: user.id,
        email: user.email,
        display_name: user.email?.split("@")[0] || "User",
        role: roleData?.role || "user",
        last_seen_at: new Date().toISOString(),
        is_online: true,
        location: cachedLocation,
      }, { onConflict: "user_id" });
    };

    const fetchOnlineUsers = async () => {
      const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { data } = await (supabase.from("user_presence") as any)
        .select("*")
        .gte("last_seen_at", cutoff)
        .eq("is_online", true);
      if (data) setOnlineUsers(data as OnlineUser[]);
    };

    updatePresence();
    fetchOnlineUsers();

    interval = setInterval(() => {
      updatePresence();
      fetchOnlineUsers();
    }, 30000);

    const channel = supabase
      .channel("user-presence")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_presence" }, () => {
        fetchOnlineUsers();
      })
      .subscribe();

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
