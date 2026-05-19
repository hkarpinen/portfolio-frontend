import { AppShellServer } from "@/components/layout/app-shell-server";

export default async function GeographyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellServer>
      {children}
    </AppShellServer>
  );
}
