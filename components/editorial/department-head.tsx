import React from "react";

/**
 * <DepartmentHead> — section header with thick-thin rule pair
 *
 * Replacement for the inline `<h2 className="ed-h2">` pattern. Pulls the
 * "DEPARTMENT · Pg A2" conceit from broadsheet layout: 2px ink rule above,
 * red mono kicker + tabular count, italic serif title, optional deck, then
 * a hairline rule below.
 *
 * All visual rules in /app/globals.css under `.ed-dept*`.
 */

interface DepartmentHeadProps {
  /** Red mono kicker on the left. e.g. "RECURRING". */
  kicker: string;
  /** Right-aligned count badge. e.g. "3 bills" or "$1,140 due". */
  count?: string;
  /** Italic serif title. Supports inline `<em>` for the red accent. */
  title: string;
  /** Optional standfirst sentence under the title. */
  deck?: string;
  /** id forwarded to the heading element. */
  id?: string;
  /** Heading level, defaults to h2. */
  level?: 2 | 3 | 4;
}

export function DepartmentHead({ kicker, count, title, deck, id, level = 2 }: DepartmentHeadProps) {
  const Heading = `h${level}` as "h2" | "h3" | "h4";
  return (
    <header className="ed-dept">
      <div className="ed-dept-meta">
        <span className="ed-dept-kicker">{kicker}</span>
        {count && <span className="ed-dept-count">{count}</span>}
      </div>
      <Heading
        id={id}
        className="ed-dept-title"
        // `title` may contain inline <em> for the red italic accent.
        // Source: page code only — never user input.
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {deck && <p className="ed-dept-deck">{deck}</p>}
    </header>
  );
}
