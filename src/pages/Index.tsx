import { Link } from "react-router-dom";
import { ArrowRight, Video, Camera, Lightbulb, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BlogCard from "@/components/BlogCard";
import PartnersSection from "@/components/PartnersSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import StatsSection from "@/components/StatsSection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { blogs } from "@/data/blogs";

const Index = () => {
  const latestBlogs = blogs.slice(0, 3);
  const urbanismBlogs = blogs.filter((b) => b.category === "Urbanism").slice(0, 2);
  const livelihoodBlogs = blogs.filter((b) => b.category === "Livelihood").slice(0, 2);

  const services = [
    {
      icon: Video,
      title: "Video Production",
      description:
        "From narrative-driven documentaries to dynamic promotional reels, we capture the heart of your message and turn it into visual impact.",
    },
    {
      icon: Camera,
      title: "Photography",
      description:
        "From promotional portraits to on-ground reportage, our photography services provide both aesthetic flair and narrative depth.",
    },
    {
      icon: Lightbulb,
      title: "Creative Strategy",
      description:
        "Crafting a roadmap to turn vision into reality—bridging brand identity and audience engagement.",
    },
    {
      icon: Share2,
      title: "Digital Marketing",
      description:
        "From targeted campaigns to influencer collaborations, we ensure your content reaches the right audience.",
    },
  ];

  return (
    <div className="min-h-screen">
      <SEO />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display font-bold text-5xl md:text-7xl mb-6 text-primary">
              Yowa Innovations
            </h1>
            <p className="text-2xl md:text-3xl font-display font-semibold mb-6">
61:               Innovating Reality. Inspiring Impact.
62:             </p>
63:             <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
64:               Welcome to <strong>Yowa Innovations.</strong> A content creation and advertising
65:               agency that reimagines the everyday. We turn bold ideas into visual stories, using
66:               media, technology, and creativity to spark transformation in agriculture, the
67:               environment, education, and beyond.
68:             </p>
69:             <p className="text-xl font-semibold mb-8">
70:               We create. We connect. We innovate.
71:             </p>
72:             <div className="flex flex-col sm:flex-row gap-4 justify-center">
73:               <Link to="/get-started">
74:                 <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg shadow-primary hover:scale-105 transition-smooth">
75:                   Get Started
76:                   <ArrowRight className="ml-2" />
77:                 </Button>
78:               </Link>
79:               <Link to="/about">
80:                 <Button size="lg" variant="outline" className="hover:border-primary hover:text-primary transition-smooth">
81:                   Learn More
82:                 </Button>
83:               </Link>
84:             </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Partners Section */}
      <PartnersSection />

      {/* Latest Blog Posts */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-12 text-center">
            Latest Blog Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestBlogs.map((blog) => (
              <BlogCard key={blog.id} {...blog} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/blogs">
              <Button variant="outline" size="lg">
                View All Posts
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4 text-center">
            Our Services
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Whether you're an NGO, corporate brand, or startup, we're your go-to partner for
            impactful storytelling and creative campaigns.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className="p-6 hover:shadow-primary transition-smooth border-border group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth">
                    <Icon className="text-primary-foreground" size={24} />
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-3">{service.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Best from Urbanism */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-12">
            Best from Urbanism
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {urbanismBlogs.map((blog) => (
              <BlogCard key={blog.id} {...blog} />
            ))}
          </div>
        </div>
      </section>

      {/* Best from Livelihood */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-12">
            Best from Livelihood
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {livelihoodBlogs.map((blog) => (
              <BlogCard key={blog.id} {...blog} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            See Our Work in Action
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Explore our portfolio of transformative projects that have made a difference across
            communities and industries.
          </p>
          <Button size="lg" variant="secondary" asChild className="hover:scale-105 transition-smooth">
            <Link to="/portfolio">
              View Portfolio
              <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
