import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";

interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  category: string;
}

const BlogPostsList = ({ currentSlug }: { currentSlug?: string }) => {
  const { data: posts = [] } = useQuery({
    queryKey: ["all-blog-posts-footer"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, image, category")
        .order("published_at", { ascending: false })
        .limit(20);
      return (data || []) as BlogPostItem[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredPosts = posts.filter(p => p.slug !== currentSlug);

  if (filteredPosts.length === 0) return null;

  return (
    <div className="border-t pt-10 mt-10">
      <h3 className="font-display font-bold text-xl mb-6">More Articles</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPosts.map(post => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            {post.image ? (
              <img
                src={post.image}
                alt=""
                className="h-12 w-12 rounded-md object-cover flex-shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-muted-foreground/40" />
              </div>
            )}
            <span className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogPostsList;
