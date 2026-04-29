import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/layout/query-provider";
import { NotificationsProvider } from "@/components/layout/notifications-provider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--ff-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--ff-body",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Portfolio, Forum, and Finance Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={`h-full ${jakarta.variable} ${inter.variable}`}>
      <body className="h-full">
        <QueryProvider>
          <NotificationsProvider>
            {children}
          </NotificationsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
