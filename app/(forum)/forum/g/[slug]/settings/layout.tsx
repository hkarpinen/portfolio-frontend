import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { fetchCommunityBySlugServer, fetchMembershipServer } from "@/lib/api/communities";
import { getCookieHeader } from "@/lib/server-cookies";

/**
 * Guard for `/forum/[slug]/settings/*`.
 *
 * Order of checks:
 *   1. Must be authenticated -> otherwise redirect to /login.
 *   2. Community must exist  -> otherwise notFound().
 *   3. Caller must be Owner or Moderator -> otherwise notFound() (we do not
 *      reveal "settings exist but you can't see them").
 *
 * The backend re-enforces every mutation; this layout only stops the UI
 * from rendering settings data to non-privileged callers.
 */
export default async function CommunitySettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  await requireUser();

  const cookieHeader = await getCookieHeader();
  const community = await fetchCommunityBySlugServer(params.slug, cookieHeader);
  if (!community) notFound();

  const membership = await fetchMembershipServer(community.communityId, cookieHeader);
  const role = membership?.role;
  if (role !== "Owner" && role !== "Moderator") notFound();

  return <>{children}</>;
}
