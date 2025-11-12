import coslLogo from "@/assets/partners/cosl.png";
import fesLogo from "@/assets/partners/fes.png";
import uhcuLogo from "@/assets/partners/uhcu.png";
import makerereLogo from "@/assets/partners/makerere.png";
import swisscontactLogo from "@/assets/partners/swisscontact.png";
import ssaLogo from "@/assets/partners/ssa.jpg";
import uiLogo from "@/assets/partners/ui.jpg";

const partners = [
  { name: "COSL", logo: coslLogo },
  { name: "Friedrich Ebert Stiftung", logo: fesLogo },
  { name: "Uganda Housing Cooperative Union", logo: uhcuLogo },
  { name: "Makerere University", logo: makerereLogo },
  { name: "Swisscontact", logo: swisscontactLogo },
  { name: "SSA Uganda", logo: ssaLogo },
  { name: "Urban Institute", logo: uiLogo },
];

const PartnersSection = () => {
  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <h2 className="font-display font-bold text-3xl md:text-4xl mb-4 text-center">
          Trusted by Leading Organizations
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          We've partnered with renowned institutions and organizations to deliver impactful content
          that drives change.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-center">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center p-6 transition-smooth hover:scale-105 grayscale hover:grayscale-0 opacity-70 hover:opacity-100"
            >
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                className="max-h-20 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
