import type { Metadata } from "next";
import { AppShellServer } from "@/components/layout/app-shell-server";
import { RepoFooter } from "@/components/layout/repo-footer";
import { ForumMasthead } from "./forum-masthead";

/** Authenticated app — user-generated content within a portfolio demo.
 *  Keep out of the index so Hank's site isn't ranked for random thread
 *  titles. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellServer topBand={<ForumMasthead />}>
      {children}
      <RepoFooter repo="portfolio-forum" label="portfolio-forum" />
    </AppShellServer>
  );
}
