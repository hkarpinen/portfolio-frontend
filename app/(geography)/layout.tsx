import { AppShellServer } from "@/components/layout/app-shell-server";
import { RepoFooter } from "@/components/layout/repo-footer";

export default async function GeographyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellServer>
      {children}
      <RepoFooter repo="portfolio-geography" label="portfolio-geography" />
    </AppShellServer>
  );
}
