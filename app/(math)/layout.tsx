import { AppShellServer } from "@/components/layout/app-shell-server";

export default async function MathLayout({ children }: { children: React.ReactNode }) {
  return <AppShellServer>{children}</AppShellServer>;
}
