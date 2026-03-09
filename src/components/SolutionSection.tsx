import { Link } from "react-router-dom";
import { Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SolutionSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Target className="text-primary" size={32} />
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">
            Impact Communication That Builds Capacity
          </h2>
          <div className="space-y-4 text-muted-foreground text-lg leading-relaxed mb-8">
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
            <Button size="lg" className="hover:scale-105 transition-smooth">
              Explore Documentary Projects
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
