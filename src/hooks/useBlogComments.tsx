import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlogComment {
  id: string;
  blog_post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewComment {
  blog_post_id: string;
  author_name: string;
  author_email: string;
  content: string;
}

// Public: fetch approved comments for a post
export const useBlogComments = (blogPostId: string | undefined) => {
  return useQuery<BlogComment[]>({
    queryKey: ["blog-comments", blogPostId],
    queryFn: async () => {
      if (!blogPostId) return [];
      const { data, error } = await (supabase as any)
        .from("blog_comments")
        .select("id, author_name, content, created_at, status")
        .eq("blog_post_id", blogPostId)
        .eq("status", "approved")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as BlogComment[];
    },
    enabled: !!blogPostId,
  });
};

// Admin: fetch all comments (all statuses)
export const useAllBlogComments = () => {
  return useQuery<BlogComment[]>({
    queryKey: ["blog-comments-all"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("blog_comments")
        .select(`
          id, blog_post_id, author_name, author_email, content,
          status, rejection_reason, moderated_by, moderated_at,
          created_at, updated_at
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as BlogComment[];
    },
  });
};

// Submit a new comment (guest)
export const useSubmitComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment: NewComment) => {
      const { data, error } = await (supabase as any)
        .from("blog_comments")
        .insert([comment])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blog-comments", variables.blog_post_id] });
    },
  });
};

// Admin: moderate (approve/reject) a comment
export const useModerateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      rejection_reason,
    }: {
      id: string;
      status: "approved" | "rejected";
      rejection_reason?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("blog_comments")
        .update({
          status,
          rejection_reason: rejection_reason || null,
          moderated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-comments-all"] });
      queryClient.invalidateQueries({ queryKey: ["blog-comments"] });
    },
  });
};

// Admin: delete a comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("blog_comments")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-comments-all"] });
      queryClient.invalidateQueries({ queryKey: ["blog-comments"] });
    },
  });
};
