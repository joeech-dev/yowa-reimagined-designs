import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/70"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-6 text-[#C9A961]">
            CONTACT
          </h1>
          <p className="text-xl md:text-2xl font-serif italic text-muted-foreground max-w-3xl mx-auto">
            Let us work with you to create online strategy that works
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-4xl font-bold mb-6 text-[#C9A961]">Send Us a Message</h2>
              <Card className="p-8 shadow-warm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Your Name
                    </label>
                    <Input id="name" placeholder="John Doe" required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <Input id="email" type="email" placeholder="john@example.com" required />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject
                    </label>
                    <Input id="subject" placeholder="How can we help?" required />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your project..."
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-warm" size="lg">
                    Send Message
                  </Button>
                </form>
              </Card>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-4xl font-bold mb-6 text-[#C9A961]">Get in Touch</h2>
              <div className="space-y-6">
                <Card className="p-6 hover:shadow-warm transition-smooth">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg gradient-warm flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-primary-foreground" size={24} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-xl mb-2">Address</h3>
                      <p className="text-muted-foreground">
                        5th Street Industrial Area
                        <br />
                        Kampala, Uganda
                      </p>
                      <a
                        href="https://www.google.com/maps/place/Swangz+Avenue+Ltd/@0.3218743,32.6031823,18z"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm mt-2 inline-block"
                      >
                        Get Directions →
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-warm transition-smooth">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg gradient-warm flex items-center justify-center flex-shrink-0">
                      <Phone className="text-primary-foreground" size={24} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-xl mb-2">Phone</h3>
                      <p className="text-muted-foreground mb-1">
                        Press Contact: +256 (0) 786155557
                      </p>
                      <p className="text-muted-foreground">
                        Booking Agent: +256 (0) 779180984
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-warm transition-smooth">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg gradient-warm flex items-center justify-center flex-shrink-0">
                      <Mail className="text-primary-foreground" size={24} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-xl mb-2">Email</h3>
                      <a
                        href="mailto:info@yowa.us"
                        className="text-muted-foreground hover:text-primary transition-smooth block"
                      >
                        info@yowa.us
                      </a>
                      <a
                        href="mailto:yowaaffiliatedigital@gmail.com"
                        className="text-muted-foreground hover:text-primary transition-smooth block"
                      >
                        yowaaffiliatedigital@gmail.com
                      </a>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
