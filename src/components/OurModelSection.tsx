import { Sparkles, BookOpen, Briefcase, DollarSign, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";

const highlights = [
  { icon: BookOpen, label: "Project-based training" },
  { icon: Briefcase, label: "Real clients and real briefs" },
  { icon: DollarSign, label: "Paid opportunities" },
  { icon: Eye, label: "Professional exposure" },
];

const OurModelSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-accent-foreground" size={32} />
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">
            Where Storytelling Creates Jobs
          </h2>
          <div className="space-y-4 text-muted-foreground text-lg leading-relaxed mb-10">
            <p>
              What makes Yowa Innovations different is our integrated youth empowerment model.
            </p>
            <p>
              We embed training, mentorship, and paid project opportunities for young creatives
              directly into our service delivery. Through structured, project-based learning, young
              people gain practical skills in photography and visual storytelling while working on
              real NGO assignments.
            </p>
            <p>
              Each year, we train and engage young creatives, creating a sustainable pipeline of
              skilled professionals and contributing to youth employment in the creative sector.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="p-5 flex items-center gap-4 border-border hover:shadow-warm transition-smooth"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <Icon className="text-primary-foreground" size={20} />
                  </div>
                  <span className="font-semibold text-left">{item.label}</span>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurModelSection;
