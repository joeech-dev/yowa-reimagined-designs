import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoLight from "@/assets/Yowa_Logo_2.png";
import logoDark from "@/assets/Yowa_Logo_1.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Blogs", path: "/blogs" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src={logoLight} 
              alt="Yowa Innovations Logo" 
              className="w-10 h-10 dark:hidden"
            />
            <img 
              src={logoDark} 
              alt="Yowa Innovations Logo" 
              className="w-10 h-10 hidden dark:block"
            />
            <span className="font-display font-bold text-xl text-foreground">
              Yowa Innovations
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-foreground hover:text-primary transition-smooth font-medium"
              >
                {link.name}
              </Link>
            ))}
            <Link to="/get-started">
              <Button size="sm" className="gradient-warm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 text-foreground hover:text-primary transition-smooth font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/get-started">
              <Button size="sm" className="w-full gradient-warm">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
