import { notFound } from "next/navigation";
import { parseMarkdown } from "@/lib/markdown";
import { CommentTree } from "./comment-tree";
import { timeAgo } from "@/lib/utils";
import { CommentForm } from "./comment-form";
import { VoteButtons } from "./vote-buttons";
import Link from "next/link";

import { fetchThreadServer, fetchCommentsServer } from "@/lib/api/forum";
import { fetchCommunityBySlugServer } from "@/lib/api/communities";
import { getSession } from "@/lib/auth/session";
import type { Thread, Comment } from "@/types/forum";

export const dynamic = 'force-dynamic';

export default async function ThreadPage({
  params,
}: {
  params: { slug: string; threadId: string };
}) {
  const [thread, commentsData, community] = await Promise.all([
    fetchThreadServer(params.threadId),
    fetchCommentsServer(params.threadId),
    fetchCommunityBySlugServer(params.slug),
  ]);

  if (!thread) notFound();

  const comments: Comment[] = commentsData?.items ?? [];
  const bodyHtml = await parseMarkdown(thread.content ?? thread.body ?? "");
  const session = await getSession();
  const isAuthed = !!session;

  return (
    <div className="page-enter sidebar-grid" style={{ gap: "24px" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Link href="/communities" style={{ fontSize: "13px", color: "var(--text-3)", textDecoration: "none" }}>
          Communities
        </Link>
        <span style={{ color: "var(--text-3)", fontSize: "13px" }}>/</span>
        <Link href={`/communities/${params.slug}`} style={{ fontSize: "13px", color: "var(--text-3)", textDecoration: "none", textTransform: "capitalize" }}>
          {params.slug}
        </Link>
      </nav>

      {/* Thread */}
      <article style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{ display: "flex", gap: "0" }}>
          {/* Vote column */}
          <div style={{
            width: "48px", flexShrink: 0,
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "20px 0", borderRight: "1px solid var(--border)",
          }}>
            <VoteButtons threadId={thread.threadId} targetType={0} targetId={thread.threadId} initialScore={thread.voteScore ?? 0} />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0, padding: "20px 24px" }}>
            <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "22px", color: "var(--text)", lineHeight: 1.3, margin: 0 }}>
              {thread.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
              {(thread.authorDisplayName || thread.authorUsername) && (
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {thread.authorAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thread.authorAvatarUrl}
                      alt=""
                      style={{ width: "18px", height: "18px", borderRadius: "9999px", objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }}
                    />
                  ) : (
                    <span style={{
                      width: "18px", height: "18px", borderRadius: "9999px",
                      background: "var(--surface-3)", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: "9px", fontWeight: 600, color: "var(--text-2)", flexShrink: 0,
                    }}>
                      {(thread.authorDisplayName ?? thread.authorUsername ?? "?")[0].toUpperCase()}
                    </span>
                  )}
                  <span style={{ fontSize: "12px", color: "var(--text-3)" }}>
                    {thread.authorId ? (
                      <Link href={`/profile/${thread.authorId}`} style={{ color: "inherit", textDecoration: "none" }}
                      >{thread.authorDisplayName ?? thread.authorUsername}</Link>
                    ) : (thread.authorDisplayName ?? thread.authorUsername)}
                  </span>
                </span>
              )}
              <span style={{ color: "var(--text-3)", fontSize: "12px" }}>·</span>
              <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{timeAgo(thread.createdAt)}</span>
              {thread.commentCount !== undefined && (
                <>
                  <span style={{ color: "var(--text-3)", fontSize: "12px" }}>·</span>
                  <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{thread.commentCount} comments</span>
                </>
              )}
            </div>
            <div
              className="prose prose-slate dark:prose-invert max-w-none"
              style={{ marginTop: "16px", fontSize: "14px", color: "var(--text-2)", lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </div>
        </div>
      </article>

      {/* Comment form */}
      <section style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)",
      }}>
        <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: "15px", color: "var(--text)", marginBottom: "12px" }}>
          Leave a comment
        </h2>
        <CommentForm threadId={params.threadId} isAuthed={isAuthed} />
      </section>

      {/* Comments — card header + list rendered inside CommentTree */}
      <CommentTree comments={comments} depth={0} threadId={params.threadId} isAuthed={isAuthed} />
    </div>

    {/* Right sidebar */}
    <aside style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "16px", alignSelf: "start" }}>
      {community && (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)",
        }}>
          {/* Banner strip */}
          <div style={{
            height: "40px",
            background: community.color
              ? `linear-gradient(135deg, ${community.color}22, ${community.color}44)`
              : "linear-gradient(135deg, var(--accent-subtle), color-mix(in oklch, var(--accent) 22%, transparent))",
          }} />
          <div style={{ padding: "0 16px 16px" }}>
            <p style={{ fontFamily: "var(--ff-display)", fontWeight: 800, fontSize: "14px", color: "var(--text)", margin: "12px 0 6px" }}>
              About {community.name}
            </p>
            {community.description && (
              <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.5, margin: "0 0 12px" }}>{community.description}</p>
            )}
            <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
              <div>
                <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "16px", color: "var(--text)", margin: 0 }}>{community.memberCount.toLocaleString()}</p>
                <p style={{ fontSize: "11px", color: "var(--text-3)", margin: 0 }}>Members</p>
              </div>
              <div>
                <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "16px", color: "var(--text)", margin: 0 }}>{community.threadCount.toLocaleString()}</p>
                <p style={{ fontSize: "11px", color: "var(--text-3)", margin: 0 }}>Posts</p>
              </div>
            </div>
            <Link
              href={`/communities/${params.slug}`}
              style={{
                display: "block", textAlign: "center",
                background: "var(--accent)", color: "#fff",
                borderRadius: "var(--r-md)", padding: "8px 12px",
                fontSize: "13px", fontWeight: 600, textDecoration: "none",
              }}
            >
              Visit community
            </Link>
          </div>
        </div>
      )}
    </aside>
    </div>
  );
}
