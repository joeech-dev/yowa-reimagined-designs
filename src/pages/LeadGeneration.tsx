import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";

const LeadGeneration = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Get Started with Yowa Innovations | Free Consultation - Uganda Creative Agency"
        description="Start your project with Yowa Innovations. Get a free consultation for video production, photography, digital marketing & creative strategy in Uganda and East Africa."
        keywords="hire creative agency Uganda, video production quote Kampala, content creation consultation, digital marketing services East Africa"
        url="https://yowainnovations.com/get-started"
      />
      <Navbar />
      
      <main className="flex-1 bg-background">
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-primary mb-4">
                Let's Build Something Extraordinary
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Partner with Yowa Innovations for impactful storytelling, creative campaigns, 
                and digital media that speaks to hearts and minds.
              </p>
            </div>

            <div className="mb-16">
              <LeadCaptureForm />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center p-6">
                <div className="text-4xl font-bold text-primary mb-2">24h</div>
                <p className="text-muted-foreground">Response Time</p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl font-bold text-primary mb-2">100+</div>
                <p className="text-muted-foreground">Projects Delivered</p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <p className="text-muted-foreground">Client Satisfaction</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LeadGeneration;
