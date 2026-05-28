import React from "react";
import { timeAgo } from "@/lib/utils";

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
    parts.push(<span key="synced">synced {timeAgo(syncedAt)}</span>);
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
