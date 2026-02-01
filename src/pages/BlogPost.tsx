import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import { blogs, Blog } from "@/data/blogs";
import { supabase } from "@/integrations/supabase/client";

interface DatabaseBlog {
  id: string;
  title: string;
  excerpt: string | null;
  category: string;
  image: string | null;
  slug: string;
  source_url: string;
  source_name: string;
  published_at: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | DatabaseBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFromDatabase, setIsFromDatabase] = useState(false);

  useEffect(() => {
    const findBlog = async () => {
      // First check static blogs
      const staticBlog = blogs.find((b) => b.slug === slug);
      if (staticBlog) {
        setBlog(staticBlog);
        setIsFromDatabase(false);
        setLoading(false);
        return;
      }

      // Then check database
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (data) {
        setBlog(data);
        setIsFromDatabase(true);
      }
      setLoading(false);
    };

    findBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display font-bold text-4xl mb-4">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/blogs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Link>
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const sourceUrl = "source_url" in blog ? blog.source_url : undefined;
  const sourceName = "source_name" in blog ? blog.source_name : undefined;
  const publishedAt = "published_at" in blog ? blog.published_at : undefined;

  return (
    <div className="min-h-screen">
      <SEO
        title={`${blog.title} | Yowa Innovations Blog`}
        description={blog.excerpt || "Read this insightful article from Yowa Innovations."}
        url={`https://yowainnovations.com/blog/${blog.slug}`}
        type="article"
      />
      <Navbar />

      <article className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <Button variant="ghost" asChild className="mb-8">
              <Link to="/blogs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Link>
            </Button>

            {/* Header */}
            <header className="mb-8">
              <Badge variant="secondary" className="mb-4">
                {blog.category}
              </Badge>
              <h1 className="font-display font-bold text-3xl md:text-5xl mb-4 leading-tight">
                {blog.title}
              </h1>
              {publishedAt && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(publishedAt).toLocaleDateString("en-US", { 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}</span>
                </div>
              )}
            </header>

            {/* Featured Image */}
            {blog.image && (
              <div className="aspect-[16/9] overflow-hidden rounded-xl mb-8">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                {blog.excerpt}
              </p>

              {/* For database posts, link to full article */}
              {isFromDatabase && sourceUrl && (
                <div className="bg-muted/50 rounded-xl p-6 my-8">
                  <p className="text-foreground mb-4">
                    This is a curated article. Read the full story on {sourceName || "the original source"}.
                  </p>
                  <Button asChild>
                    <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Read Full Article
                    </a>
                  </Button>
                </div>
              )}

              {/* For static blogs, show placeholder content */}
              {!isFromDatabase && (
                <div className="space-y-6">
                  <p>
                    This article explores important topics related to {blog.category.toLowerCase()} 
                    and innovation in East Africa. The insights shared here reflect our commitment 
                    to sustainable development and community empowerment.
                  </p>
                  <p>
                    At Yowa Innovations, we believe in the power of storytelling to drive meaningful 
                    change. Through our documentaries and digital content, we aim to amplify voices 
                    that matter and showcase the transformative work happening across the region.
                  </p>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="mt-12 p-8 bg-primary/5 rounded-xl text-center">
              <h3 className="font-display font-bold text-2xl mb-3">
                Want to tell your story?
              </h3>
              <p className="text-muted-foreground mb-6">
                We help organizations create impactful content that drives change.
              </p>
              <Button asChild>
                <Link to="/get-started">Start Your Project</Link>
              </Button>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
