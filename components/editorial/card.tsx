import React from "react";

interface CardProps {
  accent?: boolean;
  hover?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: number | string;
}

export function Card({
  accent,
  hover,
  onClick,
  children,
  className = "",
  style,
  padding = 22,
}: CardProps) {
  const borderStyle = accent
    ? { borderTop: "6px solid var(--red)", borderRight: "1.5px solid var(--ink)", borderBottom: "1.5px solid var(--ink)", borderLeft: "1.5px solid var(--ink)" }
    : { border: "1.5px solid var(--ink)" };

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={`bg-paper ${hover ? "card-hover" : ""} ${onClick ? "cursor-pointer w-full text-left" : ""} ${className}`}
      style={{
        padding,
        background: "var(--paper)",
        ...borderStyle,
        borderRadius: 0,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
