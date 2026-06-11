import React from "react";
import { Icon } from "./icon";

/**
 * <StatCard> — editorial stats (redesign)
 *
 * All visual rules in /app/globals.css under `.ed-stat*` / `.ed-numeral` /
 * `.ed-label-muted` classes. Zero inline styles.
 */

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  trendDir?: "up" | "down";
  italic?: boolean;
}

export function StatCard({ label, value, sub, trend, trendDir, italic }: StatCardProps) {
  const subClass =
    trendDir === "up"
      ? "ed-stat-sub-up"
      : trendDir === "down"
        ? "ed-stat-sub-down"
        : "ed-stat-sub-flat";
  return (
    <div className="ed-stat">
      <p className="ed-label-muted ed-stat-label">{label}</p>
      <p className={`ed-numeral ${italic ? "italic" : ""}`}>{value}</p>
      {(sub || trend) && (
        <p className={`ed-stat-sub ${subClass}`}>
          {trend && (
            <span className="inline-flex items-center gap-1">
              {trendDir === "up" ? (
                <Icon name="trendUp" size={11} strokeWidth={2.5} />
              ) : trendDir === "down" ? (
                <Icon name="trendDown" size={11} strokeWidth={2.5} />
              ) : null}
              {trend}
              {sub ? " · " : ""}
            </span>
          )}
          {sub}
        </p>
      )}
    </div>
  );
}

