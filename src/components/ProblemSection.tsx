import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProblemSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-destructive" size={32} />
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">
            Great Work Deserves to Be Seen
          </h2>
          <div className="space-y-4 text-muted-foreground text-lg leading-relaxed mb-8">
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
            <p className="font-semibold text-foreground text-xl">
              Yowa Innovations exists to solve both challenges.
            </p>
          </div>
          <Link to="/about">
            <Button size="lg" variant="outline" className="hover:scale-105 transition-smooth">
              Learn About Our Approach
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
