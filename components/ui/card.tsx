import { cn } from "@/lib/utils";
import styles from "./card.module.css";

type CardVariant = "default" | "interactive" | "stat" | "glass";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  glow?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  as?: "div" | "article" | "section";
}

export function Card({
  variant = "default",
  padding = "md",
  glow = false,
  className,
  children,
  onClick,
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      className={cn(
        styles.card,
        styles[variant],
        styles[`pad-${padding}`],
        glow && styles.glow,
        className
      )}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      {children}
    </Tag>
  );
}
