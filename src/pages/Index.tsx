import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Navigation Dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 space-y-4">
        <a href="#hero" className="block w-3 h-3 rounded-full bg-primary"></a>
        <a href="#services" className="block w-3 h-3 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground transition-smooth"></a>
        <a href="#about" className="block w-3 h-3 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground transition-smooth"></a>
        <a href="#contact" className="block w-3 h-3 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground transition-smooth"></a>
      </div>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Placeholder for background image */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-6 text-[#C9A961]">
            YOWA INNOVATIONS
          </h1>
          <p className="text-xl md:text-2xl font-serif italic text-muted-foreground">
            Innovating Reality. Inspiring Impact.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Placeholder for background image */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 text-[#C9A961]">
            OUR SERVICES
          </h2>
          <p className="text-xl md:text-2xl font-serif italic text-muted-foreground mb-12 max-w-2xl mx-auto">
            Content creation that inspires transformation
          </p>
          <Link to="/blogs">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              DISCOVER
            </Button>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Placeholder for background image */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/70"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 text-[#C9A961]">
            WHO WE ARE
          </h2>
          <p className="text-xl md:text-2xl font-serif italic text-muted-foreground mb-12 max-w-3xl mx-auto">
            A creative agency reimagining the everyday through media, technology, and creativity
          </p>
          <Link to="/about">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              LEARN MORE
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Placeholder for background image */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-background"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 text-[#C9A961]">
            CONTACT
          </h2>
          <p className="text-xl md:text-2xl font-serif italic text-muted-foreground mb-12 max-w-2xl mx-auto">
            Let us work with you to create strategy that works
          </p>
          <Link to="/contact">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              GET IN TOUCH
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
