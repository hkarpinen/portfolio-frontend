import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { LandingPage } from "./landing-page";

/**
 * Server entry for `/`. Resolves the current session once (cached for the
 * render) so the public landing's top nav can render the avatar/notifications
 * cluster instead of the sign-in CTAs when a user is already authenticated.
 *
 * SEO: inherits the root layout's strong defaults (title, description,
 * OpenGraph, Twitter) — they're tuned for this exact page so no per-page
 * overrides needed. We DO inject Person + WebSite JSON-LD so Google can
 * show the engineer's profile in the SERP knowledge panel.
 */

export const metadata: Metadata = {
  // Omitting `title` here lets the root layout's `title.default` cascade
  // (without the "%s — The Stack & Gazette" template appended), which is
  // exactly the title we want on the landing.
  alternates: { canonical: "/" },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://stackgazette.dev";

/**
 * Person schema tuned for name-search dominance.
 *
 * `givenName` + `familyName` give Google explicit name parts (separate
 * from the display `name`) — this is what entity-resolution uses to
 * match the page to the "Hank Karpinen" person entity in its knowledge
 * graph. `description` populates the SERP knowledge-panel subtitle.
 * `sameAs` lists every other place this person is verified on the
 * internet — Google uses these to confirm "yes, all these profiles are
 * the same Hank Karpinen", which is what unlocks the rich profile
 * panel in name-query results.
 */
const PERSON_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Hank Karpinen",
  givenName: "Hank",
  familyName: "Karpinen",
  description:
    "Full-stack engineer in Pullman, WA. Builds .NET 8 microservices on RabbitMQ with DDD and IDesign; ships UI in Next.js and TypeScript. AWS certified, 4+ years experience. Open to senior & staff roles.",
  url: SITE_URL,
  mainEntityOfPage: SITE_URL,
  jobTitle: "Full-stack engineer",
  nationality: "American",
  image: `${SITE_URL}/hank_headshot.jpeg`,
  email: "mailto:hank@stackgazette.dev",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Pullman",
    addressRegion: "WA",
    addressCountry: "US",
  },
  /** Every profile that links back to stackgazette.dev. The more of
   *  these Google can confirm, the more confidently it merges them
   *  into one entity in the knowledge graph. */
  sameAs: [
    "https://github.com/hkarpinen",
    "https://www.linkedin.com/in/hank-karpinen/",
    "https://read.cv/hankk",
  ],
  knowsAbout: [
    ".NET",
    "ASP.NET Core",
    "Microservices",
    "Domain-Driven Design",
    "IDesign",
    "RabbitMQ",
    "MassTransit",
    "PostgreSQL",
    "Next.js",
    "TypeScript",
    "React",
    "AWS",
  ],
};

const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "The Stack & Gazette",
  url: SITE_URL,
  description:
    "Portfolio of Hank Karpinen — full-stack engineer. Six .NET 8 microservices on RabbitMQ, hand-rolled auth, DDD + IDesign.",
  author: { "@type": "Person", name: "Hank Karpinen" },
  inLanguage: "en-US",
};

export default async function HomePage() {
  const session = await getSession();
  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify on a typed object — no user input. Safe.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
      />
      <LandingPage
        displayName={session?.displayName ?? null}
        avatarUrl={session?.avatarUrl ?? null}
      />
    </>
  );
}
