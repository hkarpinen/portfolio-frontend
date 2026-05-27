"use client";
import Link from "next/link";
import { useMe } from "@/hooks/use-identity";
import { useForumProfile, useProfileThreads, useProfileMemberships, useProfileComments } from "@/hooks/use-forum";
import { timeAgo, formatDate, getInitials } from "@/lib/utils";
import { Icon } from "@/components/editorial/icon";

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const { data: me } = useMe();
  const { data: profile, isLoading: profileLoading } = useForumProfile(userId);
  const { data: threadsData } = useProfileThreads(userId);
  const { data: memberships } = useProfileMemberships(userId);
  const { data: commentsData } = useProfileComments(userId);

  const isOwnProfile = me?.id === userId;
  const displayName = profile?.displayName ?? "Unknown User";
  const initials = getInitials(displayName);
  const threads = threadsData?.items ?? [];
  const comments = commentsData?.items ?? [];

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <span className="text-base text-ink-3">Loading profile…</span>
      </div>
    );
  }

  return (
    <div className="page-enter flex flex-col gap-12">
      {/* Hero */}
      <div className="bg-paper p-16 shadow-card relative overflow-hidden border-ink">
        <div className="dot-grid absolute inset-0 opacity-[0.3] pointer-events-none" />
        <div className="relative flex items-start gap-10 flex-wrap">
          {/* Avatar */}
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={`${displayName}'s avatar`}
              className="w-40 h-40 object-cover shrink-0 [border:3px_solid_var(--ink)]"
            />
          ) : (
            <div aria-hidden="true" className="w-40 h-40 bg-paper-3 flex items-center justify-center text-xl font-bold text-ink font-mono shrink-0 [border:2px_solid_var(--ink)]">
              {initials}
            </div>
          )}
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-5 flex-wrap">
              <h1 className="ed-h1">{displayName}</h1>
              {isOwnProfile && (
                <span className="text-sm font-mono text-red bg-red-soft py-1 px-4" aria-label="This is your profile">You</span>
              )}
            </div>
            {profile?.bio && (
              <p className="text-base text-ink-2 mt-3 leading-[1.5]">
                {profile.bio}
              </p>
            )}
            {profile?.createdAt && (
              <p className="text-base text-ink-3 mt-4">
                Member since <time dateTime={profile.createdAt}>{formatDate(profile.createdAt)}</time>
              </p>
            )}
          </div>
          {isOwnProfile && (
            <Link href="/settings/profile" className="text-base font-semibold text-ink-2 py-[7px] px-[14px] border border-ink-3 no-underline shrink-0 transition-colors duration-[110ms] hover:bg-paper-2">Edit profile</Link>
          )}
        </div>
      </div>

      {/* Communities */}
      <div className="bg-paper p-10 shadow-stamp border-ink">
        <h2 className="ed-h3 mb-8">Communities</h2>
        {!memberships || memberships.length === 0 ? (
          <p className="text-base text-ink-3">Not a member of any communities yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {memberships.map(m => (
              <Link
                key={m.membershipId}
                href={`/forum/g/${m.communitySlug}`}
                className="flex items-center gap-6 py-5 px-6 no-underline transition-colors duration-[110ms] hover:bg-paper-2"
              >
                {m.communityImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.communityImageUrl} alt="" className="w-16 h-16 object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-red-soft flex items-center justify-center shrink-0">
                    <Icon name="forum" size={14} />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-base font-semibold text-ink m-0">{m.communityName}</p>
                  <p className="text-sm text-ink-3 m-0">
                    {m.role === "Moderator" ? "Moderator" : "Member"} · Joined {formatDate(m.joinedAt)}
                  </p>
                </div>
                {m.role === "Moderator" && (
                  <span className="text-sm font-mono text-red py-1 px-3 shrink-0" style={{ background: "oklch(from var(--warning) l c h / 0.12)" }}>MOD</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Threads */}
      <div className="bg-paper overflow-hidden shadow-stamp border-ink">
        <div className="p-[20px_20px_12px]">
          <h2 className="ed-h3">Recent Threads</h2>
        </div>
        {threads.length === 0 ? (
          <div className="p-[0_20px_20px]">
            <p className="text-base text-ink-3">No threads posted yet.</p>
          </div>
        ) : (
          <ul className="list-none m-0 p-0">
            {threads.map((thread, i) => (
              <li key={thread.threadId}>
                <Link
                  href={`/forum/g/${(thread as {communitySlug?: string}).communitySlug ?? ""}/threads/${thread.threadId}`}
                  className={`flex items-center gap-6 py-6 px-10 no-underline transition-colors duration-[110ms] hover:bg-paper-2${i === 0 ? " border-ink-t" : ""}${i < threads.length - 1 ? " border-ink-b" : ""}`}
                >
                  <div className="w-[36px] text-center shrink-0" aria-label={`${thread.voteScore ?? 0} votes`}>
                    <span aria-hidden="true" className="text-base font-bold text-ink">{thread.voteScore ?? 0}</span>
                    <div aria-hidden="true" className="text-sm text-ink-3 uppercase">pts</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-ink m-0 whitespace-nowrap overflow-hidden text-ellipsis">
                      {thread.title}
                    </p>
                    <time dateTime={thread.createdAt} className="text-sm text-ink-3 m-0 block">
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
      <div className="bg-paper overflow-hidden shadow-stamp border-ink">
        <div className="p-[20px_20px_12px]">
          <h2 className="ed-h3">Recent Comments</h2>
        </div>
        {comments.length === 0 ? (
          <div className="p-[0_20px_20px]">
            <p className="text-base text-ink-3">No comments posted yet.</p>
          </div>
        ) : (
          <ul className="list-none m-0 p-0">
            {comments.map((comment, i) => (
              <li key={comment.commentId}>
                <Link
                  href={`/forum/g/${comment.communitySlug}/threads/${comment.threadId}`}
                  className={`flex flex-col gap-2 py-6 px-10 no-underline transition-colors duration-[110ms] hover:bg-paper-2${i === 0 ? " border-ink-t" : ""}${i < comments.length - 1 ? " border-ink-b" : ""}`}
                >
                  <div className="flex items-center gap-4 justify-between">
                    <p className="text-base text-red m-0 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                      {comment.threadTitle}
                    </p>
                    <time dateTime={comment.createdAt} className="text-sm text-ink-3 shrink-0">{timeAgo(comment.createdAt)}</time>
                  </div>
                  <p className="text-base text-ink-2 m-0 leading-[1.45]">{comment.content}</p>
                  <p className="text-sm text-ink-3 m-0">in {comment.communityName}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}