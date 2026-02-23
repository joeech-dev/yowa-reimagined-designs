import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import ebookCover from "@/assets/ebook-cover.jpg";

const EBOOK_URL = "https://www.yowa.us/ordernow";

const Ebook = () => (
  <div className="min-h-screen">
    <SEO
      title="Video Cash for Creatives – eBook | Yowa Innovations"
      description="A practical digital guide to monetising your video production skills. Learn how to find clients, price your work, and build a sustainable creative business."
      url="https://yowa.us/ebook"
    />
    <Navbar />

    <main className="pt-28 pb-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          {/* Cover */}
          <img
            src={ebookCover}
            alt="Video Cash for Creatives eBook cover"
            className="w-64 md:w-80 rounded-lg shadow-primary mb-10"
          />

          {/* Copy */}
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4 leading-tight">
            Video Cash for Creatives
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md">
            A practical guide to turning your video production skills into real income. Find clients, price your work, and build a sustainable creative business.
          </p>

          {/* CTA */}
          <a href={EBOOK_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="text-lg hover:scale-105 transition-smooth">
              Get Your Copy
              <ArrowRight className="ml-2" />
            </Button>
          </a>
        </div>
      </div>
    </main>

    <Footer />
  </div>
);

export default Ebook;
