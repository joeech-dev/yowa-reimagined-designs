import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


interface Project {
  id: number;
  title: string;
  category: string;
  type: "video";
  description: string;
  videoUrl: string;
  client: string;
  year: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "SSA Uganda Project",
    category: "Documentary",
    type: "video",
    description: "Impactful documentary showcasing social impact initiatives across Uganda.",
    videoUrl: "https://www.youtube.com/embed/Nxe5EMEdX0M",
    client: "SSA Uganda",
    year: "2024",
  },
  {
    id: 2,
    title: "Wakisa Ministry",
    category: "Documentary",
    type: "video",
    description: "Heartfelt storytelling highlighting the transformative work of Wakisa Ministry.",
    videoUrl: "https://www.youtube.com/embed/d3WQQw6R3IY",
    client: "Wakisa Ministry",
    year: "2024",
  },
  {
    id: 3,
    title: "Friedrich Ebert Stiftung - Community Voices",
    category: "Video Production",
    type: "video",
    description: "Documentary capturing community engagement and democratic dialogue initiatives.",
    videoUrl: "https://www.youtube.com/embed/9ue9TNEm3WI",
    client: "Friedrich Ebert Stiftung",
    year: "2024",
  },
  {
    id: 4,
    title: "Friedrich Ebert Stiftung - Impact Stories",
    category: "Video Production",
    type: "video",
    description: "Compelling narratives showcasing social development and civic engagement projects.",
    videoUrl: "https://www.youtube.com/embed/5HaPFKc3ePs",
    client: "Friedrich Ebert Stiftung",
    year: "2024",
  },
  {
    id: 5,
    title: "COSL Project",
    category: "Documentary",
    type: "video",
    description: "Documentary highlighting cooperative development and community empowerment.",
    videoUrl: "https://www.youtube.com/embed/vAJ2sLemCK8",
    client: "COSL",
    year: "2024",
  },
  {
    id: 6,
    title: "Asaak Campaign",
    category: "Digital Marketing",
    type: "video",
    description: "Dynamic promotional campaign showcasing financial inclusion and entrepreneurship.",
    videoUrl: "https://www.youtube.com/embed/mRwFm6qtL10",
    client: "Asaak",
    year: "2024",
  },
];

const categories = ["All", "Documentary", "Video Production", "Digital Marketing"];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  return (
    <div className="min-h-screen">
      <SEO
        title="Portfolio | Yowa Innovations - Documentary & Video Production Projects"
        description="View our award-winning portfolio of documentaries, video productions & digital campaigns. 50+ projects for NGOs, corporates & startups across East Africa."
        keywords="video production portfolio Uganda, documentary projects East Africa, creative campaigns portfolio, NGO video production, corporate video Uganda, media production samples"
        url="https://yowainnovations.com/portfolio"
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
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <iframe
                    src={project.videoUrl}
                    title={project.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
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
