import React from "react";

/**
 * <SourceNote> — byline / source line under a table or section
 *
 * Standardizes the "Source: Plaid · synced 4m ago" footer pattern. Items
 * are rendered with mono dots between them.
 *
 * All visual rules in /app/globals.css under `.ed-source-note*`.
 */

interface SourceNoteProps {
  /** Bolded leading source. e.g. "Plaid". */
  source?: string;
  /** When the underlying data was last synced. Renders "synced Xm ago". */
  syncedAt?: Date;
  /** Free-form trailing meta strings. */
  meta?: string[];
}

function relativeTime(then: Date): string {
  const ms = Date.now() - then.getTime();
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function SourceNote({ source, syncedAt, meta = [] }: SourceNoteProps) {
  const parts: React.ReactNode[] = [];
  if (source) {
    parts.push(
      <React.Fragment key="source">
        <span>Source:</span>
        <span className="ed-source-note-strong">{source}</span>
      </React.Fragment>,
    );
  }
  if (syncedAt) {
    parts.push(<span key="synced">synced {relativeTime(syncedAt)}</span>);
  }
  for (let i = 0; i < meta.length; i++) {
    parts.push(<span key={`m-${i}`}>{meta[i]}</span>);
  }
  if (parts.length === 0) return null;

  return (
    <p className="ed-source-note">
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <span className="ed-source-note-sep" aria-hidden="true">
              ·
            </span>
          )}
          {part}
        </React.Fragment>
      ))}
    </p>
  );
}
