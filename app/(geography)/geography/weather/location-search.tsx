"use client";

import { Icon } from "@/components/editorial";
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
    <div className="row" style={{ gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
      {/* City search — ported .search-wrap */}
      <div className="search-wrap">
        <Icon name="search" size={15} aria-hidden />
        <input
          id="city-search"
          type="search"
          placeholder="Search a city — Berlin, Tokyo, São Paulo…"
          aria-label="Search city"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKey}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* Unit toggle — ported .segmented (button.on) */}
      <div className="segmented" role="group" aria-label="Temperature unit">
        {[WeatherUnit.Imperial, WeatherUnit.Metric].map((u) => {
          const label = u === WeatherUnit.Imperial ? "°F" : "°C";
          const isActive = unit === u;
          return (
            <button
              key={u}
              type="button"
              onClick={() => onUnitChange(u)}
              aria-pressed={isActive}
              aria-label={`Show temperatures in ${u === WeatherUnit.Imperial ? "Fahrenheit" : "Celsius"}`}
              className={isActive ? "on" : undefined}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
