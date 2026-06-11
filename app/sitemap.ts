import type { MetadataRoute } from "next";

/**
 * Sitemap — Google reads this from /sitemap.xml.
 *
 * Lists only the public, indexable pages. App pages (forum, finance,
 * household, settings, etc.) are gated by auth and have explicit
 * noindex set in their route-group layouts, so they're intentionally
 * absent here.
 *
 * Override SITE_URL with NEXT_PUBLIC_SITE_URL at build time when
 * deploying to a non-production host.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://hankkarpinen.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about/architecture`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/demo`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/weather`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/convert`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];
}
