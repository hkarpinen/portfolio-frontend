import { AppShellServer } from "@/components/layout/app-shell-server";
import { RepoFooter } from "@/components/layout/repo-footer";

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellServer>
      {children}
      <RepoFooter repo="portfolio-forum" label="portfolio-forum" />
    </AppShellServer>
  );
}
