import { Link } from "react-router-dom";
import { Sparkles, BookOpen, Briefcase, DollarSign, Eye, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
            Where Storytelling Creates Opportunity
          </h2>
          <div className="space-y-4 text-muted-foreground text-lg leading-relaxed mb-10">
            <p>
              What makes Yowa Innovations unique is our integrated youth empowerment model.
            </p>
            <p>
              We embed training, mentorship, and paid project opportunities for young creatives
              directly into our service delivery. Through project-based learning, young people gain
              practical skills in photography and visual storytelling while working on real
              assignments with NGOs and development organisations.
            </p>
            <p>
              This approach ensures organisations receive professional storytelling services while
              contributing to youth employment and skills development.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-10">
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
          <Link to="/about">
            <Button size="lg" variant="outline" className="hover:scale-105 transition-smooth">
              Learn About Youth Training
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OurModelSection;
