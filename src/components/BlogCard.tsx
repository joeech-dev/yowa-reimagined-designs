import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BlogCardProps {
  title: string;
  excerpt: string | null;
  category: string;
  image: string | null;
  slug: string;
  source_url?: string;
  source_name?: string;
  published_at?: string;
  featured?: boolean;
}

const estimateReadTime = (excerpt: string | null) => {
  if (!excerpt) return "2 min read";
  const words = excerpt.split(/\s+/).length;
  const mins = Math.max(2, Math.ceil(words / 50));
  return `${mins} min read`;
};

const BlogCard = ({ title, excerpt, category, image, slug, published_at, featured }: BlogCardProps) => {
  if (featured) {
    return (
      <Card className="group overflow-hidden border-border hover:shadow-warm transition-smooth">
        <Link to={`/blog/${slug}`} className="grid md:grid-cols-2 gap-0">
          <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-muted">
            {image ? (
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
              />
            ) : (
              <div className="w-full h-full min-h-[250px] flex items-center justify-center text-muted-foreground bg-muted">
                No Image
              </div>
            )}
          </div>
          <div className="p-8 flex flex-col justify-center">
            <Badge variant="secondary" className="mb-3 w-fit">
              {category}
            </Badge>
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-3 group-hover:text-primary transition-smooth line-clamp-3">
              {title}
            </h2>
            <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">{excerpt || ""}</p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {published_at && (
                  <span>{new Date(published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {estimateReadTime(excerpt)}
                </span>
              </div>
              <span className="flex items-center text-primary text-sm font-medium">
                Read Article
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-smooth" />
              </span>
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border-border hover:shadow-warm transition-smooth flex flex-col">
      <Link to={`/blog/${slug}`} className="flex flex-col h-full">
        <div className="aspect-[16/10] overflow-hidden bg-muted relative">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          <Badge variant="secondary" className="absolute top-3 left-3 shadow-sm">
            {category}
          </Badge>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-smooth line-clamp-2 leading-snug">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">{excerpt || ""}</p>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {published_at && (
                <span>{new Date(published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {estimateReadTime(excerpt)}
              </span>
            </div>
            <span className="flex items-center text-primary text-sm font-medium">
              Read
              <ArrowRight className="ml-1 w-3.5 h-3.5 group-hover:translate-x-1 transition-smooth" />
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default BlogCard;
