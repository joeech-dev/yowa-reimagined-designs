import { Link } from "react-router-dom";
import { AlertTriangle, Target, Sparkles, BookOpen, Briefcase, DollarSign, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const modelHighlights = [
  { icon: BookOpen, label: "Project-based training" },
  { icon: Briefcase, label: "Real clients and real briefs" },
  { icon: DollarSign, label: "Paid opportunities" },
  { icon: Eye, label: "Professional exposure" },
];

const ProblemSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">

          {/* Column 1 — Problem */}
          <div className="flex flex-col">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <AlertTriangle className="text-destructive" size={28} />
            </div>
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-5">
              Great Work Deserves to Be Seen
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8 flex-1">
              <p>
                Across Africa, NGOs and social impact organisations are implementing powerful
                programmes that transform lives. Yet much of this impact remains hidden inside
                technical reports or poorly documented materials.
              </p>
              <p>
                When stories are not clearly communicated, organisations lose opportunities to build
                trust, influence policy, and attract funding.
              </p>
              <p>
                At the same time, many talented young creatives struggle to access real opportunities
                that allow them to develop sustainable careers.
              </p>
              <p className="font-semibold text-foreground">
                Yowa Innovations exists to solve both challenges.
              </p>
            </div>
            <Link to="/about">
              <Button size="lg" variant="outline" className="hover:scale-105 transition-smooth w-fit">
                Learn About Our Approach
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>

          {/* Column 2 — Solution */}
          <div className="flex flex-col">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Target className="text-primary" size={28} />
            </div>
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-5">
              Impact Communication That Builds Capacity
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8 flex-1">
              <p>
                Yowa Innovations provides documentary filmmaking, photography, and strategic
                storytelling services tailored for NGOs, social enterprises, and development
                institutions.
              </p>
              <p>
                We translate complex programmes into clear and credible narratives that strengthen
                donor confidence, amplify community voices, and support advocacy.
              </p>
              <p>
                Our work is grounded in ethical storytelling, research-driven documentation, and deep
                understanding of development contexts.
              </p>
            </div>
            <Link to="/portfolio">
              <Button size="lg" className="hover:scale-105 transition-smooth w-fit">
                Explore Documentary Projects
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>

          {/* Column 3 — Where Storytelling Creates Opportunity */}
          <div className="flex flex-col">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <Sparkles className="text-accent-foreground" size={28} />
            </div>
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-5">
              Where Storytelling Creates Opportunity
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-6 flex-1">
              <p>What makes Yowa Innovations unique is our integrated youth empowerment model.</p>
              <p>
                We embed training, mentorship, and paid project opportunities for young creatives
                directly into our service delivery. Through project-based learning, young people gain
                practical skills while working on real assignments with NGOs and development organisations.
              </p>
              <p>
                This approach ensures organisations receive professional storytelling services while
                contributing to youth employment and skills development.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {modelHighlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card key={index} className="p-3 flex items-center gap-3 border-border hover:shadow-warm transition-smooth">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="text-primary-foreground" size={16} />
                    </div>
                    <span className="font-semibold text-xs leading-tight">{item.label}</span>
                  </Card>
                );
              })}
            </div>
            <Link to="/about">
              <Button size="lg" variant="outline" className="hover:scale-105 transition-smooth w-fit">
                Learn About Youth Training
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
