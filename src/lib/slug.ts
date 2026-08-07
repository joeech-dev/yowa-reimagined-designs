/**
 * URL slug helpers for blog posts.
 */

/** Turn a title into a clean, lowercase, hyphenated, URL-safe slug. */
export const slugify = (input: string, maxLength = 80): string => {
  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .replace(/['’`"]/g, "") // drop apostrophes/quotes instead of hyphenating them
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (base.length <= maxLength) return base;

  // Trim on a word boundary so we never cut a word in half.
  const trimmed = base.slice(0, maxLength);
  const lastDash = trimmed.lastIndexOf("-");
  return (lastDash > 20 ? trimmed.slice(0, lastDash) : trimmed).replace(/(^-|-$)/g, "");
};

/** Sanitise a manually typed slug without fighting the user mid-typing. */
export const sanitizeSlug = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-");

/**
 * Old (unhyphenated) slugs that were already crawled, mapped to their new
 * hyphenated equivalents. SeoRedirects sends the old URL to the new one so no
 * existing search-engine equity is lost.
 */
export const BLOG_SLUG_ALIASES: Record<string, string> = {
  buildingugandasoilfuture: "building-uganda-oil-future-cosl-kingfisher-tilenga",
  youthinnovationamidstneglect: "youth-innovation-amidst-neglect-banda-waste-economy",
  globalcorridor: "globalcorridor-rethinking-corridors-urban-life-sheffield",
  urbanisminkampala: "urbanism-in-kampala-post-covid-transformation",
  whytheentebbekampalaexpresswaybecameafricasmostcontroversialroad: "why-the-entebbe-kampala-expressway-became-africas-most-controversial-road",
};

/**
 * Legacy root-level URLs Google still has indexed (from the old site). They used
 * to hit the SPA catch-all, which renders NotFound with `noindex` — that is why
 * Search Console reported pages like /heroesofkampala or /photography as
 * "excluded by noindex". They now redirect to the real, indexable page.
 */
export const LEGACY_PATH_REDIRECTS: Record<string, string> = {
  // Old un-hyphenated legal / static pages
  "/privacypolicy": "/privacy-policy",
  "/termsofservice": "/terms-of-service",
  "/termsandconditions": "/terms-of-service",
  "/cookiepolicy": "/cookie-policy",
  "/contentpolicy": "/content-policy",
  "/aboutus": "/about",
  "/about-us": "/about",
  "/contactus": "/contact",
  "/contact-us": "/contact",
  "/getstarted": "/get-started",
  "/ourteam": "/team",
  "/our-team": "/team",
  "/ourprojects": "/projects",
  "/our-projects": "/projects",
  "/ourwork": "/projects",
  "/blog": "/blogs",
  "/news": "/blogs",
  "/articles": "/blogs",
  // Old service pages → the work that showcases them
  "/photography": "/projects",
  "/videography": "/projects",
  "/videoproduction": "/projects",
  "/video-production": "/projects",
  "/documentary": "/projects",
  "/documentaryproduction": "/projects",
  "/contentcreation": "/projects",
  "/digitalmarketing": "/projects",
  "/socialmedia": "/projects",
  "/services": "/projects",
  "/jobs": "/careers",
  "/vacancies": "/careers",
};
