import { AlertTriangle } from "lucide-react";

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
          <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
            <p>
              Many NGOs and social impact organisations implement powerful projects, yet their
              impact often remains invisible. Stories are buried in technical reports, poorly
              documented, or inconsistently shared—limiting funding opportunities, public trust,
              and policy influence.
            </p>
            <p>
              At the same time, talented young creatives struggle to access real work opportunities
              that allow them to build sustainable careers.
            </p>
            <p className="font-semibold text-foreground text-xl">
              Yowa Innovations exists to solve both challenges.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
