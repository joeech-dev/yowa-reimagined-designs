import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BlogCard from "@/components/BlogCard";
import PartnersSection from "@/components/PartnersSection";
import WhoWeWorkWith from "@/components/WhoWeWorkWith";
import TestimonialsSection from "@/components/TestimonialsSection";
import StatsSection from "@/components/StatsSection";
import ProblemSection from "@/components/ProblemSection";

import OurModelSection from "@/components/OurModelSection";
import ServicesSection from "@/components/ServicesSection";
import FeaturedImpactStory from "@/components/FeaturedImpactStory";
import WhyChooseYowa from "@/components/WhyChooseYowa";
import HowWeWork from "@/components/HowWeWork";
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

  return (
    <div className="min-h-screen">
      <SEO />
      <Navbar />
      <main>

      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-[80vh] flex items-center bg-foreground">
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
        <div className="absolute inset-0 bg-black/50 z-[3]" />
        <div className="container mx-auto px-4 relative z-[4]">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display font-bold text-5xl md:text-7xl mb-6 text-white drop-shadow-lg">
              Turning Development Impact into Powerful Stories
            </h1>
            <p className="text-xl md:text-2xl font-display font-semibold mb-6 text-white drop-shadow-md">
              We help NGOs, social enterprises, and institutions document their work through
              documentary film, research, and strategic storytelling—while creating opportunities
              for young creatives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/get-started">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg shadow-primary hover:scale-105 transition-smooth">
                  Start a Project
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button size="lg" variant="outline" className="border-white/70 text-white hover:bg-white/20 hover:border-white transition-smooth backdrop-blur-sm">
                  View Our Work
                </Button>
              </Link>
            </div>
          </div>
        </div>
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

      {/* 2. Trusted Organisations */}
      <PartnersSection />

      {/* 3. Who We Work With */}
      <WhoWeWorkWith />

      {/* 4. Services */}
      <ServicesSection />

      {/* 5. Featured Impact Story */}
      <FeaturedImpactStory />

      {/* 6. Impact Numbers */}
      <StatsSection />

      {/* 7. Problem */}
      <ProblemSection />

      {/* 9. Youth Model */}
      <OurModelSection />

      {/* 10. Why Choose Yowa */}
      <WhyChooseYowa />

      {/* 11. How We Work */}
      <HowWeWork />

      {/* 12. Blog / Insights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4 text-center">
            Insights on Storytelling, Development & Impact
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Perspectives on impact communication, documentary storytelling, and the creative
            economy across Africa.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestBlogs.map((blog) => (
              <BlogCard key={blog.id} {...blog} published_at={blog.published_at} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/blogs">
              <Button variant="outline" size="lg">
                View All Insights
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* eBook Promo */}
      <EbookPromo variant="banner" />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* 13. Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Let's Tell Your Impact Story
          </h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto opacity-90">
            If your organisation is implementing meaningful work that deserves stronger visibility,
            we would love to collaborate with you. From documentary production to research
            publications and digital communication, we help institutions transform their impact
            into powerful narratives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="hover:scale-105 transition-smooth">
              <Link to="/get-started">
                Start a Project
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground/70 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground transition-smooth">
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default Index;
