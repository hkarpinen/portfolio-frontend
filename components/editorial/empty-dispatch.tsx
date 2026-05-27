import React from "react";

/**
 * <EmptyDispatch> — editorialized empty state
 *
 * Em-dash bracketed serif italic line, e.g. `— Nothing to report —`. For
 * places too small for a full <EmptyState> card but where the silence
 * should still feel intentional.
 *
 * Use `<em>` inside the children for an ink-toned accent word.
 *
 * All visual rules in /app/globals.css under `.ed-empty-dispatch`.
 */

interface EmptyDispatchProps {
  children: React.ReactNode;
}

export function EmptyDispatch({ children }: EmptyDispatchProps) {
  return <p className="ed-empty-dispatch">{children}</p>;
}
