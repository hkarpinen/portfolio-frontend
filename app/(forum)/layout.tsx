import { AppShellServer } from "@/components/layout/app-shell-server";
import { RepoFooter } from "@/components/layout/repo-footer";
import { ForumMasthead } from "./forum-masthead";

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellServer topBand={<ForumMasthead />}>
      {children}
      <RepoFooter repo="portfolio-forum" label="portfolio-forum" />
    </AppShellServer>
  );
}
