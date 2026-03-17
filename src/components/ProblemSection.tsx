import { Link } from "react-router-dom";
import { AlertTriangle, Target, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

          {/* Column 3 — Opportunity */}
          <div className="flex flex-col">
            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mb-6">
              <Lightbulb className="text-accent-foreground" size={28} />
            </div>
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-5">
              Where Storytelling Creates Opportunity
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8 flex-1">
              <p>
                Every compelling story opens a door — to new funders, to wider audiences, to
                communities ready to engage. We harness narrative to unlock possibilities that
                data and reports alone cannot reach.
              </p>
              <p>
                By weaving together creative media, research evidence, and deep sector knowledge,
                we connect organisations with the people who need to hear their message most.
              </p>
              <p>
                The result is not just visibility — it is lasting influence, stronger partnerships,
                and meaningful change that speaks for itself.
              </p>
            </div>
            <Link to="/get-started">
              <Button size="lg" variant="outline" className="hover:scale-105 transition-smooth w-fit">
                Start Your Story
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
