import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CareerApplicationForm } from "@/components/CareerApplicationForm";
import {
  MapPin,
  Briefcase,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const categoryLabel: Record<string, string> = {
  employment: "Full-Time",
  freelancing: "Freelance",
  trainee: "Trainee",
};

const categoryColor: Record<string, string> = {
  employment: "bg-primary/10 text-primary border-primary/20",
  freelancing: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  trainee: "bg-accent/20 text-accent-foreground border-accent/30",
};

const perks = [
  { icon: Zap, title: "Creative Freedom", desc: "Work on bold, impactful projects that tell real stories." },
  { icon: Users, title: "Collaborative Team", desc: "Join a passionate crew of creatives, strategists and storytellers." },
  { icon: Briefcase, title: "Grow Your Craft", desc: "Mentorship, exposure and hands-on experience in East Africa's media landscape." },
  { icon: CheckCircle, title: "Meaningful Work", desc: "Every project we take on has purpose — and you'll feel that daily." },
];

type JobPosting = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  requirements: string | null;
};

const Careers = () => {
  const [applyingTo, setApplyingTo] = useState<JobPosting | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [showGeneralForm, setShowGeneralForm] = useState(false);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["job_postings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as JobPosting[];
    },
  });

  const handleApply = (job: JobPosting) => {
    setApplyingTo(job);
    setShowGeneralForm(false);
    setTimeout(() => {
      document.getElementById("career-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleGeneralApply = () => {
    setApplyingTo(null);
    setShowGeneralForm(true);
    setTimeout(() => {
      document.getElementById("career-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Careers at Yowa Innovations | Join Our Creative Team"
        description="Join Yowa Innovations — a creative agency telling Africa's stories through video, photography and digital media. View open positions in Kampala, Uganda."
        keywords="jobs Yowa Innovations, creative agency careers Uganda, video production jobs Kampala, photography jobs Uganda"
        url="https://yowa.us/careers"
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-primary pt-28 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-secondary opacity-10 rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/40 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary text-sm font-semibold tracking-wide uppercase">We're Hiring</span>
          </div>
          <h1 className="text-primary-foreground text-4xl md:text-6xl font-display font-bold leading-tight max-w-3xl mb-4">
            Join Our <span className="text-secondary">Creative Team</span>
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl leading-relaxed mb-8">
            Be part of a team telling Africa's stories through world-class video, photography,
            and digital media — based in the heart of Kampala.
          </p>
          <Button
            onClick={handleGeneralApply}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-8 h-12 text-base rounded-xl"
          >
            Join Our Team <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Perks */}
      <section className="bg-muted py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-foreground text-2xl font-display font-bold mb-8 text-center">
            Why Work at Yowa?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-background rounded-xl border border-border p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-1">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="bg-background py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-foreground text-3xl font-display font-bold">Open Positions</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {isLoading ? "Loading..." : jobs.length === 0 ? "Check back soon for new openings." : `${jobs.length} position${jobs.length !== 1 ? "s" : ""} available`}
              </p>
            </div>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={handleGeneralApply}
            >
              General Application
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && jobs.length === 0 && (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-foreground font-display font-bold text-lg mb-2">No open positions right now</h3>
              <p className="text-muted-foreground text-sm mb-6">
                We're always looking for talented people. Send us a general application!
              </p>
              <Button onClick={handleGeneralApply} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Submit General Application
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {jobs.map((job) => {
              const isExpanded = expandedJob === job.id;
              return (
                <div
                  key={job.id}
                  className="bg-background border border-border rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
                >
                  {/* Job header */}
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${categoryColor[job.category] || categoryColor.employment}`}>
                          {categoryLabel[job.category] || job.category}
                        </span>
                        {job.location && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {job.location}
                          </span>
                        )}
                      </div>
                      <h3 className="text-foreground font-display font-bold text-lg">{job.title}</h3>
                      {job.description && (
                        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{job.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {(job.description || job.requirements) && (
                        <button
                          onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          {isExpanded ? "Less" : "More"}
                        </button>
                      )}
                      <Button
                        onClick={() => handleApply(job)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                        size="sm"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>

                  {/* Expandable details */}
                  {isExpanded && (job.description || job.requirements) && (
                    <div className="border-t border-border px-6 py-5 bg-muted/40 space-y-4">
                      {job.description && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">About this role</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
                        </div>
                      )}
                      {job.requirements && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Requirements</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{job.requirements}</p>
                        </div>
                      )}
                      <Button
                        onClick={() => handleApply(job)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl mt-2"
                        size="sm"
                      >
                        Apply for this position
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Application Form */}
      {(applyingTo || showGeneralForm) && (
        <section id="career-form" className="bg-muted py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-foreground text-2xl font-display font-bold">
                {applyingTo ? `Apply for: ${applyingTo.title}` : "General Application"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {applyingTo
                  ? `Submit your application for the ${categoryLabel[applyingTo.category] || applyingTo.category} position.`
                  : "Don't see a role that fits? Send us a general application and we'll keep you in mind."}
              </p>
            </div>
            <CareerApplicationForm
              jobTitle={applyingTo?.title}
              jobCategory={applyingTo?.category}
              onSuccess={() => {
                setApplyingTo(null);
                setShowGeneralForm(false);
              }}
            />
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Careers;
