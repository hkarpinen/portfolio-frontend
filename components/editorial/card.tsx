import React from "react";

/**
 * <Card> — editorial card (redesign)
 *
 * All visual rules in /app/globals.css under `.ed-card*` classes.
 */

interface CardProps {
  accent?: boolean;
  hover?: boolean;
  muted?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Card({
  accent,
  hover,
  muted,
  onClick,
  children,
  className = "",
}: CardProps) {
  const cls = [
    "ed-card",
    accent ? "ed-card-accent" : "",
    muted ? "ed-card-muted" : "",
    hover ? "card-hover" : "",
    onClick ? "cursor-pointer w-full text-left" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {children}
      </button>
    );
  }
  return <div className={cls}>{children}</div>;
}
