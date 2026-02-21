import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PortfolioProject {
  id: string;
  title: string;
  description: string | null;
  category: string;
  video_url: string;
  client: string | null;
  year: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

const Portfolio = () => {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["public-portfolio-projects"],
    queryFn: async () => {
      // Fetch from both portfolio_projects and projects tables
      const [portfolioRes, projectsRes] = await Promise.all([
        supabase
          .from("portfolio_projects")
          .select("id, title, description, category, video_url, client, year, display_order, is_active")
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
        supabase
          .from("projects")
          .select("id, title, description, client_name, video_url, status, show_on_website")
          .eq("show_on_website", true)
          .eq("status", "completed"),
      ]);

      const portfolioItems: PortfolioProject[] = (portfolioRes.data || []);

      // Map projects table items to same shape, avoiding duplicates by title
      const portfolioTitles = new Set(portfolioItems.map(p => p.title.toLowerCase()));
      const projectItems: PortfolioProject[] = (projectsRes.data || [])
        .filter(p => p.video_url && !portfolioTitles.has(p.title.toLowerCase()))
        .map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          category: "Video Production",
          video_url: p.video_url!,
          client: p.client_name,
          year: null,
          display_order: 999,
          is_active: true,
        }));

      return [...portfolioItems, ...projectItems];
    },
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="Projects | Yowa Innovations - Our Completed Work"
        description="View our completed projects — documentaries, video productions & digital campaigns. 50+ projects for NGOs, corporates & startups across East Africa."
        keywords="video production projects Uganda, documentary projects East Africa, creative campaigns, NGO video production, corporate video Uganda"
        url="https://yowa.us/projects"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display font-bold text-4xl md:text-6xl mb-6">
              Our Projects
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Explore our collection of impactful projects—from powerful documentaries to engaging
              digital campaigns. Each piece tells a story of innovation, creativity, and meaningful
              change.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                No projects to display yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="group overflow-hidden border-border hover:shadow-warm transition-smooth"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <iframe
                      src={(() => {
                        let url = project.video_url;
                        // Convert watch URLs to embed URLs
                        const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
                        if (watchMatch) {
                          url = `https://www.youtube.com/embed/${watchMatch[1]}`;
                        }
                        url = url.replace('www.youtube.com/embed', 'www.youtube-nocookie.com/embed');
                        url = url.replace('youtube.com/embed', 'www.youtube-nocookie.com/embed');
                        const separator = url.includes('?') ? '&' : '?';
                        return `${url}${separator}modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&controls=1&fs=1`;
                      })()}
                      title={project.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      className="w-full h-full absolute inset-0"
                    />
                  </div>
                  <div className="p-6">
                    <Badge variant="secondary" className="mb-3">
                      {project.category}
                    </Badge>
                    <h3 className="font-display font-semibold text-xl mb-2 group-hover:text-primary transition-smooth">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{project.client || ""}</span>
                      {project.year && <span>{project.year}</span>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's collaborate to create impactful content that tells your story and drives real
            change.
          </p>
          <Button size="lg" className="gradient-warm shadow-warm" asChild>
            <a href="/get-started">Get Started Today</a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Portfolio;
