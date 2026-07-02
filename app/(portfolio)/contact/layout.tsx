import type { Metadata } from "next";

/**
 * Metadata-only layout — the contact page itself is "use client" (form
 * state, reCAPTCHA, etc.) so it can't export metadata directly. This
 * sibling layout supplies the SEO metadata without changing the page
 * component.
 */

export const metadata: Metadata = {
  // Title starts with "Contact Hank Karpinen" so the page also ranks
  // for queries like "hank karpinen contact" or "hank karpinen email" —
  // the kind of searches that come from a recruiter who already knows
  // the name.
  title: "Contact Hank Karpinen",
  description:
    "Get in touch with Hank Karpinen — full-stack engineer in Pullman, WA. Open to senior & staff roles, remote, hybrid, or onsite. Response within 24h.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Hank Karpinen",
    description:
      "Get in touch — open to senior & staff full-stack roles, remote, hybrid, or onsite.",
    url: "/contact",
    type: "website",
  },
  twitter: {
    title: "Contact — Hank Karpinen",
    description:
      "Get in touch — open to senior & staff full-stack roles, remote, hybrid, or onsite.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
