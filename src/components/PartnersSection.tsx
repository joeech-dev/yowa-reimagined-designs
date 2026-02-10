import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Fallback static data
import coslLogo from "@/assets/partners/cosl.png";
import fesLogo from "@/assets/partners/fes.png";
import uhcuLogo from "@/assets/partners/uhcu.png";
import makerereLogo from "@/assets/partners/makerere.png";
import swisscontactLogo from "@/assets/partners/swisscontact.png";
import ssaLogo from "@/assets/partners/ssa.jpg";
import uiLogo from "@/assets/partners/ui.jpg";

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
}

const staticPartners = [
  { name: "COSL", logo: coslLogo },
  { name: "Friedrich Ebert Stiftung", logo: fesLogo },
  { name: "Uganda Housing Cooperative Union", logo: uhcuLogo },
  { name: "Makerere University", logo: makerereLogo },
  { name: "Swisscontact", logo: swisscontactLogo },
  { name: "SSA Uganda", logo: ssaLogo },
  { name: "Urban Institute", logo: uiLogo },
];

const PartnersSection = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase
          .from("partner_brands")
          .select("id, name, logo_url, website_url")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        setPartners(data || []);
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Use database partners if available, otherwise fallback to static
  const displayPartners = partners.length > 0 
    ? partners.map(p => ({ name: p.name, logo: p.logo_url, website: p.website_url }))
    : staticPartners.map(p => ({ name: p.name, logo: p.logo, website: null }));

  // Scale animation duration with partner count (~3s per partner for smooth viewing)
  const animationDuration = Math.max(displayPartners.length * 3, 15);

  return (
    <section className="py-16 bg-muted/20 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="font-display font-bold text-3xl md:text-4xl mb-4 text-center">
          Trusted by Leading Organizations
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          We've partnered with renowned institutions and organizations to deliver impactful content
          that drives change.
        </p>
        <div className="relative overflow-hidden">
          {/* Two identical strips for seamless infinite loop */}
          <div
            className="flex w-fit"
            style={{
              animation: `marquee ${animationDuration}s linear infinite`,
            }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0">
                {displayPartners.map((partner, index) => (
                  <div
                    key={`${copy}-${partner.name}-${index}`}
                    className="flex-shrink-0 px-10 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-smooth"
                  >
                    {partner.website ? (
                      <a href={partner.website} target="_blank" rel="noopener noreferrer">
                        <img
                          src={partner.logo}
                          alt={`${partner.name} logo`}
                          className="h-16 w-auto object-contain"
                        />
                      </a>
                    ) : (
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className="h-16 w-auto object-contain"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
