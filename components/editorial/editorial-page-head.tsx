import React from "react";

/**
 * <EditorialPageHead> — full-width page headline block (editorial)
 *
 * Sibling to <SectionHeader>. Use this on pages that use <MastheadRow> so
 * the masthead carries the primary CTA + sub-nav and the headline below
 * can run at the full editorial measure — three stacked blocks (kicker,
 * headline, deck), no flex row, no action area.
 *
 * All visual rules live in /app/globals.css under `.ed-page-head*`.
 */

interface EditorialPageHeadProps {
  /** Mono red lead-in (e.g. "MAY EDITION"). */
  kicker?: string;
  /** Italic serif headline. Supports inline `<em>` for the red accent. */
  title: string;
  /** Editorial deck sentence under the headline. */
  deck?: string;
  /** id forwarded to the heading element. */
  id?: string;
}

export function EditorialPageHead({
  kicker,
  title,
  deck,
  id = "page-title",
}: EditorialPageHeadProps) {
  return (
    <header className="ed-page-head">
      {kicker && <p className="ed-page-head-kicker">{kicker}</p>}
      <h1
        id={id}
        className="ed-page-head-title"
        // `title` may contain inline <em> for the red italic accent
        // pattern. Source: page code only — never user input.
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {deck && <p className="ed-page-head-deck">{deck}</p>}
    </header>
  );
}
