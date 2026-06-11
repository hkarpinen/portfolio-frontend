import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/layout/query-provider";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--ff-serif",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--ff-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--ff-mono",
});

/**
 * Production canonical origin. Override with NEXT_PUBLIC_SITE_URL at build
 * time when deploying to a staging or preview environment so canonical URLs
 * point at the right host.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://hankkarpinen.com";

const SITE_NAME = "The Stack & Gazette";
const DEFAULT_TITLE = "Hank Karpinen — Full-stack engineer · .NET microservices, Next.js";
const DEFAULT_DESCRIPTION =
  "Portfolio of Hank Karpinen — full-stack engineer in Pullman, WA. Six .NET 8 microservices on RabbitMQ, hand-rolled auth, DDD + IDesign. Try the live demo.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    /** Used on /, the bare-domain landing. */
    default: DEFAULT_TITLE,
    /** Used by every child page: e.g. "Architecture — The Stack & Gazette". */
    template: `%s — ${SITE_NAME}`,
  },

  description: DEFAULT_DESCRIPTION,

  applicationName: SITE_NAME,
  authors: [{ name: "Hank Karpinen", url: SITE_URL }],
  creator: "Hank Karpinen",
  publisher: "Hank Karpinen",
  generator: "Next.js",

  keywords: [
    "Hank Karpinen",
    "full-stack engineer",
    "full-stack developer",
    ".NET microservices",
    "ASP.NET Core",
    "Next.js portfolio",
    "DDD",
    "IDesign",
    "RabbitMQ",
    "MassTransit",
    "transactional outbox",
    "Pullman WA engineer",
    "senior software engineer",
    "staff software engineer",
  ],

  alternates: {
    canonical: "/",
  },

  /** Default: public. Private route-group layouts override with noindex. */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    creator: "@hkarpinen",
    images: ["/opengraph-image"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },

  category: "technology",

  /** Verified domain ownership (add tokens when you have them).
   *  verification: { google: "...", yandex: "...", other: { ... } } */
};

export const viewport: Viewport = {
  themeColor: "#f1eadb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full ${instrumentSerif.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}
      style={{ "--ff-display": "var(--ff-serif)" } as React.CSSProperties}
    >
      <body className="h-full">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
