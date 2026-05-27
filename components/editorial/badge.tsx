import React from "react";

/**
 * <Badge> — editorial badge / pill (redesign)
 *
 * All visual rules in /app/globals.css under `.ed-badge*` classes.
 */

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "violet";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  default: "ed-badge-default",
  primary: "ed-badge-primary",
  success: "ed-badge-success",
  warning: "ed-badge-warning",
  danger:  "ed-badge-danger",
  violet:  "ed-badge-violet",
};

const SIZE_CLASS: Record<BadgeSize, string> = {
  sm: "ed-badge-sm",
  md: "ed-badge-md",
};

export function Badge({
  variant = "default",
  size = "sm",
  dot,
  children,
  className = "",
}: BadgeProps) {
  const cls = ["ed-badge", SIZE_CLASS[size], VARIANT_CLASS[variant], className]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={cls}>
      {dot && <span aria-hidden="true" className="ed-badge-dot" />}
      {children}
    </span>
  );
}
