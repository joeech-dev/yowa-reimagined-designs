import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Handles redirects for old/broken URLs that Google Search Console reports.
 * This prevents 404 soft errors and preserves any link equity.
 */
const SeoRedirects = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname.toLowerCase();

    // /index.html → /
    if (path === "/index.html") {
      navigate("/", { replace: true });
      return;
    }

    // /posts?page=X → /blogs
    if (path === "/posts") {
      navigate("/blogs", { replace: true });
      return;
    }

    // /category/X → /blogs (category pages don't exist, redirect to blogs)
    if (path.startsWith("/category/")) {
      navigate("/blogs", { replace: true });
      return;
    }

    // /blog-template-70/... → /blogs
    if (path.startsWith("/blog-template")) {
      navigate("/blogs", { replace: true });
      return;
    }

    // Old WordPress-style blog URLs /YYYY/MM/DD/... → /blogs
    if (/^\/\d{4}\/\d{2}\/\d{2}\//.test(path)) {
      navigate("/blogs", { replace: true });
      return;
    }
  }, [location.pathname, navigate]);

  return null;
};

export default SeoRedirects;
