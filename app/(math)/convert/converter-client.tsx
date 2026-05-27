"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchConversion, fetchUnits } from "@/lib/api/math";
import { mathKeys } from "@/lib/query-keys";
import { SectionHeader } from "@/components/editorial/section-header";
import { CategoryTabs } from "./category-tabs";
import type { UnitCategoryDto } from "@/types/math";

const CATEGORY_ORDER = [
  "length", "weight", "temperature", "volume", "speed", "area", "data",
];

/** Sensible default from/to unit pairs per backend category slug.
 *  Unit strings must match the backend /api/math/convert/units response exactly. */
const DEFAULT_UNITS: Record<string, { from: string; to: string }> = {
  length:      { from: "m",   to: "ft" },
  weight:      { from: "kg",  to: "lb" },
  temperature: { from: "c",   to: "f" },
  volume:      { from: "l",   to: "gal" },
  speed:       { from: "m_s", to: "mph" },
  area:        { from: "m2",  to: "ft2" },
  data:        { from: "gb",  to: "mb" },
};

/** Quick-reference chips displayed below the converter for the active category.
 *  Unit strings must match the backend /api/math/convert/units response exactly. */
const QUICK_VALUES: Record<string, { label: string; from: string; to: string; value: number }[]> = {
  length: [
    { label: "1 m = 3.28 ft",    from: "m",   to: "ft", value: 1 },
    { label: "1 mi = 1.61 km",   from: "mi",  to: "km", value: 1 },
    { label: "1 in = 2.54 cm",   from: "in",  to: "cm", value: 1 },
    { label: "100 yd = 91.4 m",  from: "yd",  to: "m",  value: 100 },
  ],
  weight: [
    { label: "1 kg = 2.205 lb",  from: "kg",  to: "lb", value: 1 },
    { label: "1 oz = 28.35 g",   from: "oz",  to: "g",  value: 1 },
    { label: "1 t = 1000 kg",    from: "t",   to: "kg", value: 1 },
    { label: "1 st = 6.35 kg",   from: "st",  to: "kg", value: 1 },
  ],
  temperature: [
    { label: "0 °C = 32 °F",    from: "c",  to: "f", value: 0 },
    { label: "100 °C = 212 °F", from: "c",  to: "f", value: 100 },
    { label: "37 °C = 98.6 °F", from: "c",  to: "f", value: 37 },
    { label: "−40 °C = −40 °F", from: "c",  to: "f", value: -40 },
  ],
  volume: [
    { label: "1 L = 0.264 gal",    from: "l",     to: "gal", value: 1 },
    { label: "1 fl oz = 29.6 mL",  from: "fl_oz", to: "ml",  value: 1 },
    { label: "1 pt = 0.473 L",     from: "pt",    to: "l",   value: 1 },
    { label: "1 qt = 0.946 L",     from: "qt",    to: "l",   value: 1 },
  ],
  speed: [
    { label: "1 m/s = 2.24 mph",    from: "m_s",  to: "mph",  value: 1 },
    { label: "100 km/h = 62 mph",   from: "km_h", to: "mph",  value: 100 },
    { label: "1 kt = 1.85 km/h",    from: "kt",   to: "km_h", value: 1 },
  ],
  area: [
    { label: "1 m² = 10.76 ft²",   from: "m2",  to: "ft2",  value: 1 },
    { label: "1 ac = 4047 m²",     from: "acre", to: "m2",  value: 1 },
    { label: "1 km² = 247 ac",     from: "km2",  to: "acre", value: 1 },
  ],
  data: [
    { label: "1 GB = 1000 MB",     from: "gb", to: "mb", value: 1 },
    { label: "1 TB = 1000 GB",     from: "tb", to: "gb", value: 1 },
    { label: "1 KB = 1000 B",      from: "kb", to: "b",  value: 1 },
  ],
};

