import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import { useBlogBySlug } from "@/hooks/useBlogs";
 import ReactMarkdown from "react-markdown";
 import remarkGfm from "remark-gfm";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading } = useBlogBySlug(slug);

  if (isLoading) {
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
              {blog.published_at && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(blog.published_at).toLocaleDateString("en-US", { 
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
             <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary">
              {blog.content ? (
                 <ReactMarkdown 
                   remarkPlugins={[remarkGfm]}
                   components={{
                     img: ({ src, alt }) => (
                       <img 
                         src={src} 
                         alt={alt || ''} 
                         className="rounded-lg max-w-full h-auto my-4"
                       />
                     ),
                     h1: ({ children }) => (
                       <h1 className="font-display font-bold text-3xl mt-8 mb-4">{children}</h1>
                     ),
                     h2: ({ children }) => (
                       <h2 className="font-display font-bold text-2xl mt-6 mb-3">{children}</h2>
                     ),
                     p: ({ children }) => (
                       <p className="text-foreground leading-relaxed mb-4">{children}</p>
                     ),
                     strong: ({ children }) => (
                       <strong className="font-bold text-foreground">{children}</strong>
                     ),
                     ul: ({ children }) => (
                       <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
                     ),
                     ol: ({ children }) => (
                       <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
                     ),
                     blockquote: ({ children }) => (
                       <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">{children}</blockquote>
                     ),
                     code: ({ children }) => (
                       <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{children}</code>
                     ),
                   }}
                 >
                   {blog.content}
                 </ReactMarkdown>
              ) : (
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  {blog.excerpt}
                </p>
              )}

              {/* Link to full article if external source */}
              <div className="bg-muted/50 rounded-xl p-6 my-8">
                <p className="text-foreground mb-4">
                  Explore our completed projects and see our work in action.
                </p>
                <Button asChild>
                  <Link to="/projects">
                    <ArrowLeft className="mr-2 h-4 w-4 rotate-180" />
                    More Projects
                  </Link>
                </Button>
              </div>
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
