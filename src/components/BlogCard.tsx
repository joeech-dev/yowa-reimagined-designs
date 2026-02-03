import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
}

const BlogCard = ({ title, excerpt, category, image, slug }: BlogCardProps) => {
  return (
    <Card className="group overflow-hidden border-border hover:shadow-warm transition-smooth">
      <Link to={`/blog/${slug}`}>
        <div className="aspect-[1.43/1] overflow-hidden bg-muted">
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
        </div>
        <div className="p-6">
          <Badge variant="secondary" className="mb-3">
            {category}
          </Badge>
          <h3 className="font-display font-semibold text-xl mb-2 group-hover:text-primary transition-smooth line-clamp-2">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{excerpt || ""}</p>
          <div className="flex items-center text-primary text-sm font-medium">
            Read More
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-smooth" />
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default BlogCard;
