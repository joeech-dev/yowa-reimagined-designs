import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-6 text-[#C9A961]">
            ABOUT US
          </h1>
          <p className="text-xl md:text-2xl font-serif italic text-muted-foreground max-w-3xl mx-auto">
            Where creativity meets technology
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-16">
            {/* Who We Are */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#C9A961]">Who We Are</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  We are relentless in moving boundaries and carry out this spirited attitude into digital solutions. 
                  Digital solutions that engage, inspire and make you think. Make you curious.
                </p>
                <p>
                  Yowa Innovations is a Ugandan creative company founded on one big idea: <strong className="text-foreground">to innovate reality</strong>. 
                  We believe storytelling can inspire change, technology can unlock opportunity, and creativity can shape a better tomorrow.
                </p>
                <p>
                  Our team is a passionate blend of <strong className="text-foreground">filmmakers, digital creatives, strategists, 
                  researchers, environmentalists, and agriculturists</strong>. We work at the intersection of media, innovation, 
                  sustainability, and everyday life—telling stories that matter, from the grassroots to the global stage.
                </p>
              </div>
            </div>

            {/* Our Process */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-8 text-center hover:shadow-warm transition-smooth">
                <div className="text-5xl font-bold text-[#C9A961] mb-4">01</div>
                <h3 className="text-2xl font-bold mb-3">LISTEN</h3>
                <p className="text-muted-foreground">
                  We begin by understanding your vision, challenges, and the stories you want to tell.
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-warm transition-smooth">
                <div className="text-5xl font-bold text-[#C9A961] mb-4">02</div>
                <h3 className="text-2xl font-bold mb-3">LEARN</h3>
                <p className="text-muted-foreground">
                  We immerse ourselves in your world to create authentic, impactful content.
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-warm transition-smooth">
                <div className="text-5xl font-bold text-[#C9A961] mb-4">03</div>
                <h3 className="text-2xl font-bold mb-3">INNOVATE</h3>
                <p className="text-muted-foreground">
                  We bring your story to life with creativity, technology, and purpose.
                </p>
              </Card>
            </div>

            {/* Mission */}
            <div className="bg-muted/30 p-12 rounded-lg">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center text-[#C9A961]">Our Mission</h2>
              <p className="text-xl text-center text-foreground leading-relaxed">
                To inspire and drive meaningful change by creating media and content that reflects, 
                questions, and transforms the realities we live in.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-[#C9A961] mb-2">87</div>
                <div className="text-sm uppercase tracking-wider text-muted-foreground">Clients</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-[#C9A961] mb-2">25</div>
                <div className="text-sm uppercase tracking-wider text-muted-foreground">Awards</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-[#C9A961] mb-2">64</div>
                <div className="text-sm uppercase tracking-wider text-muted-foreground">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-[#C9A961] mb-2">846</div>
                <div className="text-sm uppercase tracking-wider text-muted-foreground">Connections</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
