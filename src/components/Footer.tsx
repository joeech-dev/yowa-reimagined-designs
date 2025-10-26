import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg gradient-warm flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">Y</span>
              </div>
              <span className="font-display font-bold text-lg">Yowa Innovations</span>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              Innovating Reality. Inspiring Impact. A content creation and advertising agency
              reimagining the everyday.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["Home", "About", "Blogs", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                    className="text-sm opacity-90 hover:opacity-100 hover:text-primary transition-smooth"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              {["Infrastructure", "Urbanism", "Livelihood"].map((category) => (
                <li key={category}>
                  <Link
                    to={`/blogs?category=${category.toLowerCase()}`}
                    className="text-sm opacity-90 hover:opacity-100 hover:text-primary transition-smooth"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Newsletter</h3>
            <p className="text-sm opacity-90 mb-4">
              Subscribe to stay in the loop with our latest stories and insights.
            </p>
            <div className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-background/10 border-secondary-foreground/20"
              />
              <Button size="sm" className="gradient-warm">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm opacity-75">
              © 2025 Yowa Innovations Ltd. All Rights Reserved.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://facebook.com/yowainnovations"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-75 hover:opacity-100 hover:text-primary transition-smooth"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com/yowainnovations"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-75 hover:opacity-100 hover:text-primary transition-smooth"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://linkedin.com/company/yowainnovations"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-75 hover:opacity-100 hover:text-primary transition-smooth"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://twitter.com/yowainnovations"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-75 hover:opacity-100 hover:text-primary transition-smooth"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://youtube.com/@yowa_inn"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-75 hover:opacity-100 hover:text-primary transition-smooth"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
