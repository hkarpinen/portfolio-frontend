import React from "react";
import * as RadixProgress from "@radix-ui/react-progress";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "ink" | "red" | "green";
  height?: number;
}

export function ProgressBar({ value, max = 100, color = "ink", height = 6 }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  const fillColor = color === "red" ? "var(--red)" : color === "green" ? "var(--green)" : "var(--ink)";

  return (
    <RadixProgress.Root
      value={pct}
      style={{
        width: "100%",
        height,
        background: "var(--paper-3)",
        border: "1px solid var(--ink-3)",
        overflow: "hidden",
      }}
    >
      <RadixProgress.Indicator
        style={{
          height: "100%",
          width: `${pct}%`,
          background: fillColor,
          transition: "width 500ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </RadixProgress.Root>
  );
}
