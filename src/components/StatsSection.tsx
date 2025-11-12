import { Card } from "@/components/ui/card";
import { Award, Users, Video, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Video,
    value: "50+",
    label: "Projects Delivered",
    description: "Documentaries, campaigns, and creative content",
  },
  {
    icon: Users,
    value: "30+",
    label: "Partner Organizations",
    description: "NGOs, corporates, and startups across East Africa",
  },
  {
    icon: Award,
    value: "5+",
    label: "Years Experience",
    description: "Driving impact through visual storytelling",
  },
  {
    icon: TrendingUp,
    value: "100K+",
    label: "Audience Reached",
    description: "Through our digital campaigns and content",
  },
];

const StatsSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="font-display font-bold text-3xl md:text-4xl mb-4 text-center">
          Impact by the Numbers
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Our track record speaks for itself—measurable results that matter.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="p-8 text-center hover:shadow-warm transition-smooth border-border group"
              >
                <div className="w-16 h-16 rounded-full gradient-warm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-smooth">
                  <Icon className="text-primary-foreground" size={32} />
                </div>
                <div className="font-display font-bold text-4xl mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="font-semibold text-lg mb-2">{stat.label}</div>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
