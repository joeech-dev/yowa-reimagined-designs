import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  category: string;
  image: string | null;
  slug: string;
  source_url: string;
  source_name: string;
  published_at: string;
  content: string | null;
}

export const useBlogs = (category?: string) => {
  return useQuery<BlogPost[]>({
    queryKey: ["blogs", category],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("id, title, excerpt, category, image, slug, source_url, source_name, published_at, content")
        .order("published_at", { ascending: false });

      if (category && category !== "all") {
        query = query.ilike("category", category);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Failed to fetch blogs", error);
        return [];
      }

      return (data || []) as BlogPost[];
    },
  });
};

export const useBlogBySlug = (slug: string | undefined) => {
  return useQuery<BlogPost | null>({
    queryKey: ["blog", slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch blog", error);
        return null;
      }

      return data as BlogPost | null;
    },
    enabled: !!slug,
  });
};
