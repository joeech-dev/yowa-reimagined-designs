import { useQuery } from "@tanstack/react-query";
import { supabaseConfig } from "@/lib/supabase";

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
  return useQuery({
    queryKey: ["trending-blogs"],
    queryFn: async () => {
      const response = await fetch(
        `${supabaseConfig.url}/rest/v1/blog_posts?category=eq.trending&order=published_at.desc&limit=20`,
        {
          headers: {
            'apikey': supabaseConfig.anonKey,
            'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch trending blogs');
        return [];
      }

      const data = await response.json();
      return data as TrendingBlog[];
    },
  });
};
