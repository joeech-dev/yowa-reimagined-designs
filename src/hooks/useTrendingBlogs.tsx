import { useQuery } from "@tanstack/react-query";

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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return [];
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/blog_posts?category=eq.trending&order=published_at.desc&limit=20`,
        {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
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
