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
 * Every previously published blog slug (old un-hyphenated root URLs and the old
 * long hyphenated slugs) mapped to its new short slug. SeoRedirects sends the
 * old URL to /blog/<new-slug> so no search-engine equity is lost.
 */
export const BLOG_SLUG_ALIASES: Record<string, string> = {
  // Old root-level un-hyphenated URLs
  heroesofkampala: "heroes-of-kampala",
  buildingugandasoilfuture: "building-ugandas-oil-future",
  youthinnovationamidstneglect: "banda-waste-economy",
  globalcorridor: "globalcorridor-sheffield",
  urbanisminkampala: "urbanism-in-kampala",
  whytheentebbekampalaexpresswaybecameafricasmostcontroversialroad: "entebbe-kampala-expressway",
  // Old long /blog/... slugs
  "unsung-heroes-of-kampala-informal-social-service-providers": "heroes-of-kampala",
  "building-uganda-oil-future-cosl-kingfisher-tilenga": "building-ugandas-oil-future",
  "urbanism-in-kampala-post-covid-transformation": "urbanism-in-kampala",
  "youth-innovation-amidst-neglect-banda-waste-economy": "banda-waste-economy",
  "globalcorridor-rethinking-corridors-urban-life-sheffield": "globalcorridor-sheffield",
  "entebbe-kampala-expressway-controversial-road": "entebbe-kampala-expressway",
  "why-the-entebbe-kampala-expressway-became-africas-most-controversial-road": "entebbe-kampala-expressway",
  "uganda-triumphs-in-23-billion-railway-dispute": "uganda-railway-dispute-win",
  "iccd-2026-uganda-curriculum-development-conference": "iccd-2026-uganda",
  "african-mobilities-kampala-s-kitenge-traders-in-focus": "kampala-kitenge-traders",
  "women-in-boda-boda-business-electric-mobility-in-uganda": "women-in-boda-boda-business",
  "how-ai-is-transforming-urban-infrastructure-research-and-documentary-production-in-africa":
    "ai-urban-research-africa",
  "documentary-production-in-kampala-behind-the-scenes-of-filming-informal-transport-for-fes-uganda":
    "documentary-production-kampala",
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
