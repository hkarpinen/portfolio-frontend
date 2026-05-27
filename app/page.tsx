import { getSession } from "@/lib/auth/session";
import { LandingPage } from "./landing-page";

/**
 * Server entry for `/`. Resolves the current session once (cached for the
 * render) so the public landing's top nav can render the avatar/notifications
 * cluster instead of the sign-in CTAs when a user is already authenticated.
 */
export default async function HomePage() {
  const session = await getSession();
  return (
    <LandingPage
      displayName={session?.displayName ?? null}
      avatarUrl={session?.avatarUrl ?? null}
    />
  );
}
