"use client";

import type { WeatherUnit } from "@/types/geography";

interface LocationSearchProps {
  searchInput: string;
  unit: WeatherUnit;
  onSearchChange: (v: string) => void;
  onUnitChange: (u: WeatherUnit) => void;
  onSearch: () => void;
}

export function LocationSearch({
  searchInput, unit, onSearchChange, onUnitChange, onSearch,
}: LocationSearchProps) {
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") onSearch(); };

  return (
    <div className="flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-stretch">
      {/* Combined search input + button */}
      <div className="flex flex-col min-[900px]:flex-row min-[900px]:items-stretch border-[1.5px] border-[var(--ink)] flex-1">
        <div className="flex flex-col flex-1 min-w-0">
          <label
            htmlFor="city-search"
            className="ed-label-muted uppercase p-[6px_14px_0] tracking-[0.22em]"
          >
            City
          </label>
          <input
            id="city-search"
            type="search"
            className="bg-paper text-ink font-body border-0 outline-none p-[2px_14px_10px] text-[0.938rem] min-w-0 w-full"
            placeholder="e.g. Berlin, Tokyo, São Paulo, New York"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKey}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Search button */}
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search for city weather"
          className="ed-label-muted font-mono uppercase transition-colors tracking-[0.18em] py-3 px-5 bg-ink text-paper cursor-pointer border-none shrink-0 border-t-[1.5px] border-[var(--ink)] min-[900px]:border-t-0 min-[900px]:border-l-[1.5px]"
        >
          Search
        </button>
      </div>

      {/* Unit toggle — labelled group */}
      <fieldset
        className="flex items-stretch border-[1.5px] border-[var(--ink)] self-start min-[900px]:self-auto"
        style={{ padding: 0, margin: 0, border: "none" }}
      >
        <legend className="sr-only">Temperature unit</legend>
        <div className="flex items-stretch border-[1.5px] border-[var(--ink)]">
          {(["imperial", "metric"] as WeatherUnit[]).map((u, i) => {
            const label = u === "imperial" ? "°F" : "°C";
            const isActive = unit === u;
            return (
              <button
                key={u}
                type="button"
                onClick={() => onUnitChange(u)}
                aria-pressed={isActive}
                aria-label={`Show temperatures in ${u === "imperial" ? "Fahrenheit" : "Celsius"}`}
                className={`ed-label-muted font-mono uppercase transition-colors tracking-[0.18em] py-3 px-5 cursor-pointer border-none min-h-[44px]${isActive ? " bg-ink text-paper" : " bg-transparent text-ink-2"}${i > 0 ? " border-l-[1.5px] border-[var(--ink)]" : ""}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
