import React from "react";

/**
 * <SectionHead> — Terminus section header (`// SECTION` kicker).
 *
 * Local replacement for the retired editorial `<DepartmentHead>` (broadsheet
 * thick/thin rule). Renders an amber `//`-prefixed kicker, an optional
 * tabular count, a mono title, and an optional deck — matching the prototype's
 * `<div class="section-h"><h2>// SECTION_NAME</h2></div>` convention.
 *
 * Visual rules reuse the shared `ed-kicker` / `ed-h3` / `ed-deck` / `ed-meta`
 * classes from /app/globals.css.
 */
interface SectionHeadProps {
  /** Amber kicker; the `// ` prefix is added automatically. e.g. "RECURRING". */
  kicker: string;
  /** Right-aligned tabular count. e.g. "3 bills · $1,140/mo". */
  count?: string;
  /** Title. Supports inline `<em>` for the amber accent. */
  title: string;
  /** Optional standfirst sentence under the title. */
  deck?: string;
  /** id forwarded to the heading element. */
  id?: string;
  /** Heading level, defaults to h2. */
  level?: 2 | 3 | 4;
}

export function SectionHead({ kicker, count, title, deck, id, level = 2 }: SectionHeadProps) {
  const Heading = `h${level}` as "h2" | "h3" | "h4";
  return (
    <header className="flex flex-col gap-2 border-b border-border pb-3">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <span className="ed-kicker">// {kicker}</span>
        {count && <span className="ed-meta">{count}</span>}
      </div>
      <Heading
        id={id}
        className="ed-h3"
        // `title` may carry inline <em> for the amber accent.
        // Source: page code only — never user input.
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {deck && <p className="ed-deck max-w-[64ch]">{deck}</p>}
    </header>
  );
}
