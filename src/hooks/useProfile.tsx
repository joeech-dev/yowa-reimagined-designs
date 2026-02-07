import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  position: string | null;
  avatar_url: string | null;
  is_profile_complete: boolean;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    setProfile(data as UserProfile | null);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async (updates: Partial<Pick<UserProfile, "full_name" | "position" | "avatar_url">>) => {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update({ ...updates, is_profile_complete: true })
      .eq("user_id", profile.user_id);
    if (error) throw error;
    await fetchProfile();
  };

  return { profile, loading, updateProfile, refetch: fetchProfile };
};
