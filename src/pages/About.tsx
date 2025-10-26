import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Target, Heart, Users, Sparkles } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Purpose-Driven Creativity",
      description: "Every project we undertake is guided by meaningful impact and intentional storytelling.",
    },
    {
      icon: Users,
      title: "Community-Focused Innovation",
      description: "We innovate with communities at the center, ensuring our work serves real people and real needs.",
    },
    {
      icon: Heart,
      title: "Authentic Storytelling",
      description: "We tell stories that are genuine, honest, and rooted in the lived experiences of those we serve.",
    },
    {
      icon: Sparkles,
      title: "Sustainable Thinking",
      description: "Our approach considers long-term impact on the environment and communities we work with.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">About Us</h1>
            <p className="text-xl text-muted-foreground">
              Discover the story behind Yowa Innovations and our mission to inspire change through
              creativity.
            </p>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">Who We Are</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Yowa Innovations is a Ugandan creative company founded on one big idea:{" "}
                <strong className="text-foreground">to innovate reality</strong>. We believe
                storytelling can inspire change, technology can unlock opportunity, and creativity
                can shape a better tomorrow.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our team is a passionate blend of <strong className="text-foreground">filmmakers,
                digital creatives, strategists, researchers, environmentalists, and
                agriculturists</strong>. We work at the intersection of{" "}
                <strong className="text-foreground">media, innovation, sustainability, and everyday
                life</strong>—telling stories that matter, from the grassroots to the global stage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">Our Mission</h2>
            <Card className="p-8 shadow-warm">
              <p className="text-xl text-foreground leading-relaxed">
                To inspire and drive meaningful change by creating media and content that reflects,
                questions, and transforms the realities we live in.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-12 text-center">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card
                    key={index}
                    className="p-8 hover:shadow-warm transition-smooth border-border group"
                  >
                    <div className="w-14 h-14 rounded-lg gradient-warm flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth">
                      <Icon className="text-primary-foreground" size={28} />
                    </div>
                    <h3 className="font-display font-semibold text-2xl mb-3">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Collaborative Spirit */}
      <section className="py-20 gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">
              Collaborative Spirit
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We believe in the power of partnership. Whether working with NGOs, corporate brands,
              or startups, we bring together diverse perspectives to create solutions that are
              greater than the sum of their parts. Together, we build something extraordinary.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
