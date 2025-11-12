import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Image as ImageIcon } from "lucide-react";

interface Project {
  id: number;
  title: string;
  category: string;
  type: "video" | "photo";
  description: string;
  image: string;
  client: string;
  year: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "Sustainable Agriculture Documentary",
    category: "Documentary",
    type: "video",
    description:
      "A 30-minute documentary showcasing innovative farming techniques transforming rural communities across Uganda.",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
    client: "Agricultural Development NGO",
    year: "2024",
  },
  {
    id: 2,
    title: "Urban Housing Campaign",
    category: "Digital Marketing",
    type: "photo",
    description:
      "Multi-platform campaign highlighting affordable housing solutions for urban communities.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    client: "Uganda Housing Cooperative Union",
    year: "2023",
  },
  {
    id: 3,
    title: "Environmental Conservation Series",
    category: "Photography",
    type: "photo",
    description:
      "Visual storytelling capturing the beauty and fragility of Uganda's natural ecosystems.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    client: "Environmental Conservation Organization",
    year: "2024",
  },
  {
    id: 4,
    title: "Education Access Promotional Video",
    category: "Video Production",
    type: "video",
    description:
      "Compelling narrative showcasing the impact of education programs in underserved communities.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    client: "Education Development Foundation",
    year: "2023",
  },
  {
    id: 5,
    title: "Social Enterprise Brand Launch",
    category: "Creative Strategy",
    type: "photo",
    description:
      "Comprehensive brand identity and launch campaign for a youth-led social enterprise.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    client: "Youth Entrepreneurship Initiative",
    year: "2024",
  },
  {
    id: 6,
    title: "Community Development Stories",
    category: "Documentary",
    type: "video",
    description:
      "Short-form documentary series highlighting grassroots development initiatives.",
    image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800",
    client: "International Development Partner",
    year: "2023",
  },
];

const categories = ["All", "Documentary", "Video Production", "Photography", "Digital Marketing", "Creative Strategy"];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  return (
    <div className="min-h-screen">
      <SEO
        title="Portfolio - Yowa Innovations"
        description="Explore our portfolio of impactful projects including documentaries, digital campaigns, and creative content that drives meaningful change across communities."
        keywords="portfolio, case studies, documentary projects, creative campaigns, video production portfolio, Uganda media projects"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display font-bold text-4xl md:text-6xl mb-6">
              Our Portfolio
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Explore our collection of impactful projects—from powerful documentaries to engaging
              digital campaigns. Each piece tells a story of innovation, creativity, and meaningful
              change.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className={activeCategory === category ? "gradient-warm" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="group overflow-hidden border-border hover:shadow-warm transition-smooth"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
                    {project.type === "video" ? (
                      <Play className="text-white" size={48} />
                    ) : (
                      <ImageIcon className="text-white" size={48} />
                    )}
                  </div>
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                    {project.type === "video" ? "Video" : "Photo"}
                  </Badge>
                </div>
                <div className="p-6">
                  <Badge variant="secondary" className="mb-3">
                    {project.category}
                  </Badge>
                  <h3 className="font-display font-semibold text-xl mb-2 group-hover:text-primary transition-smooth">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{project.client}</span>
                    <span>{project.year}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
