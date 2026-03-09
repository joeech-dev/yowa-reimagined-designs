import { Card } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";
import fesLogo from "@/assets/partners/fes.png";

const featuredTestimonial = {
  quote:
    "Can I say that this is the most well shot and best told documentaries I have seen from the region in a very long time. The cinematography is just beautiful, the images crisp and audio perfectly recorded. And it's interesting to watch from beginning to end!",
  author: "FES Communications Team, Berlin",
  relay: "Forwarded by Geraldine Kabaami",
  relayRole: "Operations Manager, FES Uganda",
};

const testimonials = [
  {
    quote:
      "Yowa Innovations transformed our documentary vision into a powerful narrative that resonated with audiences across Uganda. Their professionalism and creativity are unmatched.",
    author: "Dr. Sarah Nakato",
    role: "Program Director, Urban Development Initiative",
  },
  {
    quote:
      "Working with Yowa has been a game-changer for our digital presence. Their strategic approach to content creation helped us reach thousands of new stakeholders.",
    author: "James Okello",
    role: "Communications Lead, Agricultural Cooperative",
  },
  {
    quote:
      "The team at Yowa Innovations doesn't just create content—they craft stories that inspire action. Their work on our environmental campaign exceeded all expectations.",
    author: "Maria Ssebunya",
    role: "Executive Director, Environmental NGO",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <h2 className="font-display font-bold text-3xl md:text-4xl mb-4 text-center">
          What Our Clients Say
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Don't just take our word for it—hear from the organisations we've empowered.
        </p>

        {/* Featured Testimonial — FES Berlin */}
        <div className="max-w-4xl mx-auto mb-14">
          <Card className="relative p-10 md:p-14 border-2 border-primary/30 bg-primary/5 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <img src={fesLogo} alt="FES Logo" className="h-8 object-contain opacity-90" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-primary text-primary" />
                ))}
              </div>
            </div>
            <Quote className="text-primary mb-4 opacity-60" size={42} />
            <p className="text-foreground text-xl md:text-2xl font-display leading-relaxed italic mb-8">
              "{featuredTestimonial.quote}"
            </p>
            <div className="border-t border-primary/20 pt-5">
              <p className="font-bold text-primary text-base">{featuredTestimonial.author}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {featuredTestimonial.relay} — <span className="font-medium">{featuredTestimonial.relayRole}</span>
              </p>
            </div>
          </Card>
        </div>

        {/* Other Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-8 hover:shadow-warm transition-smooth border-border">
              <Quote className="text-primary mb-4" size={32} />
              <p className="text-muted-foreground mb-6 leading-relaxed italic">
                "{testimonial.quote}"
              </p>
              <div>
                <p className="font-semibold text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
