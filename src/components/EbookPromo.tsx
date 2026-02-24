import { ArrowRight, BookOpen, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ebookCover from "@/assets/ebook-cover.jpg";

interface EbookPromoProps {
  variant?: "banner" | "compact";
}

const EbookPromo = ({ variant = "banner" }: EbookPromoProps) => {
  if (variant === "compact") {
    return (
      <div className="bg-foreground rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 my-8">
        <img src={ebookCover} alt="Creative Resources" className="w-20 rounded-md shadow-lg shrink-0" />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-primary-foreground font-display font-bold text-lg">Creative Resources</p>
          <p className="text-primary-foreground/70 text-sm">eBooks, videos, photos & more.</p>
        </div>
        <Link to="/shop">
          <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 whitespace-nowrap">
            Visit Shop
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <section className="py-16 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <img
            src={ebookCover}
            alt="Video Cash for Creatives eBook"
            className="w-48 md:w-56 rounded-lg shadow-2xl hover:scale-105 transition-smooth shrink-0"
          />
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
              <ShoppingBag className="text-secondary" size={20} />
              <span className="text-secondary font-bold text-sm uppercase tracking-wider">Shop</span>
            </div>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-primary-foreground mb-3">
              Creative Resources & Products
            </h2>
            <p className="text-primary-foreground/70 mb-6 max-w-lg">
              Browse our collection of eBooks, videos, photos, and film scripts — tools to help you grow as a creative professional.
            </p>
            <Link to="/shop">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:scale-105 transition-smooth">
                Visit Shop
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EbookPromo;
