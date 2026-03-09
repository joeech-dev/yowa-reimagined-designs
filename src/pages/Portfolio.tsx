import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProjectDetailModal from "@/components/ProjectDetailModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Film } from "lucide-react";

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
  slug?: string;
}

const getThumbUrl = (url: string) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?]+)/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  return null;
};

const slugify = (title: string, id: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + id.slice(0, 8);

const TRAINING_CATEGORIES = ["Training Program", "Training", "Workshop", "Capacity Building"];

const ProjectCard = ({
  project,
  onClick,
  cardRef,
}: {
  project: PortfolioProject;
  onClick: (p: PortfolioProject) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}) => {
  const thumb = getThumbUrl(project.video_url);
  const projectSlug = slugify(project.title, project.id);
  return (
    <Card
      ref={cardRef}
      className="group overflow-hidden border-border hover:shadow-warm transition-smooth cursor-pointer"
      onClick={() => onClick(project)}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {thumb ? (
          <>
            <img
              src={thumb}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-muted-foreground/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-6">
        <Badge variant="secondary" className="mb-3">
          {project.category}
        </Badge>
        <h3 className="font-display font-semibold text-xl mb-2 group-hover:text-primary transition-smooth">
          {project.title}
        </h3>
        {project.description && (
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2">
            {project.description}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{project.client || ""}</span>
          {project.year && <span>{project.year}</span>}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground/60 font-mono truncate">
            /projects/{projectSlug}
          </p>
        </div>
      </div>
    </Card>
  );
};

const Portfolio = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["public-portfolio-projects"],
    queryFn: async () => {
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

  // Separate into training vs other projects
  const trainingProjects = projects.filter(p =>
    TRAINING_CATEGORIES.some(cat => cat.toLowerCase() === p.category.toLowerCase())
  );
  const productionProjects = projects.filter(p =>
    !TRAINING_CATEGORIES.some(cat => cat.toLowerCase() === p.category.toLowerCase())
  );

  // Open project from URL param once data loaded
  useEffect(() => {
    if (!projectId || projects.length === 0) return;
    const found = projects.find(p => slugify(p.title, p.id) === projectId || p.id === projectId);
    if (found) {
      setSelectedProject(found);
    }
  }, [projectId, projects]);

  const handleOpenProject = (project: PortfolioProject) => {
    const el = cardRefs.current[project.id];
    setTriggerRect(el ? el.getBoundingClientRect() : null);
    setSelectedProject(project);
    navigate(`/projects/${slugify(project.title, project.id)}`, { replace: false });
  };

  const handleCloseProject = () => {
    setSelectedProject(null);
    navigate("/projects", { replace: false });
  };

  const renderGrid = (items: PortfolioProject[], emptyMessage: string) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={handleOpenProject}
            cardRef={(el) => { cardRefs.current[project.id] = el; }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Projects | Yowa Innovations - Our Completed Work"
        description="View our completed projects — documentaries, video productions, training programs & digital campaigns. 50+ projects for NGOs, corporates & startups across East Africa."
        keywords="video production projects Uganda, documentary projects East Africa, training programs, creative campaigns, NGO video production, corporate video Uganda"
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
              training programs and digital campaigns. Each piece tells a story of innovation,
              creativity, and meaningful change.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Tabs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : (
            <Tabs defaultValue="productions">
              <TabsList className="mb-10">
                <TabsTrigger value="productions" className="gap-2">
                  <Film className="h-4 w-4" />
                  Video Productions
                  {productionProjects.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">{productionProjects.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="training" className="gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Training Programs
                  {trainingProjects.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">{trainingProjects.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="productions">
                {renderGrid(productionProjects, "No video production projects yet. Check back soon!")}
              </TabsContent>

              <TabsContent value="training">
                <div className="mb-8 p-6 rounded-2xl bg-primary/5 border border-primary/15">
                  <div className="flex items-center gap-3 mb-2">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <h2 className="font-display font-semibold text-2xl">Training Programs</h2>
                  </div>
                  <p className="text-muted-foreground">
                    Capacity building workshops and training programs we've delivered for organisations across East Africa.
                  </p>
                </div>
                {renderGrid(trainingProjects, "No training programs to display yet. Check back soon!")}
              </TabsContent>
            </Tabs>
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

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={handleCloseProject}
          triggerRect={triggerRect}
        />
      )}
    </div>
  );
};

export default Portfolio;
