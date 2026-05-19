"use client";

import type { WeatherUnit } from "@/types/geography";

interface LocationSearchProps {
  cityInput: string;
  stateInput: string;
  unit: WeatherUnit;
  onCityChange: (v: string) => void;
  onStateChange: (v: string) => void;
  onUnitChange: (u: WeatherUnit) => void;
  onSearch: () => void;
}

const rule = "1.5px solid var(--ink)";

export function LocationSearch({
  cityInput, stateInput, unit, onCityChange, onStateChange, onUnitChange, onSearch,
}: LocationSearchProps) {
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") onSearch(); };

  return (
    <div className="flex items-stretch gap-3">
      {/* Search inputs + button */}
      <div className="flex items-stretch" style={{ border: rule }}>
        {/* City input */}
        <div className="flex flex-col" style={{ flex: 2, borderRight: rule }}>
          <label className="font-mono uppercase" style={{ fontSize: "0.525rem", letterSpacing: "0.22em", color: "var(--ink-3)", padding: "5px 14px 0" }}>
            City
          </label>
          <input
            className="bg-paper text-ink font-body"
            style={{ border: "none", outline: "none", padding: "2px 14px 8px", fontSize: "0.938rem" }}
            placeholder="Boise"
            value={cityInput}
            onChange={(e) => onCityChange(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        {/* State input */}
        <div className="flex flex-col" style={{ flex: 1, borderRight: rule }}>
          <label className="font-mono uppercase" style={{ fontSize: "0.525rem", letterSpacing: "0.22em", color: "var(--ink-3)", padding: "5px 14px 0" }}>
            State / Region
          </label>
          <input
            className="bg-paper text-ink font-body"
            style={{ border: "none", outline: "none", padding: "2px 14px 8px", fontSize: "0.938rem" }}
            placeholder="Idaho"
            value={stateInput}
            onChange={(e) => onStateChange(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        {/* Search button */}
        <button
          onClick={onSearch}
          className="font-mono uppercase transition-colors"
          style={{
            fontSize: "0.688rem", letterSpacing: "0.18em", padding: "0 20px",
            background: "var(--ink)", color: "var(--paper)",
            cursor: "pointer", border: "none",
          }}
        >
          Search
        </button>
      </div>

      {/* Unit toggle */}
      <div className="flex items-stretch" style={{ border: rule }}>
        {(["imperial", "metric"] as WeatherUnit[]).map((u, i) => (
          <button
            key={u}
            onClick={() => onUnitChange(u)}
            className="font-mono uppercase transition-colors"
            style={{
              fontSize: "0.688rem", letterSpacing: "0.18em", padding: "0 14px",
              background: unit === u ? "var(--ink)" : "transparent",
              color: unit === u ? "var(--paper)" : "var(--ink-2)",
              cursor: "pointer", border: "none",
              borderLeft: i > 0 ? rule : "none",
            }}
          >
            {u === "imperial" ? "°F" : "°C"}
          </button>
        ))}
      </div>
    </div>
  );
}
