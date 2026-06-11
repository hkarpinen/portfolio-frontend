import type { MetadataRoute } from "next";

/**
 * Robots policy — served at /robots.txt.
 *
 * Disallow blocks (1) the auth flow, (2) the authenticated app interiors
 * (forum/finance/household/notifications/settings/admin), (3) the
 * uploads folder. Everything else is explicitly allowed, and the sitemap
 * URL points crawlers at the curated list of indexable pages.
 *
 * Belt-and-suspenders: each disallowed route group also has
 * `robots: { index: false }` set in its layout, so even if a crawler
 * ignores robots.txt the page's <meta name="robots"> says no.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://hankkarpinen.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Identity (auth + settings)
          "/identity",
          // Authenticated app interiors
          "/forum",
          "/finance",
          "/household",
          "/notifications",
          "/admin",
          // User uploads — never indexable
          "/uploads",
          // Next.js API routes (if any are public)
          "/api",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
