import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Target, Heart, Users, Sparkles, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BoardMember {
  full_name: string | null;
  position: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  team_board_order: number;
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const About = () => {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    const fetchBoardMembers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, position, avatar_url, linkedin_url, team_board_order")
        .eq("show_on_team_board", true)
        .order("team_board_order", { ascending: true });
      setBoardMembers((data as BoardMember[]) || []);
      setLoadingTeam(false);
    };
    fetchBoardMembers();
  }, []);

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
      <SEO
        title="About Yowa Innovations | Creative Agency Uganda - Our Story & Mission"
        description="Discover Yowa Innovations, Uganda's leading creative agency. We use media, technology & creativity to drive change in agriculture, environment & education. 50+ projects delivered."
        keywords="about yowa innovations, creative agency Uganda, media production company Kampala, social impact storytelling, documentary filmmaking East Africa, content creation team"
        url="https://yowa.us/about"
      />
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

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-12 text-center">
              Meet Our Team
            </h2>
            {loadingTeam ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : boardMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {boardMembers.map((member, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-warm transition-smooth group">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden flex items-center justify-center">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.full_name || "Team member"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                        />
                      ) : (
                        <Avatar className="h-32 w-32">
                          <AvatarFallback className="text-3xl">
                            {getInitials(member.full_name || "?")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="font-display font-semibold text-lg mb-1">{member.full_name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{member.position}</p>
                      {member.linkedin_url && (
                        <Button variant="outline" size="sm" asChild className="gap-2">
                          <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Team information coming soon.</p>
            )}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/team">Meet Our Supporting Team</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
