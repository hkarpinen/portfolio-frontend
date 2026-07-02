"use client";

import { Icon } from "@/components/editorial";
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
    <div className="page-enter">
      {/* ── Page head (ported .page-head / .kicker / .deck) ── */}
      <header className="page-head">
        <div className="titles">
          <div className="kicker" style={{ marginBottom: 8 }}>
            // TOOLS · CONVERT
          </div>
          <h1>Convert</h1>
          <p className="deck">
            Length, mass, temperature, volume, speed, area, data. Type the left side —
            served through the Math microservice.
          </p>
        </div>
      </header>

      {/* ── Category tabs (ported .tabs) ── */}
      <CategoryTabs
        sorted={c.sorted}
        activeCategory={c.activeCategory}
        onSelect={c.selectCategory}
      />

      {/* ── Converter card ── */}
      <div className="card" style={{ maxWidth: 660 }}>
        <div className="stack stack-5">
          {/* FROM — big amber number input + unit select */}
          <div className="field">
            <label htmlFor="convert-value">// FROM</label>
            <div className="convert-io">
              <input
                id="convert-value"
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={c.valueInput}
                onChange={(e) => c.setValueInput(e.target.value)}
                aria-describedby="convert-status"
                className="convert-value"
                style={{ color: "var(--amber)" }}
              />
              <label htmlFor="convert-from-unit" className="sr-only">
                Convert from unit
              </label>
              <select
                id="convert-from-unit"
                value={c.from}
                onChange={(e) => c.handleFromChange(e.target.value)}
                disabled={c.loadingUnits}
                className="convert-unit"
              >
                <option value="">— choose unit —</option>
                {unitOptions(c.scopedCategories)}
              </select>
            </div>
          </div>

          {/* Swap — centered .btn.btn-icon */}
          <div className="row" style={{ justifyContent: "center" }}>
            <button
              type="button"
              className="btn btn-icon"
              onClick={c.swap}
              disabled={!c.from || !c.to}
              aria-label="Swap from and to units"
            >
              <Icon name="swap" size={16} strokeWidth={2} aria-hidden />
            </button>
          </div>

          {/* TO — big green result (derived, read-only) + unit select */}
          <div className="field">
            <label htmlFor="convert-to-unit">// TO</label>
            <div className="convert-io">
              <output
                htmlFor="convert-value convert-from-unit"
                aria-label={`Result: ${resultText} ${c.to}`}
                className="convert-value"
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "var(--raised)",
                  border: "1px solid var(--border)",
                  color: "var(--green)",
                }}
              >
                {resultText}
              </output>
              <select
                id="convert-to-unit"
                value={c.to}
                onChange={(e) => c.handleToChange(e.target.value)}
                disabled={c.loadingUnits}
                className="convert-unit"
              >
                <option value="">— choose unit —</option>
                {unitOptions(
                  c.from
                    ? c.sorted.filter((cat) => cat.units.includes(c.from))
                    : c.scopedCategories,
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Live status region */}
        <div
          id="convert-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{ marginTop: 12 }}
        >
          {c.isFetching && (
            <p className="label" style={{ letterSpacing: "0.14em" }}>
              Computing…
            </p>
          )}
          {c.isError && (
            <p className="kicker" style={{ letterSpacing: "0.14em" }}>
              Incompatible units — both must belong to the same category.
            </p>
          )}
          {c.result && !c.isError && (
            <p className="label" style={{ letterSpacing: "0.12em" }}>
              {formatNumber(c.result.inputValue)} {c.result.from} ={" "}
              {formatNumber(c.result.outputValue)} {c.result.to}
            </p>
          )}
        </div>

        <div className="divider-hr" />

        {/* Quick reference chips */}
        <div className="label" style={{ marginBottom: 10 }}>
          // QUICK_REF
        </div>
        {quickChips.length > 0 ? (
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }} role="group" aria-label="Quick conversion examples">
            {quickChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => c.applyQuickValue(chip)}
                aria-label={`Apply conversion: ${chip.label}`}
                className="badge"
                style={{ cursor: "pointer" }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="label" style={{ lineHeight: 1.9 }}>
            Select a category for quick references.
          </p>
        )}
      </div>
    </div>
  );
}
