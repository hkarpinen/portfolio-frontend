import { cookies } from "next/headers";
import { SERVER_API } from "@/lib/api-url";
import { AppShell } from "./app-shell";
import { NotificationsToaster } from "./notifications-toaster";

function parseJwt(token: string) {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  } catch {
    return null;
  }
}

async function fetchProfile(token: string): Promise<{ displayName?: string; avatarUrl?: string | null } | null> {
  try {
    const res = await fetch(`${SERVER_API}/api/identity/me`, {
      headers: { Cookie: `access_token=${token}` },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function AppShellServer({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value ?? null;
  const payload = token ? parseJwt(token) : null;
  const profile = token ? await fetchProfile(token) : null;

  const displayName: string | null = profile?.displayName ?? payload?.displayName ?? null;
  const avatarUrl: string | null = profile?.avatarUrl ?? null;

  return (
    <>
      <AppShell displayName={displayName} avatarUrl={avatarUrl}>
        {children}
      </AppShell>
      <NotificationsToaster enabled={Boolean(token)} />
    </>
  );
}
