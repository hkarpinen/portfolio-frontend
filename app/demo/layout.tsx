import type { Metadata } from "next";

/**
 * Metadata-only layout — the demo page is "use client" (router, reCAPTCHA,
 * polling), so it can't export metadata. This sibling layout supplies it.
 */

export const metadata: Metadata = {
  title: "Try the demo",
  description:
    "One-click demo of The Stack & Gazette — six .NET 8 microservices, hand-rolled auth, household ledger, forum, finance. No signup, no email, you're in inside three seconds.",
  alternates: { canonical: "/demo" },
  openGraph: {
    title: "Try the demo — The Stack & Gazette",
    description: "One-click into a full-stack microservices app. No signup. Demo resets nightly.",
    url: "/demo",
    type: "website",
  },
  twitter: {
    title: "Try the demo — The Stack & Gazette",
    description: "One-click into a full-stack microservices app. No signup. Demo resets nightly.",
  },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
