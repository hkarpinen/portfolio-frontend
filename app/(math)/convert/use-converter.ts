"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchConversion, fetchUnits } from "@/lib/api/math";
import { mathKeys } from "@/lib/query-keys";
import type { UnitCategoryDto } from "@/types/math";
import { CATEGORY_ORDER, DEFAULT_UNITS } from "./convert-config";

/**
 * State + data hook for the unit converter.
 *
 * Pulls the units catalog and the live conversion through React Query,
 * exposes every callback the UI needs, and owns the cross-cutting
 * "category follows unit, units follow category" coordination.
 *
 * Returned cleanly so the rendering file (`converter-client.tsx`) reads as
 * straight JSX with no inline business logic.
 */
export function useConverter() {
  const [valueInput, setValueInput] = useState("1");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [defaultsApplied, setDefaultsApplied] = useState(false);

  const { data: categories, isLoading: loadingUnits } = useQuery({
    queryKey: mathKeys.units(),
    queryFn: fetchUnits,
    staleTime: Infinity,
  });

  // Apply default units for the "length" category once the units catalog loads.
  useEffect(() => {
    if (!categories || defaultsApplied) return;
    const lengthCat = categories.find((c) => c.category === "length");
    if (!lengthCat) return;
    const defaults = DEFAULT_UNITS["length"];
    const defaultFrom = lengthCat.units.find((u) => u === defaults.from) ?? lengthCat.units[0];
    const defaultTo = lengthCat.units.find((u) => u === defaults.to) ?? lengthCat.units[1] ?? "";
    setFrom(defaultFrom ?? "");
    setTo(defaultTo);
    setActiveCategory("length");
    setDefaultsApplied(true);
  }, [categories, defaultsApplied]);

  const value = parseFloat(valueInput);
  const canConvert = !!from && !!to && !isNaN(value);

  const conversion = useQuery({
    queryKey: mathKeys.conversion(from, to, value),
    queryFn: () => fetchConversion(from, to, value),
    enabled: canConvert,
    staleTime: Infinity,
    retry: false,
  });

  const sorted: UnitCategoryDto[] = useMemo(
    () =>
      categories
        ? [...categories].sort(
            (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
          )
        : [],
    [categories],
  );

  const scopedCategories = activeCategory
    ? sorted.filter((c) => c.category === activeCategory)
    : sorted;

  function selectCategory(cat: string) {
    const next = activeCategory === cat ? null : cat;
    setActiveCategory(next);
    if (next) {
      const catDef = sorted.find((c) => c.category === next);
      const defaults = DEFAULT_UNITS[next];
      if (catDef && defaults) {
        const newFrom = catDef.units.find((u) => u === defaults.from) ?? catDef.units[0] ?? "";
        const newTo = catDef.units.find((u) => u === defaults.to) ?? catDef.units[1] ?? "";
        setFrom(newFrom);
        setTo(newTo);
      } else {
        if (from && !catDef?.units.includes(from)) setFrom("");
        if (to && !catDef?.units.includes(to)) setTo("");
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

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function applyQuickValue(chip: { from: string; to: string; value: number }) {
    const cat = categories?.find((c) => c.units.includes(chip.from))?.category ?? null;
    setFrom(chip.from);
    setTo(chip.to);
    setValueInput(String(chip.value));
    setActiveCategory(cat);
  }

  return {
    // state
    valueInput,
    setValueInput,
    from,
    to,
    activeCategory,
    sorted,
    scopedCategories,
    loadingUnits,
    // result
    result: conversion.data,
    isError: conversion.isError,
    isFetching: conversion.isFetching,
    // actions
    selectCategory,
    handleFromChange,
    handleToChange,
    swap,
    applyQuickValue,
  };
}
