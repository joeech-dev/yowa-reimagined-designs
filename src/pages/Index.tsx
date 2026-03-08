import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BlogCard from "@/components/BlogCard";
import PartnersSection from "@/components/PartnersSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import StatsSection from "@/components/StatsSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import OurModelSection from "@/components/OurModelSection";
import ServicesSection from "@/components/ServicesSection";
import EbookPromo from "@/components/EbookPromo";
import { Button } from "@/components/ui/button";
import { useBlogs } from "@/hooks/useBlogs";
import heroBackground from "@/assets/hero-background.jpg";
import hero1 from "@/assets/hero/hero-1.jpg";
import hero2 from "@/assets/hero/hero-2.jpg";
import hero3 from "@/assets/hero/hero-3.jpg";
import hero4 from "@/assets/hero/hero-4.jpg";
import hero5 from "@/assets/hero/hero-5.jpg";
import hero6 from "@/assets/hero/hero-6.jpg";
import hero7 from "@/assets/hero/hero-7.jpg";

const heroImages = [heroBackground, hero1, hero2, hero3, hero4, hero5, hero6, hero7];

const Index = () => {
  const { data: allBlogs = [] } = useBlogs();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nextSlide, setNextSlide] = useState(1);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        setNextSlide((prev) => (prev + 1) % heroImages.length);
        setTransitioning(false);
      }, 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const latestBlogs = allBlogs.slice(0, 3);
  const urbanismBlogs = allBlogs.filter((b) => b.category.toLowerCase() === "urbanism").slice(0, 2);
  const livelihoodBlogs = allBlogs.filter((b) => b.category.toLowerCase() === "livelihood").slice(0, 2);

  return (
    <div className="min-h-screen">
      <SEO />
      <Navbar />
      <main>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-[80vh] flex items-center bg-foreground">
        {/* Background slides */}
        {heroImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Yowa Innovations hero background ${index + 1}`}
            className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000"
            style={{
              opacity: index === currentSlide ? (transitioning ? 0 : 1) : index === nextSlide && transitioning ? 1 : 0,
              zIndex: index === currentSlide ? 1 : index === nextSlide ? 2 : 0,
            }}
            fetchPriority={index === 0 ? "high" : "low"}
            decoding="async"
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 z-[3]" />

        {/* Content */}
        <div className="container mx-auto px-4 relative z-[4]">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display font-bold text-5xl md:text-7xl mb-6 text-white drop-shadow-lg">
              Yowa Innovations
            </h1>
            <p className="text-2xl md:text-3xl font-display font-semibold mb-6 text-white drop-shadow-md">
              We Turn Impact into Stories That Create Opportunity
            </p>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              We help NGOs and social impact organisations communicate their work clearly while empowering young creatives with practical skills, income opportunities, and visibility.
            </p>
            <p className="text-xl font-semibold mb-8 text-white">
              We create. We connect. We innovate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/get-started">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg shadow-primary hover:scale-105 transition-smooth">
                  Get Started
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-white/70 text-white hover:bg-white/20 hover:border-white transition-smooth backdrop-blur-sm">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-[4]">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => { setCurrentSlide(index); setNextSlide((index + 1) % heroImages.length); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Partners Section */}
      <PartnersSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Stats Section */}
      <StatsSection />

      {/* The Problem */}
      <ProblemSection />

      {/* The Solution */}
      <SolutionSection />

      {/* Our Model */}
      <OurModelSection />

      {/* Latest Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-12 text-center">
            Latest Blog Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestBlogs.map((blog) => (
              <BlogCard key={blog.id} {...blog} published_at={blog.published_at} />
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

      {/* Best from Urbanism */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-12">
            Best from Urbanism
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {urbanismBlogs.map((blog) => (
              <BlogCard key={blog.id} {...blog} published_at={blog.published_at} />
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
              <BlogCard key={blog.id} {...blog} published_at={blog.published_at} />
            ))}
          </div>
        </div>
      </section>

      {/* eBook Promo */}
      <EbookPromo variant="banner" />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            See Our Work in Action
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Explore our projects that have made a difference across
            communities and industries.
          </p>
          <Button size="lg" variant="secondary" asChild className="hover:scale-105 transition-smooth">
            <Link to="/projects">
              View Projects
              <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default Index;
