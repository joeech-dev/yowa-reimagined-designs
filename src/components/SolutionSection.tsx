import { Target } from "lucide-react";

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
          <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
            <p>
              Yowa Innovations provides professional documentary filmmaking, photography, and
              digital storytelling services tailored for NGOs, social enterprises, and development
              institutions.
            </p>
            <p>
              We translate complex development work into clear, credible narratives that strengthen
              donor confidence, improve visibility, amplify community voices, and support advocacy
              and policy engagement.
            </p>
            <p>
              Our work is grounded in ethics, accuracy, and a deep understanding of development
              contexts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
