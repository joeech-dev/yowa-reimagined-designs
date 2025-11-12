import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

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
          Don't just take our word for it—hear from the organizations we've empowered.
        </p>
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
