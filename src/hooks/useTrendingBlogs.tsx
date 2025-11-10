import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TrendingBlog {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  slug: string;
  source_url: string;
  source_name: string;
  published_at: string;
}

export const useTrendingBlogs = () => {
  return useQuery<TrendingBlog[]>({
    queryKey: ["trending-blogs"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("blog_posts")
        .select("id, title, excerpt, category, image, slug, source_url, source_name, published_at")
        .eq("category", "trending")
        .order("published_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Failed to fetch trending blogs", error);
        return [];
      }

      return (data || []) as TrendingBlog[];
    },
  });
};
