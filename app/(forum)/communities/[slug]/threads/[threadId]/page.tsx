import { notFound } from "next/navigation";
import { parseMarkdown } from "@/lib/markdown";
import { CommentTree } from "./comment-tree";
import { CommentForm } from "./comment-form";
import { VoteButtons } from "./vote-buttons";
import Link from "next/link";

import { SERVER_API } from "@/lib/api-url";

export const dynamic = 'force-dynamic';

const API_BASE = SERVER_API;

interface Thread {
  threadId: string;
  title: string;
  content: string;
  authorUsername?: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  voteScore?: number;
  hotScore?: number;
  commentCount?: number;
  createdAt: string;
}

interface Comment {
  commentId: string;
  content: string;
  authorUsername?: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  voteScore?: number;
  createdAt: string;
  replies?: Comment[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

async function getThread(slug: string, threadId: string): Promise<Thread | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/forum/threads/${threadId}`,
      { cache: "no-store" }
    );
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getComments(slug: string, threadId: string): Promise<Comment[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/forum/comments/thread/${threadId}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.rootComments?.map((n: { comment: Comment }) => n.comment) ?? [];
  } catch {
    return [];
  }
}

export default async function ThreadPage({
  params,
}: {
  params: { slug: string; threadId: string };
}) {
  const [thread, comments] = await Promise.all([
    getThread(params.slug, params.threadId),
    getComments(params.slug, params.threadId),
  ]);

  if (!thread) notFound();

  const bodyHtml = await parseMarkdown(thread.content);

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
            <VoteButtons targetType={0} targetId={thread.threadId} initialScore={thread.voteScore ?? 0} />
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
                    {thread.authorDisplayName ?? thread.authorUsername}
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
        <CommentForm threadId={params.threadId} />
      </section>

      {/* Comments */}
      <section style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {comments.length} Comment{comments.length !== 1 ? "s" : ""}
        </span>
        <CommentTree comments={comments} depth={0} />
      </section>
    </div>
  );
}
