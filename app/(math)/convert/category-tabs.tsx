"use client";

import type { UnitCategoryDto } from "@/types/math";

/** Display-name overrides: backend category slug → user-facing label */
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

export function CategoryTabs({ sorted, activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <div role="tablist" aria-label="Conversion category" className="ed-utility-tabs">
      {sorted.map((cat) => (
        <button
          key={cat.category}
          role="tab"
          aria-selected={activeCategory === cat.category}
          onClick={() => onSelect(cat.category)}
          className="ed-utility-tab"
        >
          {categoryLabel(cat.category)}
        </button>
      ))}
    </div>
  );
}
