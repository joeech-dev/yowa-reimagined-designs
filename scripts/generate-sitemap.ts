/**
 * Generates public/sitemap.xml.
 *
 * Runs automatically before `vite dev` and `vite build` (predev/prebuild),
 * so every publish picks up the current set of published blog posts:
 * new posts appear automatically, unpublished/deleted posts disappear.
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://yowa.us";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/projects", changefreq: "weekly", priority: "0.9" },
  { path: "/blogs", changefreq: "daily", priority: "0.9" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/get-started", changefreq: "monthly", priority: "0.8" },
  { path: "/team", changefreq: "monthly", priority: "0.7" },
  { path: "/shop", changefreq: "weekly", priority: "0.7" },
  { path: "/careers", changefreq: "weekly", priority: "0.7" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms-of-service", changefreq: "yearly", priority: "0.3" },
  { path: "/cookie-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/content-policy", changefreq: "yearly", priority: "0.3" },
];

async function fetchBlogEntries(): Promise<SitemapEntry[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("sitemap: Supabase env vars missing — writing static entries only");
    return [];
  }

  const url =
    `${SUPABASE_URL}/rest/v1/blog_posts` +
    `?select=slug,updated_at,published_at&status=eq.published&order=published_at.desc`;

  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });

  if (!res.ok) {
    console.warn(`sitemap: blog fetch failed (${res.status}) — writing static entries only`);
    return [];
  }

  const rows = (await res.json()) as Array<{
    slug: string;
    updated_at: string | null;
    published_at: string | null;
  }>;

  return rows
    .filter((r) => !!r.slug)
    .map((r) => {
      const stamp = r.updated_at || r.published_at;
      return {
        path: `/blog/${r.slug}`,
        lastmod: stamp ? new Date(stamp).toISOString().slice(0, 10) : undefined,
        changefreq: "weekly" as const,
        priority: "0.8",
      };
    });
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
}

const blogEntries = await fetchBlogEntries();
const entries = [...staticEntries, ...blogEntries];
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries, ${blogEntries.length} blog posts)`);