function formatNumber(n: number): string {
  const s = n.toFixed(10).replace(/\.?0+$/, "");
  const [int, dec] = s.split(".");
  const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${intFmt}.${dec}` : intFmt;
}

export function ConverterClient() {
  const [valueInput, setValueInput]         = useState("1");
  const [from, setFrom]                     = useState("");
  const [to, setTo]                         = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [defaultsApplied, setDefaultsApplied] = useState(false);

  const { data: categories, isLoading: loadingUnits } = useQuery({
    queryKey: mathKeys.units(),
    queryFn:  fetchUnits,
    staleTime: Infinity,
  });

  // Apply default units for the "length" category once units load
  useEffect(() => {
    if (!categories || defaultsApplied) return;
    const lengthCat = categories.find((c) => c.category === "length");
    if (!lengthCat) return;
    const defaults = DEFAULT_UNITS["length"];
    const defaultFrom = lengthCat.units.find((u) => u === defaults.from) ?? lengthCat.units[0];
    const defaultTo   = lengthCat.units.find((u) => u === defaults.to)   ?? lengthCat.units[1] ?? "";
    setFrom(defaultFrom ?? "");
    setTo(defaultTo);
    setActiveCategory("length");
    setDefaultsApplied(true);
  }, [categories, defaultsApplied]);

  const value      = parseFloat(valueInput);
  const canConvert = !!from && !!to && !isNaN(value);

  const { data: result, isError, isFetching } = useQuery({
    queryKey: mathKeys.conversion(from, to, value),
    queryFn:  () => fetchConversion(from, to, value),
    enabled:  canConvert,
    staleTime: Infinity,
    retry: false,
  });

  const sorted: UnitCategoryDto[] = categories
    ? [...categories].sort(
        (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
      )
    : [];

  const scopedCategories = activeCategory
    ? sorted.filter((c) => c.category === activeCategory)
    : sorted;

  function selectCategory(cat: string) {
    const next = activeCategory === cat ? null : cat;
    setActiveCategory(next);
    if (next) {
      const catDef = sorted.find((c) => c.category === next);
      const defaults = DEFAULT_UNITS[next];
      // Apply defaults for the newly selected category if units exist
      if (catDef && defaults) {
        const newFrom = catDef.units.find((u) => u === defaults.from) ?? catDef.units[0] ?? "";
        const newTo   = catDef.units.find((u) => u === defaults.to)   ?? catDef.units[1] ?? "";
        setFrom(newFrom);
        setTo(newTo);
      } else {
        if (from && !catDef?.units.includes(from)) setFrom("");
        if (to   && !catDef?.units.includes(to))   setTo("");
      }
    }
  }

  function handleFromChange(unit: string) {
    setFrom(unit);
    const cat = categories?.find((c) => c.units.includes(unit))?.category ?? null;
    setActiveCategory(cat);
    const toCat = categories?.find((c) => c.units.includes(to))?.category;
    if (cat && toCat && cat !== toCat) setTo("");
  }

  function handleToChange(unit: string) {
    setTo(unit);
    const cat = categories?.find((c) => c.units.includes(unit))?.category ?? null;
    setActiveCategory(cat);
    const fromCat = categories?.find((c) => c.units.includes(from))?.category;
    if (cat && fromCat && cat !== fromCat) setFrom("");
  }

  function swap() { setFrom(to); setTo(from); }

  function applyQuickValue(chip: { from: string; to: string; value: number }) {
    const cat = categories?.find((c) => c.units.includes(chip.from))?.category ?? null;
    setFrom(chip.from);
    setTo(chip.to);
    setValueInput(String(chip.value));
    setActiveCategory(cat);
  }

  const unitOptions = (units: UnitCategoryDto[]) =>
    units.map((cat) => (
      <optgroup key={cat.category} label={cat.category.toUpperCase()}>
        {cat.units.map((u) => <option key={u} value={u}>{u}</option>)}
      </optgroup>
    ));

  const resultText = result ? formatNumber(result.outputValue) : "—";

  const quickChips = activeCategory ? (QUICK_VALUES[activeCategory] ?? []) : [];

  return (
    <div className="page-enter flex flex-col gap-10">
      <SectionHeader
        kicker="Math · Utilities"
        title="Convert."
        subtitle="Length, mass, temperature, volume, speed, area, and data — type either side. Served through the Math microservice."
      />

      <div className="flex flex-col gap-6">
        <CategoryTabs sorted={sorted} activeCategory={activeCategory} onSelect={selectCategory} />

        <div className="bg-paper-2 border-ink shadow-stamp">
          {/* From */}
          <div>
            <label htmlFor="convert-value" className="ed-convert-label">From</label>
            <div className="ed-convert-field">
              <input
                id="convert-value"
                type="number"
                inputMode="decimal"
                className="ed-convert-num"
                placeholder="0"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                aria-describedby="convert-status"
              />
              <label htmlFor="convert-from-unit" className="sr-only">Convert from unit</label>
              <select
                id="convert-from-unit"
                className="ed-convert-unit"
                value={from}
                onChange={(e) => handleFromChange(e.target.value)}
                disabled={loadingUnits}
              >
                <option value="">— choose unit —</option>
                {unitOptions(scopedCategories)}
              </select>
            </div>
          </div>

          {/* Swap */}
          <div className="ed-convert-swap-row">
            <button
              type="button"
              onClick={swap}
              disabled={!from || !to}
              aria-label="Swap from and to units"
              className="ed-convert-swap"
            >
              <span aria-hidden="true">⇄</span>
            </button>
          </div>

          {/* To */}
          <div>
            <p className="ed-convert-label" aria-hidden="true">To</p>
            <div className="ed-convert-field">
              <output
                htmlFor="convert-value convert-from-unit"
                className="ed-convert-num ed-convert-num-out"
                aria-label={`Result: ${resultText} ${to}`}
              >
                {resultText}
              </output>
              <label htmlFor="convert-to-unit" className="sr-only">Convert to unit</label>
              <select
                id="convert-to-unit"
                className="ed-convert-unit"
                value={to}
                onChange={(e) => handleToChange(e.target.value)}
                disabled={loadingUnits}
              >
                <option value="">— choose unit —</option>
                {unitOptions(from ? sorted.filter((c) => c.units.includes(from)) : scopedCategories)}
              </select>
            </div>
          </div>
        </div>

        {/* Live status region */}
        <div id="convert-status" role="status" aria-live="polite" aria-atomic="true">
          {isFetching && <p className="ed-convert-status">Computing…</p>}
          {isError && (
            <p className="ed-convert-status ed-convert-status-err">
              Incompatible units — both must belong to the same category.
            </p>
          )}
          {result && !isError && (
            <p className="ed-convert-status">
              {formatNumber(result.inputValue)} {result.from} = {formatNumber(result.outputValue)} {result.to}
            </p>
          )}
        </div>

        {/* Quick Values chips */}
        {quickChips.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="ed-kicker">Quick Values</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Quick conversion examples">
              {quickChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => applyQuickValue(chip)}
                  aria-label={`Apply conversion: ${chip.label}`}
                  className="font-mono text-[0.72rem] tracking-[0.1em] uppercase px-3 py-2 min-h-[36px] border-[1.5px] border-[color:var(--ink-3)] text-ink-2 bg-transparent cursor-pointer hover:border-[color:var(--ink)] hover:text-ink transition-colors"
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
