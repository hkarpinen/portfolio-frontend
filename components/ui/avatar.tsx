import { cn } from "@/lib/utils";
import styles from "./avatar.module.css";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

const SIZES: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name, src, size = "md", online, className }: AvatarProps) {
  const px = SIZES[size];
  const fontSize = Math.round(px * 0.4);

  return (
    <span
      className={cn(styles.wrapper, className)}
      style={{ width: px, height: px, fontSize }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name ?? "Avatar"}
          className={styles.img}
          width={px}
          height={px}
        />
      ) : (
        <span className={styles.initials}>{getInitials(name)}</span>
      )}
      {online && <span className={styles.onlineDot} aria-label="Online" />}
    </span>
  );
}
