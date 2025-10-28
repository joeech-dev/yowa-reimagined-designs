import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Twitter, Instagram, Dribbble } from "lucide-react";
import logoLight from "@/assets/Yowa_Logo_1.png";
import logoDark from "@/assets/Yowa_Logo_3.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Blogs", path: "/blogs" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-smooth"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={logoLight} 
              alt="Yowa Innovations" 
              className="h-8 dark:hidden"
            />
            <img 
              src={logoDark} 
              alt="Yowa Innovations" 
              className="h-8 hidden dark:block"
            />
          </Link>

          {/* Social Media Icons */}
          <div className="flex items-center space-x-2">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-muted rounded-lg transition-smooth"
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-muted rounded-lg transition-smooth"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://dribbble.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-muted rounded-lg transition-smooth"
              aria-label="Dribbble"
            >
              <Dribbble size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 top-[73px] bg-background/95 backdrop-blur-lg transition-smooth ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <nav className="container mx-auto px-4 py-12">
          <ul className="space-y-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className="block text-4xl font-display font-bold hover:text-primary transition-smooth"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
