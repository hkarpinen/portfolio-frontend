"use client";

import type { UnitCategoryDto } from "@/types/math";

/** Display-name overrides: backend category slug -> user-facing label */
const CATEGORY_LABELS: Record<string, string> = {
  weight: "Mass",
};

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

interface CategoryTabsProps {
  sorted: UnitCategoryDto[];
  activeCategory: string | null;
  onSelect: (cat: string) => void;
}

/**
 * Ported prototype `.tabs` strip. Tabs stay stateful category buttons
 * (driving `useConverter`); `.tabs button` + `.tabs button[aria-selected]`
 * in globals.css supply the prototype styling and active amber underline.
 */
export function CategoryTabs({ sorted, activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <nav className="tabs" role="tablist" aria-label="Conversion category">
      {sorted.map((cat) => {
        const active = activeCategory === cat.category;
        return (
          <button
            key={cat.category}
            type="button"
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            onClick={() => onSelect(cat.category)}
          >
            {categoryLabel(cat.category)}
          </button>
        );
      })}
    </nav>
  );
}
