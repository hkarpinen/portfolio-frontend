"use client";

import { WeatherUnit } from "@/types/geography";

interface LocationSearchProps {
  searchInput: string;
  unit: WeatherUnit;
  onSearchChange: (v: string) => void;
  onUnitChange: (u: WeatherUnit) => void;
  onSearch: () => void;
}

export function LocationSearch({
  searchInput,
  unit,
  onSearchChange,
  onUnitChange,
  onSearch,
}: LocationSearchProps) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-stretch">
      {/* Combined search input + button */}
      <div className="flex flex-1 flex-col border-[1.5px] border-[var(--ink)] min-[900px]:flex-row min-[900px]:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col">
          <label
            htmlFor="city-search"
            className="ed-label-muted p-[6px_14px_0] uppercase tracking-[0.22em]"
          >
            City
          </label>
          <input
            id="city-search"
            type="search"
            className="w-full min-w-0 border-0 bg-paper p-[2px_14px_10px] font-body text-[0.938rem] text-ink outline-none"
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
          className="ed-label-muted shrink-0 cursor-pointer border-t-[1.5px] border-none border-[var(--ink)] bg-ink px-5 py-3 font-mono uppercase tracking-[0.18em] text-paper transition-colors min-[900px]:border-l-[1.5px] min-[900px]:border-t-0"
        >
          Search
        </button>
      </div>

      {/* Unit toggle — labelled group */}
      <fieldset
        className="flex items-stretch self-start border-[1.5px] border-[var(--ink)] min-[900px]:self-auto"
        style={{ padding: 0, margin: 0, border: "none" }}
      >
        <legend className="sr-only">Temperature unit</legend>
        <div className="flex items-stretch border-[1.5px] border-[var(--ink)]">
          {[WeatherUnit.Imperial, WeatherUnit.Metric].map((u, i) => {
            const label = u === WeatherUnit.Imperial ? "°F" : "°C";
            const isActive = unit === u;
            return (
              <button
                key={u}
                type="button"
                onClick={() => onUnitChange(u)}
                aria-pressed={isActive}
                aria-label={`Show temperatures in ${u === WeatherUnit.Imperial ? "Fahrenheit" : "Celsius"}`}
                className={`ed-label-muted cursor-pointer border-none px-5 py-3 font-mono uppercase tracking-[0.18em] transition-colors min-h-11${isActive ? "bg-ink text-paper" : "bg-transparent text-ink-2"}${i > 0 ? "border-l-[1.5px] border-[var(--ink)]" : ""}`}
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
