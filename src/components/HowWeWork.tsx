import { Link } from "react-router-dom";
import { Search, FileText, Camera, Scissors, Megaphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Understanding the Programme",
    text: "We begin by learning about your organisation, programme goals, stakeholders, and communities involved. This helps us identify the most meaningful stories and ensure alignment with your communication objectives.",
  },
  {
    icon: FileText,
    step: "02",
    title: "Research & Story Development",
    text: "Our team conducts interviews, background research, and story mapping to ensure the narrative reflects real programme impact while maintaining ethical storytelling practices.",
  },
  {
    icon: Camera,
    step: "03",
    title: "Field Production",
    text: "We capture documentary footage, photography, and interviews directly within programme communities while maintaining respect, consent, and cultural sensitivity.",
  },
  {
    icon: Scissors,
    step: "04",
    title: "Story Crafting & Editing",
    text: "Our editors transform raw documentation into powerful visual narratives that communicate impact clearly for donors, stakeholders, and the public.",
  },
  {
    icon: Megaphone,
    step: "05",
    title: "Distribution & Visibility",
    text: "We help organisations use their stories strategically across reports, social media, campaigns, and presentations to maximise visibility and engagement.",
  },
];

const HowWeWork = () => {
  return (
    <section className="py-20" aria-labelledby="how-we-work-heading">
      <div className="container mx-auto px-4">
        <h2
          id="how-we-work-heading"
          className="font-display font-bold text-3xl md:text-4xl mb-4 text-center"
        >
          How We Work
        </h2>
        <p className="text-center text-muted-foreground mb-14 max-w-2xl mx-auto">
          Our storytelling process is designed specifically for NGOs, social enterprises, and
          development organisations. We combine research, ethical storytelling, and professional
          production to ensure every story accurately reflects programme impact and community
          voices.
        </p>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical connector line */}
          <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-border hidden md:block" />

          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex gap-6 group">
                  {/* Step icon */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center z-10 relative group-hover:scale-110 transition-smooth shadow-md">
                      <Icon className="text-primary-foreground" size={24} />
                    </div>
                  </div>
                  {/* Step content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Step {step.step}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-xl mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/get-started">
            <Button size="lg" className="hover:scale-105 transition-smooth">
              Start a Project With Us
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
