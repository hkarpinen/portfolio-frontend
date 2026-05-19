import React from "react";

/* ── StatCard ───────────────────────────────────────────────────────────────*/
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  trendDir?: "up" | "down";
  italic?: boolean;
}

export function StatCard({ label, value, sub, trend, trendDir, italic }: StatCardProps) {
  return (
    <div
      className="flex flex-col justify-end"
      style={{ padding: "16px 20px" }}
    >
      <p
        className="font-mono uppercase"
        style={{ fontSize: "0.594rem", color: "var(--ink-3)", letterSpacing: "0.22em", marginBottom: 8 }}
      >
        {label}
      </p>
      <p
        className="font-serif leading-[0.9]"
        style={{
          fontSize: "2.375rem",
          letterSpacing: "-0.02em",
          color: italic ? "var(--red)" : "var(--ink)",
          fontStyle: italic ? "italic" : "normal",
        }}
      >
        {value}
      </p>
      {(sub || trend) && (
        <p
          className="font-mono mt-2"
          style={{
            fontSize: "0.6rem",
            color: trendDir === "up" ? "var(--green)" : trendDir === "down" ? "var(--red)" : "var(--ink-3)",
            letterSpacing: "0.08em",
          }}
        >
          {trend && <span>{trendDir === "up" ? "▲" : trendDir === "down" ? "▼" : ""} {trend} · </span>}
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── LedgerStrip ────────────────────────────────────────────────────────────*/
interface LedgerStripProps {
  label?: string;
  cells: StatCardProps[];
  columns?: number;
}

export function LedgerStrip({ label, cells, columns }: LedgerStripProps) {
  const cols = columns ?? cells.length;

  return (
    <div
      className="grid border-ink"
      style={{
        gridTemplateColumns: label
          ? `auto repeat(${cols}, 1fr)`
          : `repeat(${cols}, 1fr)`,
        borderRight: "none",
      }}
    >
      {label && (
        <div
          className="font-mono uppercase self-end"
          style={{
            fontSize: "0.594rem",
            color: "var(--ink-3)",
            letterSpacing: "0.22em",
            padding: "16px 26px 16px 0",
            borderRight: "1.5px solid var(--ink)",
            maxWidth: 200,
          }}
        >
          {label}
        </div>
      )}
      {cells.map((cell, i) => (
        <div
          key={i}
          style={{ borderRight: "1.5px solid var(--ink)" }}
        >
          <StatCard {...cell} />
        </div>
      ))}
    </div>
  );
}
