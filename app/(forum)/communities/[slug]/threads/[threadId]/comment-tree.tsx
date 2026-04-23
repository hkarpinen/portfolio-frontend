"use client";

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

function CommentNode({ comment, depth }: { comment: Comment; depth: number }) {
  const authorName = comment.authorDisplayName ?? comment.authorUsername ?? "anonymous";
  const initials = authorName[0].toUpperCase();

  return (
    <div style={{
      paddingLeft: depth > 0 ? "16px" : "0",
      borderLeft: depth > 0 ? "2px solid var(--border)" : "none",
    }}>
      <div style={{ padding: "12px 0" }}>
        {/* Author row */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          {comment.authorAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.authorAvatarUrl}
              alt=""
              style={{
                width: "20px", height: "20px", borderRadius: "9999px",
                objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0,
              }}
            />
          ) : (
            <span style={{
              width: "20px", height: "20px", borderRadius: "9999px",
              background: "var(--surface-3)", color: "var(--text-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "9px", fontWeight: "600", flexShrink: 0,
            }}>
              {initials}
            </span>
          )}
          <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text)" }}>
            {authorName}
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-3)" }}>·</span>
          <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{timeAgo(comment.createdAt)}</span>
          {comment.voteScore !== undefined && (
            <>
              <span style={{ fontSize: "11px", color: "var(--text-3)" }}>·</span>
              <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{comment.voteScore} pts</span>
            </>
          )}
        </div>

        {/* Content */}
        <p style={{
          fontSize: "13px", color: "var(--text)", lineHeight: "1.6",
          whiteSpace: "pre-wrap",
        }}>{comment.content}</p>
      </div>

      {depth < 3 && comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentNode key={reply.commentId} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentTree({ comments, depth }: { comments: Comment[]; depth: number }) {
  if (comments.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
        No comments yet. Be the first!
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {comments.map((comment, i) => (
        <div key={comment.commentId} style={{
          borderTop: i > 0 ? "1px solid var(--border)" : "none",
        }}>
          <CommentNode comment={comment} depth={depth} />
        </div>
      ))}
    </div>
  );
}
