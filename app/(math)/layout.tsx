import { AppShellServer } from "@/components/layout/app-shell-server";
import { RepoFooter } from "@/components/layout/repo-footer";

export default async function MathLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellServer>
      {children}
      <RepoFooter repo="portfolio-math" label="portfolio-math" />
    </AppShellServer>
  );
}
