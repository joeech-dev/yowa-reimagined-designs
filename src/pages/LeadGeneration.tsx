import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { CheckCircle, Clock, Star, ArrowRight } from "lucide-react";

const stats = [
  { value: "24h", label: "Response Time", icon: Clock },
  { value: "100+", label: "Projects Delivered", icon: Star },
  { value: "98%", label: "Client Satisfaction", icon: CheckCircle },
];

const benefits = [
  "Free initial consultation with our creative team",
  "Custom proposals tailored to your goals",
  "Transparent pricing, no hidden costs",
  "Dedicated project manager assigned to you",
  "Ongoing support after delivery",
];

const LeadGeneration = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Get Started with Yowa Innovations | Free Consultation - Uganda Creative Agency"
        description="Start your project with Yowa Innovations. Get a free consultation for video production, photography, digital marketing & creative strategy in Uganda and East Africa."
        keywords="hire creative agency Uganda, video production quote Kampala, content creation consultation, digital marketing services East Africa"
        url="https://yowa.us/get-started"
      />
      <Navbar />

      <main className="flex-1">
        {/* Hero banner */}
        <section className="bg-primary pt-28 pb-16 px-6 relative overflow-hidden">
          {/* Decorative accent block */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-secondary opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary opacity-10 rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <div className="max-w-7xl mx-auto relative">
            <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/40 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-secondary text-sm font-semibold tracking-wide uppercase">
                Start Your Project
              </span>
            </div>
            <h1 className="text-primary-foreground text-4xl md:text-6xl font-display font-bold leading-tight max-w-3xl mb-4">
              Let's Build Something <span className="text-secondary">Extraordinary</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl leading-relaxed">
              Partner with Yowa Innovations for impactful storytelling, creative campaigns,
              and digital media that speaks to hearts and minds across Uganda and East Africa.
            </p>
          </div>
        </section>

        {/* Stats bar */}
        <div className="bg-secondary">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-6 justify-around">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-secondary-foreground/70" />
                <span className="text-2xl font-display font-bold text-secondary-foreground">{value}</span>
                <span className="text-secondary-foreground/70 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main content: two-column layout */}
        <section className="bg-muted py-16 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: benefits */}
            <div>
              <h2 className="text-foreground text-3xl font-display font-bold mb-3">
                Why Work With Us?
              </h2>
              <p className="text-muted-foreground mb-8 text-base leading-relaxed">
                We're more than an agency — we're your creative partner committed to making your vision come to life with precision and passion.
              </p>

              <ul className="space-y-4 mb-10">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/80 text-sm">{b}</span>
                  </li>
                ))}
              </ul>

              {/* Testimonial pull-quote */}
              <div className="border-l-4 border-primary pl-5 py-2">
                <p className="text-foreground/70 italic text-sm leading-relaxed mb-3">
                  "Yowa transformed our brand presence in East Africa. The results were beyond our expectations."
                </p>
                <p className="text-primary font-semibold text-sm">— Past Client, Kampala</p>
              </div>

              {/* Services quick list */}
              <div className="mt-10 grid grid-cols-2 gap-3">
                {[
                  "Video Production",
                  "Photography",
                  "Digital Marketing",
                  "Creative Strategy",
                  "Post Production",
                  "Photowalk",
                ].map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80"
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: form */}
            <div>
              <LeadCaptureForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LeadGeneration;
