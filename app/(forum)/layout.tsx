import { AppShellServer } from "@/components/layout/app-shell-server";

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return <AppShellServer>{children}</AppShellServer>;
}
