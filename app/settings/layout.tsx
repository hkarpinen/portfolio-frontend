import { AppShellServer } from "@/components/layout/app-shell-server";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AppShellServer>{children}</AppShellServer>;
}
