import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { useBlogs } from "@/hooks/useBlogs";
import { ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Blogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState(categoryParam || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: allBlogs = [], isLoading } = useBlogs(activeCategory === "all" ? undefined : activeCategory);

  const categories = ["all", "trending", "infrastructure", "urbanism", "livelihood"];

  const filteredBlogs = searchQuery
    ? allBlogs.filter(
        (b) =>
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.excerpt && b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allBlogs;

  const featuredBlog = filteredBlogs[0];
  const remainingBlogs = filteredBlogs.slice(1);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Blog | Yowa Innovations - Insights on Innovation & Impact"
        description="Expert insights on innovation, sustainability & social impact in East Africa. Read about urbanism, livelihood development, infrastructure & creative storytelling."
        keywords="innovation blog Uganda, sustainability insights, urbanism Africa, livelihood programs, infrastructure East Africa, social impact stories"
        url="https://yowa.us/blogs"
        type="website"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display font-bold text-4xl md:text-6xl mb-4">Our Blog</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Insights, stories, and perspectives on innovation, sustainability, and impact across East Africa.
            </p>
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category)}
                className={
                  activeCategory === category
                    ? "gradient-warm"
                    : "hover:border-primary transition-smooth"
                }
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="space-y-12">
              {/* Featured Post */}
              {featuredBlog && (
                <div className="relative">
                  <BlogCard
                    title={featuredBlog.title}
                    excerpt={featuredBlog.excerpt}
                    category={featuredBlog.category}
                    image={featuredBlog.image}
                    slug={featuredBlog.slug}
                    published_at={featuredBlog.published_at}
                    featured
                  />
                  {featuredBlog.source_url && !featuredBlog.source_url.includes("yowa") && (
                    <a
                      href={featuredBlog.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:scale-110 transition-smooth"
                      title={featuredBlog.source_name ? `Read on ${featuredBlog.source_name}` : "Read original"}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

              {/* Grid */}
              {remainingBlogs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remainingBlogs.map((blog) => (
                    <div key={blog.id} className="relative">
                      <BlogCard
                        title={blog.title}
                        excerpt={blog.excerpt}
                        category={blog.category}
                        image={blog.image}
                        slug={blog.slug}
                        published_at={blog.published_at}
                      />
                      {blog.source_url && !blog.source_url.includes("yowa") && (
                        <a
                          href={blog.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-4 right-4 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:scale-110 transition-smooth z-10"
                          title={blog.source_name ? `Read on ${blog.source_name}` : "Read original"}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                {searchQuery ? "No posts match your search." : "No blog posts found in this category."}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blogs;
