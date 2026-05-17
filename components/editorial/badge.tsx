import React from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "violet";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  default:  { background: "transparent", color: "var(--ink-2)", border: "1px solid var(--ink-3)" },
  primary:  { background: "var(--ink)",  color: "var(--paper)", border: "1px solid var(--ink)" },
  success:  { background: "var(--green)", color: "var(--paper)", border: "1px solid var(--green)" },
  warning:  { background: "transparent", color: "var(--red)",    border: "1px solid var(--red)" },
  danger:   { background: "var(--red)",  color: "var(--paper)", border: "1px solid var(--red)" },
  violet:   { background: "transparent", color: "var(--ink)",    border: "1px solid var(--ink)" },
};

const SIZE_STYLES: Record<BadgeSize, React.CSSProperties> = {
  sm: { padding: "1px 6px",  fontSize: "0.525rem" },
  md: { padding: "2px 8px",  fontSize: "0.594rem" },
};

export function Badge({
  variant = "default",
  size = "sm",
  dot,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`font-mono uppercase inline-flex items-center gap-[4px] shrink-0 ${className}`}
      style={{
        fontWeight: 500,
        letterSpacing: "0.14em",
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
      }}
    >
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            background: "currentColor",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
