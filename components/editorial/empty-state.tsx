import React from "react";
import { Btn } from "./button";

/**
 * <EmptyState> — editorial empty state (redesign)
 *
 * All visual rules in /app/globals.css under `.ed-empty*` / `.ed-kicker` /
 * `.ed-h2` / `.ed-deck` classes.
 */

interface EmptyStateProps {
  title: string;
  body?: string;
  kicker?: string;
  glyph?: React.ReactNode;
  cta?: { label: string; href?: string; onClick?: () => void };
  secondaryCta?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}

export function EmptyState({
  title,
  body,
  kicker = "— NIL —",
  glyph,
  cta,
  secondaryCta,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`ed-empty ${className}`}>
      {glyph && <div aria-hidden="true" className="ed-empty-glyph">{glyph}</div>}
      {kicker && <p className="ed-kicker mb-3">{kicker}</p>}
      <h2 className="ed-h2 mb-3" dangerouslySetInnerHTML={{ __html: title }} />
      {body && <p className="ed-deck max-w-[50ch] mb-6">{body}</p>}
      {(cta || secondaryCta) && (
        <div className="flex gap-3 flex-wrap justify-center">
          {cta && (
            <Btn href={cta.href} onClick={cta.onClick} variant="primary" size="lg">
              {cta.label}
            </Btn>
          )}
          {secondaryCta && (
            <Btn href={secondaryCta.href} onClick={secondaryCta.onClick} variant="secondary" size="lg">
              {secondaryCta.label}
            </Btn>
          )}
        </div>
      )}
    </div>
  );
}
