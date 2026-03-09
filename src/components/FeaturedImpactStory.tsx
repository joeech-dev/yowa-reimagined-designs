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
          <div className="rounded-xl overflow-hidden shadow-lg aspect-video bg-muted relative group cursor-pointer">
            <iframe
              src="https://www.youtube.com/embed/videoseries?list=PLQ1IuNyXlNaGdLXI8BHd-hqLhTGHVKHCo"
              title="Yowa Innovations — Featured Impact Story"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col justify-center space-y-5">
            <h3 className="font-display font-bold text-2xl md:text-3xl">
              Documenting Community Impact Through Storytelling
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Yowa Innovations partnered with development organisations to document real stories
              from communities benefiting from social programmes. Through documentary filmmaking and
              photography, we captured authentic voices, programme outcomes, and powerful narratives
              that strengthened stakeholder engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/portfolio">
                <Button size="lg" className="hover:scale-105 transition-smooth">
                  <Play className="mr-2 h-4 w-4" />
                  Watch the Story
                </Button>
              </Link>
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
