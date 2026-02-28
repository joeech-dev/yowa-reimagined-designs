import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Video, Camera, FileText, Package, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  product_type: string;
  image_url: string | null;
  purchase_url: string | null;
}

const typeConfig: Record<string, { icon: typeof BookOpen; label: string; color: string }> = {
  ebook: { icon: BookOpen, label: "eBook", color: "bg-primary/10 text-primary" },
  video: { icon: Video, label: "Video", color: "bg-secondary/10 text-secondary" },
  photo: { icon: Camera, label: "Photo", color: "bg-accent/20 text-accent-foreground" },
  film_script: { icon: FileText, label: "Film Script", color: "bg-muted text-muted-foreground" },
  other: { icon: Package, label: "Product", color: "bg-muted text-muted-foreground" },
};

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, title, description, price, currency, product_type, image_url, purchase_url")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      setProducts(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen">
      <SEO
        title="Shop – Products & Resources | Yowa Innovations"
        description="Browse our collection of creative resources including eBooks, videos, photos, and film scripts. Tools to help you grow as a creative professional."
        url="https://yowa.us/shop"
      />
      <Navbar />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                Our Shop
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Explore our creative resources — from practical guides and video packs to photography collections and film scripts.
            </p>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground">No products available at the moment. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {products.map((product) => {
                const config = typeConfig[product.product_type] || typeConfig.other;
                const Icon = config.icon;

                return (
                  <Card key={product.id} className="flex flex-col overflow-hidden group hover:shadow-primary transition-smooth">
                    {/* Image or icon placeholder */}
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                          loading="lazy"
                        />
                      ) : (
                        <Icon className="h-16 w-16 text-muted-foreground/40" />
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                        {product.price && (
                          <span className="text-sm font-semibold text-foreground ml-auto">
                            {product.currency} {product.price}
                          </span>
                        )}
                      </div>

                      <h2 className="font-display font-bold text-lg mb-2">{product.title}</h2>

                      {product.description && (
                        <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-4">
                          {product.description}
                        </p>
                      )}

                      {product.purchase_url ? (
                        <Button
                          className="w-full hover:scale-105 transition-smooth"
                          onClick={() => navigate(`/ordernow?product=${product.id}`)}
                        >
                          Get This
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button disabled className="w-full">Coming Soon</Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
