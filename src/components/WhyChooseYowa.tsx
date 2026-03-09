import { Link } from "react-router-dom";
import { Globe2, Film, FileSearch, Users, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const reasons = [
  {
    icon: Globe2,
    title: "Development Sector Understanding",
    text: "We understand the language of NGOs, donors, and development programmes, ensuring stories are accurate, ethical, and meaningful.",
  },
  {
    icon: Film,
    title: "Documentary-Level Storytelling",
    text: "Our approach goes beyond typical marketing videos. We produce documentary-style storytelling that captures real impact and human experiences.",
  },
  {
    icon: FileSearch,
    title: "Research-Driven Documentation",
    text: "Our storytelling is supported by research, interviews, and structured documentation that preserves institutional knowledge.",
  },
  {
    icon: Users,
    title: "Youth Empowerment Model",
    text: "Every project contributes to training and employing young creatives, creating opportunities while delivering professional storytelling services.",
  },
];

const WhyChooseYowa = () => {
  return (
    <section className="py-20 bg-muted/20" aria-labelledby="why-choose-heading">
      <div className="container mx-auto px-4">
        <h2
          id="why-choose-heading"
          className="font-display font-bold text-3xl md:text-4xl mb-4 text-center"
        >
          Why Organisations Choose Yowa
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          We combine sector expertise, ethical storytelling, and an integrated youth model to
          deliver impact communication that goes beyond conventional creative agencies.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <Card
                key={index}
                className="p-6 border-border hover:shadow-primary transition-smooth flex flex-col group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth flex-shrink-0">
                  <Icon className="text-primary-foreground" size={22} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-3">{reason.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{reason.text}</p>
              </Card>
            );
          })}
        </div>
        <div className="text-center">
          <Link to="/get-started">
            <Button size="lg" className="hover:scale-105 transition-smooth">
              Start a Project
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseYowa;
