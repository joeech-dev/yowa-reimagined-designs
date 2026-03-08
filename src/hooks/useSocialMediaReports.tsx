import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SocialMediaClient {
  id: string;
  name: string;
  contact_person: string | null;
  contact_email: string | null;
  industry: string | null;
  platforms: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaReport {
  id: string;
  client_id: string;
  platform: string;
  report_period_start: string;
  report_period_end: string;
  followers_count: number;
  followers_gained: number;
  followers_lost: number;
  total_posts: number;
  total_reach: number;
  total_impressions: number;
  total_engagements: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_clicks: number;
  video_views: number;
  watch_time_minutes: number;
  stories_views: number;
  profile_visits: number;
  engagement_rate: number;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useSocialMediaClients() {
  return useQuery({
    queryKey: ["social-media-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_media_clients")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as SocialMediaClient[];
    },
  });
}

export function useSocialMediaReports(clientId?: string) {
  return useQuery({
    queryKey: ["social-media-reports", clientId],
    queryFn: async () => {
      let query = supabase
        .from("social_media_reports")
        .select("*")
        .order("report_period_end", { ascending: false });
      if (clientId) query = query.eq("client_id", clientId);
      const { data, error } = await query;
      if (error) throw error;
      return data as SocialMediaReport[];
    },
  });
}

export function useCreateSocialMediaClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (client: Omit<SocialMediaClient, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("social_media_clients").insert(client).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media-clients"] });
      toast({ title: "Client added successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error adding client", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateSocialMediaClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SocialMediaClient> & { id: string }) => {
      const { data, error } = await supabase.from("social_media_clients").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media-clients"] });
      toast({ title: "Client updated" });
    },
  });
}

export function useDeleteSocialMediaClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_media_clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media-clients"] });
      queryClient.invalidateQueries({ queryKey: ["social-media-reports"] });
      toast({ title: "Client deleted" });
    },
  });
}

export function useCreateSocialMediaReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (report: Omit<SocialMediaReport, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("social_media_reports").insert(report).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media-reports"] });
      toast({ title: "Report saved successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error saving report", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateSocialMediaReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SocialMediaReport> & { id: string }) => {
      const { data, error } = await supabase.from("social_media_reports").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media-reports"] });
      toast({ title: "Report updated" });
    },
  });
}

export function useDeleteSocialMediaReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_media_reports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media-reports"] });
      toast({ title: "Report deleted" });
    },
  });
}
