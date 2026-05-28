"use client";

import React from "react";

/**
 * One pill in the Monthly · Quarterly · Yearly tab strip above the
 * contributions list. Pure presentation; parent tracks which is active.
 */
export function GranularityButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer px-7 py-3 text-base transition-all duration-[110ms] ${
        active
          ? "bg-red-soft font-bold text-red [border:1.5px_solid_var(--red)]"
          : "border-ink bg-paper-2 font-medium text-ink-3"
      }`}
    >
      {label}
    </button>
  );
}
