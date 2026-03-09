import { Link } from "react-router-dom";
import { Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FeaturedImpactStory = () => {
  return (
    <section className="py-20" aria-labelledby="featured-story-heading">
      <div className="container mx-auto px-4">
        <h2
          id="featured-story-heading"
          className="font-display font-bold text-3xl md:text-4xl mb-4 text-center"
        >
          Featured Impact Story
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          See how storytelling can transform development work into powerful narratives that inspire
          action, strengthen visibility, and document impact.
        </p>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Video Embed */}
          <div className="rounded-xl overflow-hidden shadow-lg aspect-video bg-muted">
            <iframe
              src="https://www.youtube-nocookie.com/embed/d3WQQw6R3IY"
              title="Wakisa Ministry — Featured Impact Story"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col justify-center space-y-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Client: Wakisa Ministry
            </span>
            <h3 className="font-display font-bold text-2xl md:text-3xl">
              Heartfelt Storytelling for Transformative Work
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Yowa Innovations partnered with Wakisa Ministry to document the heartfelt and
              transformative work they do for vulnerable young women in Uganda. Through documentary
              filmmaking, we captured authentic voices, real programme outcomes, and compelling
              narratives that strengthen stakeholder trust and donor communication.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://www.youtube.com/watch?v=d3WQQw6R3IY"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="hover:scale-105 transition-smooth">
                  <Play className="mr-2 h-4 w-4" />
                  Watch the Story
                </Button>
              </a>
              <Link to="/portfolio">
                <Button size="lg" variant="outline" className="hover:scale-105 transition-smooth">
                  View More Projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedImpactStory;
