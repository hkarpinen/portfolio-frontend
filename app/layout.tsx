import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "The Stack.",
  description: "All the code that's fit to ship.",
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
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
