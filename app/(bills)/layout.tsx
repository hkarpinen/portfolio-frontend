import { AppShellServer } from "@/components/layout/app-shell-server";

export default function BillsLayout({ children }: { children: React.ReactNode }) {
  return <AppShellServer>{children}</AppShellServer>;
}
