"use client";
import styles from "./page.module.css";

import Link from "next/link";
import { useMe } from "@/hooks/use-identity";
import { useForumProfile, useProfileThreads, useProfileMemberships, useProfileComments } from "@/hooks/use-forum";
import { timeAgo, formatDate } from "@/lib/utils";

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const { data: me } = useMe();
  const { data: profile, isLoading: profileLoading } = useForumProfile(userId);
  const { data: threadsData } = useProfileThreads(userId);
  const { data: memberships } = useProfileMemberships(userId);
  const { data: commentsData } = useProfileComments(userId);

  const isOwnProfile = me?.id === userId;
  const displayName = profile?.displayName ?? "Unknown User";
  const initials = displayName.split(/\s+/).map((p: string) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
  const threads = threadsData?.items ?? [];
  const comments = commentsData?.items ?? [];

  if (profileLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
        <span style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)" }}>Loading profile…</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="page-enter">
      {/* Hero */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "24px", padding: "32px",
        boxShadow: "var(--shadow-sm)", position: "relative", overflow: "hidden",
      }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.3, pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
          {/* Avatar */}
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt=""
              style={{ width: "80px", height: "80px", borderRadius: "9999px", objectFit: "cover", border: "3px solid var(--surface)", flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: "80px", height: "80px",
              background: "var(--paper-3)",
              border: "2px solid var(--ink)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "var(--ts-sub)", fontWeight: 700, color: "var(--ink)",
              fontFamily: "var(--ff-mono)", flexShrink: 0,
            }}>
              {initials}
            </div>
          )}
          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 style={{
                fontFamily: "var(--ff-display)", fontWeight: "800",
                fontSize: "var(--ts-card-h)", letterSpacing: "-0.025em", color: "var(--text)", margin: 0,
              }}>{displayName}</h1>
              {isOwnProfile && (
                <span style={{
                  fontSize: "var(--ts-meta)", fontWeight: "600", color: "var(--accent)",
                  background: "var(--accent-subtle)", padding: "2px 8px", borderRadius: "9999px",
                }}>You</span>
              )}
            </div>
            {profile?.bio && (
              <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-2)", marginTop: "6px", lineHeight: 1.5 }}>
                {profile.bio}
              </p>
            )}
            {profile?.createdAt && (
              <p style={{ fontSize: "var(--ts-label)", color: "var(--text-3)", marginTop: "8px" }}>
                Member since {formatDate(profile.createdAt)}
              </p>
            )}
          </div>
          {isOwnProfile && (
            <Link href="/settings/profile" className={styles.editLink}
            >Edit profile</Link>
          )}
        </div>
      </div>

      {/* Communities */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)",
      }}>
        <h2 style={{
          fontFamily: "var(--ff-display)", fontWeight: "700",
          fontSize: "var(--ts-body)", color: "var(--text)", marginBottom: "16px",
        }}>Communities</h2>
        {!memberships || memberships.length === 0 ? (
          <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)" }}>Not a member of any communities yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {memberships.map(m => (
              <Link
                key={m.membershipId}
                href={`/communities/${m.communitySlug}`}
                className={styles.listLink}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 12px", borderRadius: "12px",
                  textDecoration: "none",
                }}
              >
                {m.communityImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.communityImageUrl} alt="" style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    background: "var(--accent-subtle)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "var(--ts-body)", flexShrink: 0,
                  }}>💬</div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "var(--ts-body-sm)", fontWeight: "600", color: "var(--text)", margin: 0 }}>{m.communityName}</p>
                  <p style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)", margin: 0 }}>
                    {m.role === "Moderator" ? "Moderator" : "Member"} · Joined {formatDate(m.joinedAt)}
                  </p>
                </div>
                {m.role === "Moderator" && (
                  <span style={{
                    fontSize: "var(--ts-meta)", fontWeight: "700", color: "var(--warning)",
                    background: "oklch(from var(--warning) l c h / 0.12)",
                    padding: "2px 6px", borderRadius: "9999px", flexShrink: 0,
                  }}>MOD</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Threads */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{ padding: "20px 20px 12px" }}>
          <h2 style={{
            fontFamily: "var(--ff-display)", fontWeight: "700",
            fontSize: "var(--ts-body)", color: "var(--text)", margin: 0,
          }}>Recent Threads</h2>
        </div>
        {threads.length === 0 ? (
          <div style={{ padding: "0 20px 20px" }}>
            <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)" }}>No threads posted yet.</p>
          </div>
        ) : (
          <div>
            {threads.map((thread, i) => (
              <Link
                key={thread.threadId}
                href={`/communities/${(thread as {communitySlug?: string}).communitySlug ?? ""}/threads/${thread.threadId}`}
                className={styles.listLink}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 20px",
                  borderTop: i === 0 ? "1px solid var(--border)" : "none",
                  borderBottom: i < threads.length - 1 ? "1px solid var(--border)" : "none",
                  textDecoration: "none",
                }}
              >
                <div style={{
                  width: "36px", textAlign: "center", flexShrink: 0,
                }}>
                  <span style={{ fontSize: "var(--ts-body-sm)", fontWeight: "700", color: "var(--text)" }}>{thread.voteScore ?? 0}</span>
                  <div style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)", textTransform: "uppercase" }}>pts</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "var(--ts-body-sm)", fontWeight: "600", color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {thread.title}
                  </p>
                  <p style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)", margin: 0 }}>
                    {timeAgo(thread.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Comments */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{ padding: "20px 20px 12px" }}>
          <h2 style={{
            fontFamily: "var(--ff-display)", fontWeight: "700",
            fontSize: "var(--ts-body)", color: "var(--text)", margin: 0,
          }}>Recent Comments</h2>
        </div>
        {comments.length === 0 ? (
          <div style={{ padding: "0 20px 20px" }}>
            <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)" }}>No comments posted yet.</p>
          </div>
        ) : (
          <div>
            {comments.map((comment, i) => (
              <Link
                key={comment.commentId}
                href={`/communities/${comment.communitySlug}/threads/${comment.threadId}`}
                className={styles.listLink}
                style={{
                  display: "flex", flexDirection: "column", gap: "4px",
                  padding: "12px 20px",
                  borderTop: i === 0 ? "1px solid var(--border)" : "none",
                  borderBottom: i < comments.length - 1 ? "1px solid var(--border)" : "none",
                  textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
                  <p style={{ fontSize: "var(--ts-label)", color: "var(--accent)", margin: 0, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {comment.threadTitle}
                  </p>
                  <span style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)", flexShrink: 0 }}>{timeAgo(comment.createdAt)}</span>
                </div>
                <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-2)", margin: 0, lineHeight: 1.45 }}>{comment.content}</p>
                <p style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)", margin: 0 }}>in {comment.communityName}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}