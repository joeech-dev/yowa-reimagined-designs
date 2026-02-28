import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, ShoppingCart, Lock, ArrowRight, BookOpen, Video, Camera } from "lucide-react";
import { toast } from "sonner";

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

const schema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  country: z.string().min(2, "Country is required"),
});

type FormData = z.infer<typeof schema>;

const typeIcons: Record<string, typeof BookOpen> = {
  ebook: BookOpen,
  video: Video,
  photo: Camera,
};

const benefits: Record<string, string[]> = {
  ebook: ["Instant digital download", "Lifetime access", "Mobile & desktop compatible", "Actionable frameworks"],
  video: ["HD streaming access", "Download for offline viewing", "Behind-the-scenes content", "Production notes included"],
  photo: ["High-resolution files", "Commercial usage rights", "Instant download", "Multiple formats included"],
  film_script: ["PDF & Word formats", "Full production rights", "Scene-by-scene breakdown", "Notes & commentary"],
};

const OrderNow = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("product");
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, title, description, price, currency, product_type, image_url, purchase_url")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      const products = data || [];
      setAllProducts(products);

      if (productId) {
        const found = products.find((p) => p.id === productId);
        setProduct(found || products[0] || null);
      } else {
        setProduct(products[0] || null);
      }
      setLoading(false);
    };
    load();
  }, [productId]);

  const onSubmit = async (data: FormData) => {
    if (!product) return;
    setSubmitting(true);

    try {
      // Submit to systeme.io via existing edge function
      const tags = [
        "order-form",
        `product-${product.product_type}`,
        `item-${product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}`,
      ];

      const res = await supabase.functions.invoke("systeme-add-contact", {
        body: {
          email: data.email,
          name: data.full_name,
          phone: data.phone || "",
          tags,
          fields: { country: data.country },
        },
      });

      if (res.error) throw res.error;

      setSubmitted(true);

      // Redirect to actual purchase URL after brief delay if available
      if (product.purchase_url && product.purchase_url !== window.location.href) {
        setTimeout(() => {
          window.location.href = product.purchase_url!;
        }, 3000);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  const Icon = product ? (typeIcons[product.product_type] || ShoppingCart) : ShoppingCart;
  const productBenefits = product ? (benefits[product.product_type] || benefits.ebook) : benefits.ebook;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Order Now | Yowa Innovations"
        description="Complete your order for Yowa's creative resources — eBooks, videos, and more."
        url="https://yowa.us/ordernow"
      />
      <Navbar />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">

          {submitted ? (
            <div className="max-w-lg mx-auto text-center py-20">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-display font-bold text-3xl mb-4">Order Received!</h1>
              <p className="text-muted-foreground mb-6">
                Thank you! We've received your order for <strong>{product?.title}</strong>. 
                You'll receive an email with access details shortly.
              </p>
              <p className="text-sm text-muted-foreground animate-pulse">Redirecting you to complete payment…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* Left: Product Summary */}
              <div className="space-y-6">
                <div>
                  <Badge variant="secondary" className="mb-3">Secure Checkout</Badge>
                  <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
                    Complete Your Order
                  </h1>
                  <p className="text-muted-foreground">
                    You're just one step away from getting access.
                  </p>
                </div>

                {/* Product selector if multiple */}
                <div className="space-y-3">
                  {allProducts.map((p) => {
                    const PIcon = typeIcons[p.product_type] || ShoppingCart;
                    return (
                      <Card
                        key={p.id}
                        className={`p-4 cursor-pointer transition-all border-2 ${
                          product?.id === p.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                        onClick={() => setProduct(p)}
                      >
                        <div className="flex items-center gap-4">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <PIcon className="h-7 w-7 text-muted-foreground/50" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{p.title}</p>
                            <p className="text-sm text-muted-foreground capitalize">{p.product_type.replace("_", " ")}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-lg">{p.price ? `$${p.price}` : "Free"}</p>
                            <p className="text-xs text-muted-foreground">{p.currency}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Benefits */}
                {product && (
                  <div className="bg-muted/40 rounded-xl p-5">
                    <p className="font-semibold mb-3 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      What you get
                    </p>
                    <ul className="space-y-2">
                      {productBenefits.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Trust signals */}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 text-primary" />
                  <span>Secured & processed via systeme.io</span>
                </div>
              </div>

              {/* Right: Order Form */}
              <div>
                <Card className="p-6 md:p-8 shadow-lg border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display font-bold text-xl">Your Details</h2>
                    {product?.price && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${product.price}</p>
                        <p className="text-xs text-muted-foreground">{product.currency}</p>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        placeholder="Jane Doe"
                        {...register("full_name")}
                        className={errors.full_name ? "border-destructive" : ""}
                      />
                      {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane@example.com"
                        {...register("email")}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+256 700 000000"
                        {...register("phone")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        placeholder="Uganda"
                        {...register("country")}
                        className={errors.country ? "border-destructive" : ""}
                      />
                      {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Selected product</span>
                      <span className="font-medium truncate max-w-[180px]">{product?.title}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-bold text-lg text-primary">
                        {product?.price ? `$${product.price} ${product.currency}` : "Free"}
                      </span>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gradient-warm shadow-warm"
                      disabled={submitting || !product}
                    >
                      {submitting ? (
                        "Processing…"
                      ) : (
                        <>
                          Proceed to Payment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By placing this order you agree to our{" "}
                      <a href="/terms-of-service" className="underline hover:text-foreground">Terms of Service</a>
                      {" "}and{" "}
                      <a href="/privacy-policy" className="underline hover:text-foreground">Privacy Policy</a>.
                    </p>
                  </form>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderNow;
