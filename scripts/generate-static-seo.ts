/**
 * Creates route-specific HTML files after Vite builds the SPA.
 *
 * This gives non-JavaScript crawlers real per-page title, description,
 * canonical, Open Graph and Twitter tags in the first HTTP response.
 */

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://yowa.us";
import { SUPABASE_URL, SUPABASE_KEY } from "./env";


interface PageMeta {
  path: string;
  title: string;
  description: string;
  canonical?: string;
  image?: string | null;
  type?: "website" | "article";
}

interface BlogRow {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image: string | null;
}

const staticPages: PageMeta[] = [
  { path: "/about", title: "About Yowa Innovations | Creative Agency Uganda", description: "Discover Yowa Innovations, Uganda's creative agency using media, technology and creativity to drive positive change." },
  { path: "/projects", title: "Projects | Yowa Innovations – Our Completed Work", description: "View documentaries, video productions, training programmes and digital campaigns delivered across East Africa." },
  { path: "/blogs", title: "Blog | Yowa Innovations – Innovation & Impact", description: "Read insights on innovation, sustainability, social impact, urbanism and creative storytelling in East Africa." },
  { path: "/contact", title: "Contact Yowa Innovations | Creative Agency Uganda", description: "Contact Yowa Innovations for video production, photography, digital marketing and creative strategy across East Africa." },
  { path: "/get-started", title: "Get Started with Yowa Innovations | Free Consultation", description: "Start a video, photography, digital marketing or creative strategy project with Yowa Innovations." },
  { path: "/team", title: "Supporting Team | Yowa Innovations", description: "Meet the employees, freelancers and trainees who power the creative work at Yowa Innovations." },
  { path: "/shop", title: "Shop – Products & Resources | Yowa Innovations", description: "Browse creative resources from Yowa Innovations, including eBooks, videos, photos and film scripts." },
  { path: "/careers", title: "Careers at Yowa Innovations | Join Our Creative Team", description: "Explore open roles at Yowa Innovations and join a creative team telling Africa's stories." },
  { path: "/privacy-policy", title: "Privacy Policy | Yowa Innovations", description: "Learn how Yowa Innovations collects, uses and protects personal information." },
  { path: "/terms-of-service", title: "Terms of Service | Yowa Innovations", description: "Read the terms and conditions for using Yowa Innovations' website and services." },
  { path: "/cookie-policy", title: "Cookie Policy | Yowa Innovations", description: "Learn how Yowa Innovations uses cookies and manages consent on this website." },
  { path: "/content-policy", title: "Content Use & Copyright Policy | Yowa Innovations", description: "Read the content use and copyright policy for Yowa Innovations." },
];

const escapeAttribute = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const stripHtml = (value: string) =>
  value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

const descriptionFor = (row: BlogRow) => {
  const text = stripHtml(row.excerpt?.trim() || row.content || "Insights from Yowa Innovations on innovation and impact in East Africa.");
  if (text.length <= 158) return text;
  const cut = text.slice(0, 158);
  const boundary = cut.lastIndexOf(" ");
  return `${(boundary > 100 ? cut.slice(0, boundary) : cut).trim()}…`;
};

function renderPage(template: string, meta: PageMeta) {
  const canonical = meta.canonical || `${BASE_URL}${meta.path}`;
  const title = escapeAttribute(meta.title);
  const description = escapeAttribute(meta.description);
  const image = escapeAttribute(meta.image || `${BASE_URL}/og-image.png`);
  const type = meta.type || "website";

  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${type}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${description}" />`)
    .replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${image}" />`);

  html = html.replace(
    "<!-- Canonical is set per-route by src/components/SEO.tsx (react-helmet-async) -->",
    `<link rel="canonical" href="${canonical}" />`,
  );

  const outputDirectory = resolve("dist", meta.path.slice(1));
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(resolve(outputDirectory, "index.html"), html);
}

async function main() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,title,excerpt,content,image&status=eq.published&order=published_at.desc`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
  );

  if (!response.ok) {
    throw new Error(`static SEO: published blog query failed (${response.status}) — refusing to publish generic blog HTML`);
  }

  const blogs = (await response.json()) as BlogRow[];
  const blogPages: PageMeta[] = blogs.filter((row) => row.slug).map((row) => ({
    path: `/blog/${row.slug}`,
    title: `${row.title} | Yowa Innovations`,
    description: descriptionFor(row),
    image: row.image,
    type: "article",
  }));

  const template = readFileSync(resolve("dist/index.html"), "utf8");
  [...staticPages, ...blogPages].forEach((meta) => renderPage(template, meta));

  // Legacy blog URLs: canonical + instant redirect to the new short /blog/<slug> URL.
  Object.entries(BLOG_SLUG_ALIASES).forEach(([oldSlug, newSlug]) => {
    const target = `${BASE_URL}/blog/${newSlug}`;
    [oldSlug.includes("-") ? `/blog/${oldSlug}` : `/${oldSlug}`].forEach((path) => {
      const directory = resolve("dist", path.slice(1));
      mkdirSync(directory, { recursive: true });
      writeFileSync(
        resolve(directory, "index.html"),
        `<!doctype html><html lang="en"><head><meta charset="utf-8" />` +
          `<link rel="canonical" href="${target}" />` +
          `<meta name="robots" content="noindex, follow" />` +
          `<meta http-equiv="refresh" content="0; url=${target}" />` +
          `<title>Moved</title></head><body><p>This page has moved to <a href="${target}">${target}</a>.</p>` +
          `<script>location.replace(${JSON.stringify(`/blog/${newSlug}`)})</script></body></html>\n`,
      );
    });
  });

  console.log(
    `static SEO HTML written (${staticPages.length} static pages, ${blogPages.length} blog routes, ` +
      `${Object.keys(BLOG_SLUG_ALIASES).length} legacy redirects)`,
  );
}

}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});