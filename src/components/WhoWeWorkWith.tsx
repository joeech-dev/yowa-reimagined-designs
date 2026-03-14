import { Link } from "react-router-dom";
import { Building2, Heart, Lightbulb, Landmark, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ssaLogo from "@/assets/partners/ssa.jpg";
import fesLogo from "@/assets/partners/fes.png";
import coslLogo from "@/assets/partners/cosl.png";

const sectors = [
  {
    icon: Heart,
    title: "NGOs & Development Organisations",
    text: "Documentary storytelling, impact documentation, and programme visibility for NGOs implementing social change initiatives.",
    exampleLogo: ssaLogo,
    exampleName: "SSA",
    exampleType: "logo",
  },
  {
    icon: Landmark,
    title: "Foundations & Donor Agencies",
    text: "Documentary films and visual documentation that capture programme outcomes and strengthen donor communication.",
    exampleLogo: fesLogo,
    exampleName: "FES",
    exampleType: "logo",
  },
  {
    icon: Lightbulb,
    title: "Social Enterprises",
    text: "Strategic storytelling and digital communication to help social enterprises communicate their mission and reach wider audiences.",
    exampleLogo: "https://opekwztldtrylagmupoo.supabase.co/storage/v1/object/public/partner-logos/1773437493973-l0wg1jf0wgr.png",
    exampleName: "Asaak",
    exampleType: "logo",
  },
  {
    icon: Building2,
    title: "Institutions & Cooperatives",
    text: "Research publications, documentary films, and communication support that document institutional impact and legacy.",
    exampleLogo: coslLogo,
    exampleName: "COSL",
    exampleType: "logo",
  },
];

const WhoWeWorkWith = () => {
  return (
    <section className="py-20 bg-muted/20" aria-labelledby="who-we-work-with-heading">
      <div className="container mx-auto px-4">
        <h2
          id="who-we-work-with-heading"
          className="font-display font-bold text-3xl md:text-4xl mb-4 text-center"
        >
          Who We Work With
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Yowa Innovations works with organisations that are creating meaningful social impact but
          need stronger documentation, storytelling, and visibility.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {sectors.map((sector, index) => {
            const Icon = sector.icon;
            return (
              <Card
                key={index}
                className="p-6 border-border hover:shadow-primary transition-smooth flex flex-col group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth flex-shrink-0">
                  <Icon className="text-primary-foreground" size={22} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-3">{sector.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{sector.text}</p>
                <div className="mt-auto pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Example client</p>
                  {sector.exampleType === "logo" && sector.exampleLogo ? (
                    <img
                      src={sector.exampleLogo}
                      alt={sector.exampleName}
                      className="h-7 object-contain object-left grayscale opacity-70 group-hover:opacity-100 group-hover:grayscale-0 transition-smooth"
                    />
                  ) : (
                    <span className="inline-block text-xs font-semibold tracking-wide px-2 py-1 rounded bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-smooth">
                      {sector.exampleName}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
        <div className="text-center">
          <Link to="/contact">
            <Button size="lg" className="hover:scale-105 transition-smooth">
              Discuss Your Project
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhoWeWorkWith;
