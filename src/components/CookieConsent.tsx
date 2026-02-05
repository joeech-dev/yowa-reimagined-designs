 import { useState, useEffect } from "react";
 import { Button } from "@/components/ui/button";
 import { Link } from "react-router-dom";
 
 const CookieConsent = () => {
   const [showBanner, setShowBanner] = useState(false);
 
   useEffect(() => {
     const consent = localStorage.getItem("cookie-consent");
     if (!consent) {
       setShowBanner(true);
     }
   }, []);
 
   const handleAccept = () => {
     localStorage.setItem("cookie-consent", "accepted");
     setShowBanner(false);
   };
 
   const handleDecline = () => {
     localStorage.setItem("cookie-consent", "declined");
     setShowBanner(false);
   };
 
   if (!showBanner) return null;
 
   return (
     <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-lg">
       <div className="container mx-auto max-w-4xl">
         <div className="flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="text-sm text-muted-foreground text-center md:text-left">
             <p>
               We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
               By clicking "Accept All", you consent to our use of cookies. Read our{" "}
               <Link to="/cookie-policy" className="text-primary underline hover:no-underline">
                 Cookie Policy
               </Link>{" "}
               to learn more.
             </p>
           </div>
           <div className="flex gap-3 shrink-0">
             <Button variant="outline" onClick={handleDecline}>
               Do Not Agree
             </Button>
             <Button onClick={handleAccept}>
               Accept All
             </Button>
           </div>
         </div>
       </div>
     </div>
   );
 };
 
 export default CookieConsent;