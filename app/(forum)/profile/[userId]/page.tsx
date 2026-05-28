import { Icon } from "@/components/editorial";
import Link from "next/link";
import { getCookieHeader } from "@/lib/server-cookies";
import { fetchMeServer } from "@/lib/api/identity";
import {
  fetchForumProfileServer,
  fetchProfileThreadsServer,
  fetchProfileMembershipsServer,
  fetchProfileCommentsServer,
} from "@/lib/api/forum";
import { timeAgo, formatDate, getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Server component (audit §3.3). The whole page is data display — no
 * client state or event handlers — so every section renders on the
 * server. The "You" badge comparison runs server-side too via
 * `fetchMeServer`, eliminating the JS bundle for the entire profile
 * route.
 */
export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const cookieHeader = await getCookieHeader();

  // Parallel fetch — the four profile sub-fetches and `me` share a
  // single request burst so the page renders in one round-trip.
  const [profile, threadsData, memberships, commentsData, me] = await Promise.all([
    fetchForumProfileServer(userId, cookieHeader),
    fetchProfileThreadsServer(userId, cookieHeader),
    fetchProfileMembershipsServer(userId, cookieHeader),
    fetchProfileCommentsServer(userId, cookieHeader),
    fetchMeServer(cookieHeader).catch(() => null),
  ]);

  const isOwnProfile = me?.id === userId;
  const displayName = profile?.displayName ?? "Unknown User";
  const initials = getInitials(displayName);
  const threads = threadsData?.items ?? [];
  const comments = commentsData?.items ?? [];

  return (
    <div className="page-enter flex flex-col gap-12">
      {/* Hero */}
      <div className="relative overflow-hidden border-ink bg-paper p-16 shadow-card">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.3]" />
        <div className="relative flex flex-wrap items-start gap-10">
          {/* Avatar */}
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={`${displayName}'s avatar`}
              className="h-40 w-40 shrink-0 object-cover [border:3px_solid_var(--ink)]"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-40 w-40 shrink-0 items-center justify-center bg-paper-3 font-mono text-xl font-bold text-ink [border:2px_solid_var(--ink)]"
            >
              {initials}
            </div>
          )}
          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-5">
              <h1 className="ed-h1">{displayName}</h1>
              {isOwnProfile && (
                <span
                  className="bg-red-soft px-4 py-1 font-mono text-sm text-red"
                  aria-label="This is your profile"
                >
                  You
                </span>
              )}
            </div>
            {profile?.bio && (
              <p className="mt-3 text-base leading-[1.5] text-ink-2">{profile.bio}</p>
            )}
            {profile?.createdAt && (
              <p className="mt-4 text-base text-ink-3">
                Member since{" "}
                <time dateTime={profile.createdAt}>{formatDate(profile.createdAt)}</time>
              </p>
            )}
          </div>
          {isOwnProfile && (
            <Link
              href="/settings/profile"
              className="shrink-0 border border-ink-3 px-7 py-3.5 text-base font-semibold text-ink-2 no-underline transition-colors duration-[110ms] hover:bg-paper-2"
            >
              Edit profile
            </Link>
          )}
        </div>
      </div>

      {/* Communities */}
      <div className="border-ink bg-paper p-10 shadow-stamp">
        <h2 className="ed-h3 mb-8">Communities</h2>
        {!memberships || memberships.length === 0 ? (
          <p className="text-base text-ink-3">Not a member of any communities yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {memberships.map((m) => (
              <Link
                key={m.membershipId}
                href={`/forum/g/${m.communitySlug}`}
                className="flex items-center gap-6 px-6 py-5 no-underline transition-colors duration-[110ms] hover:bg-paper-2"
              >
                {m.communityImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.communityImageUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-red-soft">
                    <Icon name="forum" size={14} />
                  </div>
                )}
                <div className="flex-1">
                  <p className="m-0 text-base font-semibold text-ink">{m.communityName}</p>
                  <p className="m-0 text-sm text-ink-3">
                    {m.role === "Moderator" ? "Moderator" : "Member"} · Joined{" "}
                    {formatDate(m.joinedAt)}
                  </p>
                </div>
                {m.role === "Moderator" && (
                  <span
                    className="shrink-0 px-3 py-1 font-mono text-sm text-red"
                    style={{ background: "oklch(from var(--warning) l c h / 0.12)" }}
                  >
                    MOD
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Threads */}
      <div className="overflow-hidden border-ink bg-paper shadow-stamp">
        <div className="p-[20px_20px_12px]">
          <h2 className="ed-h3">Recent Threads</h2>
        </div>
        {threads.length === 0 ? (
          <div className="p-[0_20px_20px]">
            <p className="text-base text-ink-3">No threads posted yet.</p>
          </div>
        ) : (
          <ul className="m-0 list-none p-0">
            {threads.map((thread, i) => (
              <li key={thread.threadId}>
                <Link
                  href={`/forum/g/${(thread as { communitySlug?: string }).communitySlug ?? ""}/threads/${thread.threadId}`}
                  className={`flex items-center gap-6 px-10 py-6 no-underline transition-colors duration-[110ms] hover:bg-paper-2${i === 0 ? "border-ink-t" : ""}${i < threads.length - 1 ? "border-ink-b" : ""}`}
                >
                  <div
                    className="w-18 shrink-0 text-center"
                    aria-label={`${thread.voteScore ?? 0} votes`}
                  >
                    <span aria-hidden="true" className="text-base font-bold text-ink">
                      {thread.voteScore ?? 0}
                    </span>
                    <div aria-hidden="true" className="text-sm uppercase text-ink-3">
                      pts
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold text-ink">
                      {thread.title}
                    </p>
                    <time dateTime={thread.createdAt} className="m-0 block text-sm text-ink-3">
                      {timeAgo(thread.createdAt)}
                    </time>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Comments */}
      <div className="overflow-hidden border-ink bg-paper shadow-stamp">
        <div className="p-[20px_20px_12px]">
          <h2 className="ed-h3">Recent Comments</h2>
        </div>
        {comments.length === 0 ? (
          <div className="p-[0_20px_20px]">
            <p className="text-base text-ink-3">No comments posted yet.</p>
          </div>
        ) : (
          <ul className="m-0 list-none p-0">
            {comments.map((comment, i) => (
              <li key={comment.commentId}>
                <Link
                  href={`/forum/g/${comment.communitySlug}/threads/${comment.threadId}`}
                  className={`flex flex-col gap-2 px-10 py-6 no-underline transition-colors duration-[110ms] hover:bg-paper-2${i === 0 ? "border-ink-t" : ""}${i < comments.length - 1 ? "border-ink-b" : ""}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold text-red">
                      {comment.threadTitle}
                    </p>
                    <time dateTime={comment.createdAt} className="shrink-0 text-sm text-ink-3">
                      {timeAgo(comment.createdAt)}
                    </time>
                  </div>
                  <p className="m-0 text-base leading-[1.45] text-ink-2">{comment.content}</p>
                  <p className="m-0 text-sm text-ink-3">in {comment.communityName}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
