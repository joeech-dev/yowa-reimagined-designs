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
  heroesofkampala: "unsung-heroes-of-kampala-informal-social-service-providers",
};
