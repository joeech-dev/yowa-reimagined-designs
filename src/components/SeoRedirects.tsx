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

    // /YYYY/MM/... (partial date paths)
    if (/^\/\d{4}\/\d{2}\/?$/.test(path)) {
      navigate("/blogs", { replace: true });
      return;
    }

    // /author/X → /about
    if (path.startsWith("/author/") || path === "/author") {
      navigate("/about", { replace: true });
      return;
    }

    // /tag/X → /blogs
    if (path.startsWith("/tag/") || path === "/tag") {
      navigate("/blogs", { replace: true });
      return;
    }

    // /page/X → /
    if (path.startsWith("/page/") || path === "/page") {
      navigate("/", { replace: true });
      return;
    }

    // /wp-content/*, /wp-admin/*, /wp-includes/*, /wp-login*, /wp-json/*
    if (path.startsWith("/wp-")) {
      navigate("/", { replace: true });
      return;
    }

    // /feed/, /rss, /atom
    if (path === "/feed" || path === "/feed/" || path === "/rss" || path === "/atom") {
      navigate("/blogs", { replace: true });
      return;
    }

    // /xmlrpc.php, /wp-sitemap.xml, etc.
    if (path.endsWith(".php") || path === "/wp-sitemap.xml") {
      navigate("/", { replace: true });
      return;
    }

    // /cecb899f* (broken hash URLs from Google Search Console)
    if (path.startsWith("/cecb899f")) {
      navigate("/", { replace: true });
      return;
    }

    // /comments/feed → /blogs
    if (path.startsWith("/comments")) {
      navigate("/blogs", { replace: true });
      return;
    }

    // /sample-page, /hello-world (default WP pages)
    if (path === "/sample-page" || path === "/hello-world") {
      navigate("/", { replace: true });
      return;
    }

    // /ordernow → /shop
    if (path === "/ordernow") {
      navigate("/shop", { replace: true });
      return;
    }
  }, [location.pathname, navigate]);

  return null;
};

export default SeoRedirects;
