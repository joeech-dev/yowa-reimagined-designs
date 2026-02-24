import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import LeadGeneration from "./pages/LeadGeneration";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ContactFormWidget from "@/components/ContactFormWidget";
import CookieConsent from "@/components/CookieConsent";
import CookiePolicy from "./pages/CookiePolicy";
import ContentPolicy from "./pages/ContentPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import SupportingTeam from "./pages/SupportingTeam";
import Shop from "./pages/Shop";
import useGoogleAnalytics from "@/hooks/useGoogleAnalytics";
import SeoRedirects from "@/components/SeoRedirects";

const queryClient = new QueryClient();

const AnalyticsProvider = () => {
  useGoogleAnalytics();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnalyticsProvider />
        <SeoRedirects />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/projects" element={<Portfolio />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/get-started" element={<LeadGeneration />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/content-policy" element={<ContentPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/team" element={<SupportingTeam />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/ebook" element={<Shop />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ContactFormWidget />
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
