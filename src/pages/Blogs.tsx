import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { blogs } from "@/data/blogs";
import { useTrendingBlogs } from "@/hooks/useTrendingBlogs";
import { ExternalLink } from "lucide-react";

const Blogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState(categoryParam || "all");
  const { data: trendingBlogs = [], isLoading } = useTrendingBlogs();

  const categories = ["all", "trending", "infrastructure", "urbanism", "livelihood"];

  // Combine static and trending blogs
  const allBlogs = activeCategory === "trending" 
    ? trendingBlogs.map(blog => ({
        ...blog,
        category: "Trending"
      }))
    : activeCategory === "all"
    ? [...blogs, ...trendingBlogs.map(blog => ({ ...blog, category: "Trending" }))]
    : blogs.filter((blog) => blog.category.toLowerCase() === activeCategory);

  const filteredBlogs = allBlogs;

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
        title="Blog - Yowa Innovations"
        description="Insights, stories, and perspectives on innovation, sustainability, and impact. Explore trending topics in urbanism, livelihood, infrastructure, and more."
        keywords="innovation blog, sustainability, urbanism, livelihood, infrastructure, Uganda development, creative insights"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">Our Blog</h1>
            <p className="text-xl text-muted-foreground">
              Insights, stories, and perspectives on innovation, sustainability, and impact.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
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

      {/* Blog Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading && activeCategory === "trending" ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">Loading trending posts...</p>
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <div key={blog.id} className="relative">
                  <BlogCard {...blog} />
                  {blog.category === "Trending" && blog.source_url && (
                    <a 
                      href={blog.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:scale-110 transition-smooth"
                      title={blog.source_name ? `Read on ${blog.source_name}` : 'Read original'}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                No blog posts found in this category.
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
