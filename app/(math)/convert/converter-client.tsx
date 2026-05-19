"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchConversion, fetchUnits } from "@/lib/api/math";
import { mathKeys } from "@/lib/query-keys";
import { SectionHeader } from "@/components/editorial/section-header";
import { Btn } from "@/components/editorial/button";
import { CategoryTabs } from "./category-tabs";
import { ConversionResult } from "./conversion-result";
import type { UnitCategoryDto } from "@/types/math";

const CATEGORY_ORDER = [
  "length", "weight", "temperature", "volume", "speed", "area", "data",
];

const rule = "1.5px solid var(--ink)";

export function ConverterClient() {
  const [valueInput, setValueInput]         = useState("");
  const [from, setFrom]                     = useState("");
  const [to, setTo]                         = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [submitted, setSubmitted]           = useState(false);

  const { data: categories, isLoading: loadingUnits } = useQuery({
    queryKey: mathKeys.units(),
    queryFn:  fetchUnits,
    staleTime: Infinity,
  });

  const value      = parseFloat(valueInput);
  const canConvert = submitted && !!from && !!to && !isNaN(value);

  const { data: result, isLoading, isError, isFetching } = useQuery({
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
      if (from && !catDef?.units.includes(from)) { setFrom(""); setSubmitted(false); }
      if (to   && !catDef?.units.includes(to))   { setTo("");   setSubmitted(false); }
    }
  }

  function handleFromChange(unit: string) {
    setFrom(unit);
    setSubmitted(false);
    const cat = categories?.find((c) => c.units.includes(unit))?.category ?? null;
    setActiveCategory(cat);
    const toCat = categories?.find((c) => c.units.includes(to))?.category;
    if (cat && toCat && cat !== toCat) setTo("");
  }

  function handleToChange(unit: string) {
    setTo(unit);
    setSubmitted(false);
    const cat = categories?.find((c) => c.units.includes(unit))?.category ?? null;
    setActiveCategory(cat);
    const fromCat = categories?.find((c) => c.units.includes(from))?.category;
    if (cat && fromCat && cat !== fromCat) setFrom("");
  }

  function swap() { setFrom(to); setTo(from); setSubmitted(false); }
  function convert() { if (from && to && !isNaN(value) && valueInput) setSubmitted(true); }

  return (
    <div className="page-enter flex flex-col gap-10">
      <SectionHeader
        kicker="Math · Utilities"
        title="Convert."
        subtitle="Unit conversion across length, weight, temperature, volume, speed, area, and data — served through the Math microservice."
      />

      {/* Input block: category tabs + form fused into one structure */}
      <div style={{ border: rule }}>
        <CategoryTabs sorted={sorted} activeCategory={activeCategory} onSelect={selectCategory} />

        {/* Form row: Value | From | ⇄ | To | Convert */}
        <div className="flex items-stretch">
          {/* Value */}
          <div className="flex flex-col" style={{ width: 140, borderRight: rule, flexShrink: 0 }}>
            <label className="font-mono uppercase text-ink-3" style={{ fontSize: "0.525rem", letterSpacing: "0.22em", padding: "6px 14px 0" }}>
              Value
            </label>
            <input
              type="number"
              className="bg-paper text-ink font-body"
              style={{ border: "none", outline: "none", padding: "2px 14px 10px", fontSize: "1rem", width: "100%" }}
              placeholder="0"
              value={valueInput}
              onChange={(e) => { setValueInput(e.target.value); setSubmitted(false); }}
              onKeyDown={(e) => e.key === "Enter" && convert()}
            />
          </div>

          {/* From */}
          <div className="flex flex-col" style={{ flex: 1, borderRight: rule }}>
            <label className="font-mono uppercase text-ink-3" style={{ fontSize: "0.525rem", letterSpacing: "0.22em", padding: "6px 14px 0" }}>
              From
            </label>
            {loadingUnits ? (
              <div className="font-mono text-ink-3 px-[14px] pb-[10px]" style={{ fontSize: "0.7rem" }}>…</div>
            ) : (
              <select
                className="bg-paper text-ink font-body"
                style={{ border: "none", outline: "none", padding: "2px 14px 10px", fontSize: "0.938rem", cursor: "pointer" }}
                value={from}
                onChange={(e) => handleFromChange(e.target.value)}
              >
                <option value="">— unit —</option>
                {scopedCategories.map((cat) => (
                  <optgroup key={cat.category} label={cat.category.toUpperCase()}>
                    {cat.units.map((u) => <option key={u} value={u}>{u}</option>)}
                  </optgroup>
                ))}
              </select>
            )}
          </div>

          {/* Swap */}
          <button
            onClick={swap}
            disabled={!from || !to}
            title="Swap units"
            aria-label="Swap from and to units"
            className="font-mono text-ink shrink-0 flex items-center justify-center"
            style={{
              width: 44, border: "none", borderRight: rule, background: "var(--paper-2)",
              cursor: from && to ? "pointer" : "default",
              fontSize: "1.15rem", opacity: from && to ? 1 : 0.35,
            }}
          >
            ⇄
          </button>

          {/* To */}
          <div className="flex flex-col" style={{ flex: 1, borderRight: rule }}>
            <label className="font-mono uppercase text-ink-3" style={{ fontSize: "0.525rem", letterSpacing: "0.22em", padding: "6px 14px 0" }}>
              To
            </label>
            {loadingUnits ? (
              <div className="font-mono text-ink-3 px-[14px] pb-[10px]" style={{ fontSize: "0.7rem" }}>…</div>
            ) : (
              <select
                className="bg-paper text-ink font-body"
                style={{ border: "none", outline: "none", padding: "2px 14px 10px", fontSize: "0.938rem", cursor: "pointer" }}
                value={to}
                onChange={(e) => handleToChange(e.target.value)}
              >
                <option value="">— unit —</option>
                {(from ? sorted.filter((c) => c.units.includes(from)) : scopedCategories).map((cat) => (
                  <optgroup key={cat.category} label={cat.category.toUpperCase()}>
                    {cat.units.map((u) => <option key={u} value={u}>{u}</option>)}
                  </optgroup>
                ))}
              </select>
            )}
          </div>

          <Btn
            variant="primary"
            size="md"
            onClick={convert}
            disabled={!from || !to || isNaN(value) || !valueInput}
            style={{ borderRadius: 0, border: "none", alignSelf: "stretch", height: "auto" }}
          >
            Convert
          </Btn>
        </div>
      </div>

      <ConversionResult result={result} isLoading={isLoading} isFetching={isFetching} isError={isError} />
    </div>
  );
}
