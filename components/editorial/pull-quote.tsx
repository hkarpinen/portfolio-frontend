import React from "react";

/**
 * <PullQuote> — italic serif callout with red left rule
 *
 * The "what's news" sentence. Use sparingly — one per page, and only when
 * the data has something worth saying. Renders as a `<figure>` so the
 * attribution carries semantic weight.
 *
 * All visual rules in /app/globals.css under `.ed-pull*`.
 */

interface PullQuoteProps {
  /** The quote body. Plain string or rich nodes — `<em>` becomes red italic. */
  children: React.ReactNode;
  /** Optional attribution line, mono uppercase. e.g. "May ledger · 27 days in". */
  attribution?: string;
}

export function PullQuote({ children, attribution }: PullQuoteProps) {
  return (
    <figure className="ed-pull">
      <blockquote className="ed-pull-body">{children}</blockquote>
      {attribution && <figcaption className="ed-pull-attr">{attribution}</figcaption>}
    </figure>
  );
}
