"use client";

import { SectionHeader } from "@/components/editorial";
import { CategoryTabs } from "./category-tabs";
import { useConverter } from "./use-converter";
import { QUICK_VALUES, formatNumber } from "./convert-config";
import type { UnitCategoryDto } from "@/types/math";

function unitOptions(units: UnitCategoryDto[]) {
  return units.map((cat) => (
    <optgroup key={cat.category} label={cat.category.toUpperCase()}>
      {cat.units.map((u) => (
        <option key={u} value={u}>
          {u}
        </option>
      ))}
    </optgroup>
  ));
}

export function ConverterClient() {
  const c = useConverter();
  const resultText = c.result ? formatNumber(c.result.outputValue) : "—";
  const quickChips = c.activeCategory ? (QUICK_VALUES[c.activeCategory] ?? []) : [];

  return (
    <div className="page-enter flex flex-col gap-10">
      <SectionHeader
        kicker="Math · Utilities"
        title="Convert."
        subtitle="Length, mass, temperature, volume, speed, area, and data — type either side. Served through the Math microservice."
      />

      <div className="flex flex-col gap-6">
        <CategoryTabs
          sorted={c.sorted}
          activeCategory={c.activeCategory}
          onSelect={c.selectCategory}
        />

        <div className="border-ink bg-paper-2 shadow-stamp">
          {/* From */}
          <div>
            <label htmlFor="convert-value" className="ed-convert-label">
              From
            </label>
            <div className="ed-convert-field">
              <input
                id="convert-value"
                type="number"
                inputMode="decimal"
                className="ed-convert-num"
                placeholder="0"
                value={c.valueInput}
                onChange={(e) => c.setValueInput(e.target.value)}
                aria-describedby="convert-status"
              />
              <label htmlFor="convert-from-unit" className="sr-only">
                Convert from unit
              </label>
              <select
                id="convert-from-unit"
                className="ed-convert-unit"
                value={c.from}
                onChange={(e) => c.handleFromChange(e.target.value)}
                disabled={c.loadingUnits}
              >
                <option value="">— choose unit —</option>
                {unitOptions(c.scopedCategories)}
              </select>
            </div>
          </div>

          {/* Swap */}
          <div className="ed-convert-swap-row">
            <button
              type="button"
              onClick={c.swap}
              disabled={!c.from || !c.to}
              aria-label="Swap from and to units"
              className="ed-convert-swap"
            >
              <span aria-hidden="true">⇄</span>
            </button>
          </div>

          {/* To */}
          <div>
            <p className="ed-convert-label" aria-hidden="true">
              To
            </p>
            <div className="ed-convert-field">
              <output
                htmlFor="convert-value convert-from-unit"
                className="ed-convert-num ed-convert-num-out"
                aria-label={`Result: ${resultText} ${c.to}`}
              >
                {resultText}
              </output>
              <label htmlFor="convert-to-unit" className="sr-only">
                Convert to unit
              </label>
              <select
                id="convert-to-unit"
                className="ed-convert-unit"
                value={c.to}
                onChange={(e) => c.handleToChange(e.target.value)}
                disabled={c.loadingUnits}
              >
                <option value="">— choose unit —</option>
                {unitOptions(
                  c.from ? c.sorted.filter((cat) => cat.units.includes(c.from)) : c.scopedCategories,
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Live status region */}
        <div id="convert-status" role="status" aria-live="polite" aria-atomic="true">
          {c.isFetching && <p className="ed-convert-status">Computing…</p>}
          {c.isError && (
            <p className="ed-convert-status ed-convert-status-err">
              Incompatible units — both must belong to the same category.
            </p>
          )}
          {c.result && !c.isError && (
            <p className="ed-convert-status">
              {formatNumber(c.result.inputValue)} {c.result.from} ={" "}
              {formatNumber(c.result.outputValue)} {c.result.to}
            </p>
          )}
        </div>

        {/* Quick Values chips */}
        {quickChips.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="ed-kicker">Quick Values</p>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Quick conversion examples"
            >
              {quickChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => c.applyQuickValue(chip)}
                  aria-label={`Apply conversion: ${chip.label}`}
                  className="min-h-18 cursor-pointer border-[1.5px] border-[color:var(--ink-3)] bg-transparent px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] text-ink-2 transition-colors hover:border-[color:var(--ink)] hover:text-ink"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
