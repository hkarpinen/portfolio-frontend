"use client";

import type { UnitCategoryDto } from "@/types/math";

const rule = "1.5px solid var(--ink)";

interface CategoryTabsProps {
  sorted: UnitCategoryDto[];
  activeCategory: string | null;
  onSelect: (cat: string) => void;
}

export function CategoryTabs({ sorted, activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      style={{ padding: "10px 14px", borderBottom: rule, background: "var(--paper-2)" }}
    >
      <span
        className="font-mono uppercase shrink-0 text-ink-3"
        style={{ fontSize: "0.525rem", letterSpacing: "0.22em" }}
      >
        Category
      </span>
      {sorted.map((cat) => {
        const on = activeCategory === cat.category;
        return (
          <button
            key={cat.category}
            onClick={() => onSelect(cat.category)}
            className="font-mono uppercase transition-colors"
            style={{
              fontSize: "0.525rem",
              letterSpacing: "0.18em",
              padding: "3px 9px",
              border: rule,
              background: on ? "var(--ink)" : "transparent",
              color: on ? "var(--paper)" : "var(--ink-2)",
              cursor: "pointer",
            }}
          >
            {on && <span style={{ color: "var(--red)", marginRight: 4 }}>▸</span>}
            {cat.category}
          </button>
        );
      })}
    </div>
  );
}
