import { useEffect, useRef } from "react";
import { X, User, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import YouTubeSubscribePrompt from "@/components/YouTubeSubscribePrompt";

interface PortfolioProject {
  id: string;
  title: string;
  description: string | null;
  category: string;
  video_url: string;
  client: string | null;
  year: string | null;
}

interface ProjectDetailModalProps {
  project: PortfolioProject;
  onClose: () => void;
  triggerRect: DOMRect | null;
}

const getEmbedUrl = (url: string) => {
  let embedUrl = url;
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
  if (watchMatch) {
    embedUrl = `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  embedUrl = embedUrl.replace('www.youtube.com/embed', 'www.youtube-nocookie.com/embed');
  embedUrl = embedUrl.replace('youtube.com/embed', 'www.youtube-nocookie.com/embed');
  const separator = embedUrl.includes('?') ? '&' : '?';
  return `${embedUrl}${separator}modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&controls=1&fs=1&autoplay=1`;
};

const ProjectDetailModal = ({ project, onClose, triggerRect }: ProjectDetailModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = "hidden";

    // Animate in
    requestAnimationFrame(() => {
      if (overlayRef.current) overlayRef.current.style.opacity = "1";
      if (contentRef.current) {
        contentRef.current.style.transform = "scale(1)";
        contentRef.current.style.opacity = "1";
      }
    });

    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleClose = () => {
    if (overlayRef.current) overlayRef.current.style.opacity = "0";
    if (contentRef.current) {
      contentRef.current.style.transform = "scale(0.92)";
      contentRef.current.style.opacity = "0";
    }
    setTimeout(onClose, 280);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{
        backgroundColor: "rgba(0,0,0,0.85)",
        opacity: 0,
        transition: "opacity 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
    >
      <div
        ref={contentRef}
        className="bg-card rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl"
        style={{
          transform: "scale(0.85)",
          opacity: 0,
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
          transformOrigin: triggerRect
            ? `${triggerRect.left + triggerRect.width / 2}px ${triggerRect.top + triggerRect.height / 2}px`
            : "center center",
        }}
      >
        {/* Close button */}
        <div className="sticky top-0 z-10 flex justify-end p-4">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleClose}
            className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-md"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Video */}
        <div className="px-4 md:px-8 -mt-4">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
            <iframe
              src={getEmbedUrl(project.video_url)}
              title={project.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full absolute inset-0"
            />
            <YouTubeSubscribePrompt delaySeconds={15} />
          </div>
        </div>

        {/* Details */}
        <div className="p-6 md:p-8">
          <Badge variant="secondary" className="mb-3">{project.category}</Badge>
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-3">{project.title}</h2>

          {project.description && (
            <p className="text-muted-foreground leading-relaxed mb-6">{project.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {project.client && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{project.client}</span>
              </div>
            )}
            {project.year && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{project.year}</span>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <Button variant="outline" onClick={handleClose}>
              ← Back to Projects
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
