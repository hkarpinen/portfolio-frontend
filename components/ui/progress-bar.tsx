import * as Progress from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
import styles from "./progress-bar.module.css";

type ProgressColor = "accent" | "success" | "warning" | "danger";

interface ProgressBarProps {
  value: number; // 0–100
  color?: ProgressColor;
  height?: number;
  className?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  color = "accent",
  height = 6,
  className,
  animated = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <Progress.Root
      className={cn(styles.track, className)}
      style={{ height }}
      value={clamped}
    >
      <Progress.Indicator
        className={cn(styles.fill, styles[color], animated && styles.animated)}
        style={{ width: `${clamped}%`, transform: "none" }}
      />
    </Progress.Root>
  );
}
