import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Cookie, FileText, Shield, ScrollText } from "lucide-react";
import { Input } from "@/components/ui/input";
import logo from "@/assets/Yowa_Logo_1.png";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={logo} alt="Yowa Innovations" className="h-10 w-auto brightness-0 invert" />
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
              {["Home", "About", "Projects", "Blogs", "Shop", "Contact"].map((item) => (
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
            <h3 className="font-display font-semibold text-lg mb-4">Policies</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/cookie-policy"
                  className="text-sm opacity-90 hover:opacity-100 hover:text-primary transition-smooth flex items-center gap-2"
                >
                  <Cookie size={14} />
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/content-policy"
                  className="text-sm opacity-90 hover:opacity-100 hover:text-primary transition-smooth flex items-center gap-2"
                >
                  <FileText size={14} />
                  Content Use Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-sm opacity-90 hover:opacity-100 hover:text-primary transition-smooth flex items-center gap-2"
                >
                  <Shield size={14} />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-sm opacity-90 hover:opacity-100 hover:text-primary transition-smooth flex items-center gap-2"
                >
                  <ScrollText size={14} />
                  Terms of Service
                </Link>
              </li>
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
