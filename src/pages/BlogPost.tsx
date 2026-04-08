import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import EbookPromo from "@/components/EbookPromo";
import { useBlogBySlug } from "@/hooks/useBlogs";
import BlogPostsList from "@/components/BlogPostsList";
import BlogComments from "@/components/BlogComments";
import BlogStickyCTA from "@/components/BlogStickyCTA";
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

  if (!blog && !isLoading) {
    return (
      <div className="min-h-screen">
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
          <meta name="googlebot" content="noindex" />
          <title>Post Not Found | Yowa Innovations</title>
        </Helmet>
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
        url={`https://yowa.us/blog/${blog.slug}`}
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
            <div className="blog-content max-w-none">
              {blog.content ? (
                blog.content.trimStart().startsWith("<") ? (
                  // HTML content from WYSIWYG editor
                  <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                ) : (
                  // Legacy markdown fallback
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: ({ src, alt }) => (
                        <img src={src} alt={alt || ""} className="rounded-lg max-w-full h-auto my-4" />
                      ),
                      a: ({ href, children }) => {
                        const isInternal = href && (href.startsWith("/") || href.startsWith("https://yowa.us") || href.startsWith("https://yowaa.lovable.app"));
                        return (
                          <a
                            href={href}
                            {...(!isInternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="text-primary underline underline-offset-4 decoration-primary/50 hover:decoration-primary font-medium transition-colors"
                          >
                            {children}
                          </a>
                        );
                      },
                    }}
                  >
                    {blog.content}
                  </ReactMarkdown>
                )
              ) : (
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  {blog.excerpt}
                </p>
              )}
            </div>

            {/* Comments Section */}
            <BlogComments blogPostId={blog.id} />

            {/* eBook Promo */}
            <EbookPromo variant="compact" />

            {/* More Blog Posts */}
            <BlogPostsList currentSlug={slug} />

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
      <BlogStickyCTA />
    </div>
  );
};

export default BlogPost;
