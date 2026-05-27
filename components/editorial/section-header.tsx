import React from "react";

/**
 * <SectionHeader> — editorial page header (redesign)
 *
 * All visual rules in /app/globals.css under `.ed-section-head*` /
 * `.ed-kicker` / `.ed-h1` / `.ed-deck` / `.ed-breadcrumb*` classes.
 */

interface SectionHeaderProps {
  kicker?: string;
  breadcrumb?: { label: string; href?: string; onClick?: () => void }[];
  /** Supports inline `<em>` for the "Your <em>households</em>" pattern. */
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  id?: string;
}

export function SectionHeader({
  kicker,
  breadcrumb,
  title,
  subtitle,
  action,
  id = "page-title",
}: SectionHeaderProps) {
  return (
    <header className="ed-section-head">
      {kicker && <p className="ed-kicker">{kicker}</p>}

      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="ed-breadcrumb">
          {breadcrumb.map((item, i) => {
            const last = i === breadcrumb.length - 1;
            return (
              <React.Fragment key={i}>
                {i > 0 && <span className="ed-breadcrumb-sep">/</span>}
                {(item.href || item.onClick) && !last ? (
                  <a
                    href={item.href}
                    onClick={item.onClick ? (e => { e.preventDefault(); item.onClick!(); }) : undefined}
                    className="ed-breadcrumb-link"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span aria-current={last ? "page" : undefined} className="ed-breadcrumb-current">
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      <div className="ed-section-head-row">
        <div className="flex-1 min-w-0">
          <h1
            id={id}
            className="ed-h1"
            // `title` may contain inline <em> for the editorial accent pattern.
            // Source: page-code only; never user-input.
            dangerouslySetInnerHTML={{ __html: title }}
          />
          {subtitle && <p className="ed-deck max-w-[60ch] mt-3">{subtitle}</p>}
        </div>
        {action && (
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
