import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, DollarSign, Users, Lightbulb, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ebookCover from "@/assets/ebook-cover.jpg";

const EBOOK_URL = "https://www.yowa.us/ordernow";

const chapters = [
  { icon: BookOpen, title: "Foundation", desc: "Understand why video is the most powerful tool for creatives today." },
  { icon: DollarSign, title: "Monetisation", desc: "Discover multiple revenue streams from corporate work to social media." },
  { icon: Users, title: "Client Acquisition", desc: "Learn how to find, pitch, and close high-paying clients." },
  { icon: Lightbulb, title: "Creative Strategy", desc: "Build a brand that attracts opportunities instead of chasing them." },
];

const benefits = [
  "Turn your video skills into a sustainable income",
  "Find and win clients without cold-calling",
  "Price your services with confidence",
  "Build a portfolio that sells itself",
  "Scale from freelancer to agency owner",
  "Navigate the African creative economy",
];

const Ebook = () => (
  <div className="min-h-screen">
    <SEO
      title="Video Cash for Creatives – eBook | Yowa Innovations"
      description="A practical digital guide to monetising your video production skills. Learn how to find clients, price your work, and build a sustainable creative business."
      url="https://yowa.us/ebook"
    />
    <Navbar />

    <main>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <span className="inline-block bg-secondary text-secondary-foreground text-sm font-bold px-3 py-1 rounded-full mb-4">
                Digital Book
              </span>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
                Video Cash<br />for Creatives
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed max-w-lg">
                A no-fluff, practical guide for African creatives who want to turn video production skills into real income. From landing your first paying client to scaling a full creative business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={EBOOK_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg hover:scale-105 transition-smooth">
                    Get Your Copy
                    <ArrowRight className="ml-2" />
                  </Button>
                </a>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img
                src={ebookCover}
                alt="Video Cash for Creatives eBook cover"
                className="w-72 md:w-80 lg:w-96 rounded-lg shadow-2xl hover:scale-105 transition-smooth"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4 text-center">
            What's Inside
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Packed with actionable strategies, real-world examples, and frameworks you can apply immediately.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {chapters.map((ch, i) => {
              const Icon = ch.icon;
              return (
                <Card key={i} className="p-6 text-center hover:shadow-primary transition-smooth group">
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-smooth">
                    <Icon className="text-primary-foreground" size={24} />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{ch.title}</h3>
                  <p className="text-muted-foreground text-sm">{ch.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-8">
                After reading this book, you will…
              </h2>
              <ul className="space-y-4">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-0.5 shrink-0" size={20} />
                    <span className="text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <img
                src={ebookCover}
                alt="Video Cash for Creatives"
                className="w-64 rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Ready to Start Earning from Your Creativity?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Get instant access to the strategies that have helped creatives across Africa build profitable video businesses.
          </p>
          <a href={EBOOK_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="secondary" className="hover:scale-105 transition-smooth text-lg">
              Get Your Copy Now
              <ArrowRight className="ml-2" />
            </Button>
          </a>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default Ebook;
