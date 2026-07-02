"use client";

import { useState, useEffect } from "react";
import { useWeather } from "@/hooks/use-weather";

import { WeatherMap } from "./weather-map";
import { LocationSearch } from "./location-search";
import { WeatherUnit, type GeoCoordinates } from "@/types/geography";

function celsiusToFahrenheit(c: number) {
  return (c * 9) / 5 + 32;
}
function msToMph(ms: number) {
  return ms * 2.237;
}

/** Returns just the numeric temperature in the active unit (no degree glyph). */
function tempValue(celsius: number, unit: WeatherUnit) {
  const value = unit === WeatherUnit.Imperial ? celsiusToFahrenheit(celsius) : celsius;
  return Math.round(value);
}
function unitLetter(unit: WeatherUnit) {
  return unit === WeatherUnit.Imperial ? "F" : "C";
}
function formatTemp(celsius: number, unit: WeatherUnit) {
  return `${tempValue(celsius, unit)}°${unitLetter(unit)}`;
}
function formatWind(ms: number, unit: WeatherUnit) {
  return unit === WeatherUnit.Imperial ? `${msToMph(ms).toFixed(1)} mph` : `${ms.toFixed(1)} m/s`;
}
function formatVisibility(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
}

interface RecentSearch {
  city: string;
  country: string;
  tempCelsius: number;
}

export function WeatherClient() {
  const [searchInput, setSearchInput] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [unit, setUnit] = useState<WeatherUnit>(WeatherUnit.Imperial);
  const [coords, setCoords] = useState<GeoCoordinates | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentSearch[]>([]);

  const { data: weather, isLoading, isError } = useWeather(city);

  useEffect(() => {
    if (weather) setCoords({ latitude: weather.latitude, longitude: weather.longitude });
  }, [weather]);

  // Record successful lookups for the // RECENT_SEARCHES stack (real,
  // client-derived history — the WeatherDto has no recent-search field).
  useEffect(() => {
    if (!weather) return;
    setRecent((prev) => {
      const key = `${weather.city}, ${weather.country}`;
      const next = prev.filter((r) => `${r.city}, ${r.country}` !== key);
      next.unshift({
        city: weather.city,
        country: weather.country,
        tempCelsius: weather.temperatureCelsius,
      });
      return next.slice(0, 4);
    });
  }, [weather]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported. Search a city to show the map.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setGeoError("Location access denied. Search a city to show the map."),
    );
  }, []);

  const search = () => {
    const trimmed = searchInput.trim();
    if (trimmed) setCity(trimmed);
  };

  return (
    <div className="page-enter">
      {/* ── Page head (ported .page-head / .kicker / .deck) ── */}
      <header className="page-head">
        <div className="titles">
          <div className="kicker" style={{ marginBottom: 8 }}>
            // TOOLS · WEATHER
          </div>
          <h1>Weather</h1>
          <p className="deck">
            Current conditions for any city, served through the Geography microservice.
            OpenWeather + Leaflet.
          </p>
        </div>
      </header>

      {/* ── Search row (.search-wrap + .segmented) ── */}
      <LocationSearch
        searchInput={searchInput}
        unit={unit}
        onSearchChange={setSearchInput}
        onUnitChange={setUnit}
        onSearch={search}
      />

      {/* Live region for loading / error announcements */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {isLoading && (
          <div className="label" style={{ marginBottom: 18, letterSpacing: "0.18em" }}>
            Fetching conditions…
          </div>
        )}
        {isError && (
          <div className="kicker" style={{ marginBottom: 18, letterSpacing: "0.18em" }}>
            City not found — try a different search.
          </div>
        )}
      </div>

      {/* ── Split: conditions card (left) + map / recent (right) ── */}
      <div className="split">
        <section>
          {weather ? (
            <div className="card">
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="kicker" style={{ marginBottom: 5 }}>
                    // CURRENT_LOCATION
                  </div>
                  <h2 style={{ fontSize: "1.375rem", marginBottom: 4 }}>
                    {weather.city}
                    <span style={{ color: "var(--text-3)" }}>, {weather.country}</span>
                  </h2>
                  <div className="label">
                    {Math.abs(weather.latitude).toFixed(2)}°{weather.latitude >= 0 ? "N" : "S"} ·{" "}
                    {Math.abs(weather.longitude).toFixed(2)}°{weather.longitude >= 0 ? "E" : "W"}
                  </div>
                </div>
                <span className="badge green">
                  <span className="dot" />
                  Updated now
                </span>
              </div>

              {/* Big amber temperature numeral + conditions */}
              <div className="row" style={{ marginTop: 20, alignItems: "flex-end", gap: 22 }}>
                <div
                  style={{
                    font: "700 4.5rem/0.9 var(--ff-mono)",
                    letterSpacing: "-.03em",
                    color: "var(--amber)",
                  }}
                >
                  {tempValue(weather.temperatureCelsius, unit)}°
                  <span style={{ fontSize: "2rem", color: "var(--text-3)" }}>
                    {unitLetter(unit)}
                  </span>
                </div>
                <div style={{ flex: 1, paddingBottom: 6 }}>
                  <div
                    style={{
                      font: "700 1rem/1 var(--ff-mono)",
                      color: "var(--text)",
                      marginBottom: 6,
                      textTransform: "capitalize",
                    }}
                  >
                    {weather.description}
                  </div>
                  <div className="label" style={{ lineHeight: 1.9 }}>
                    Feels like {formatTemp(weather.feelsLikeCelsius, unit)}
                    <br />
                    {formatWind(weather.windSpeedMs, unit)} · {weather.humidity}% humidity
                  </div>
                </div>
              </div>

              <div className="divider-hr" />

              {/*
                NEXT_12_HOURS in the prototype is an hourly forecast grid.
                DATA GAP: WeatherDto exposes only *current* conditions — no
                hourly array — so we render the prototype's 6-cell grid
                structure populated with the real current-condition metrics
                instead of fabricating fake hours.
              */}
              <div className="label" style={{ marginBottom: 12 }}>
                // CURRENT_METRICS
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6 }}>
                {[
                  { label: "Temp", value: formatTemp(weather.temperatureCelsius, unit), lead: true },
                  { label: "Feels", value: formatTemp(weather.feelsLikeCelsius, unit) },
                  { label: "Humid", value: `${weather.humidity}%` },
                  { label: "Wind", value: formatWind(weather.windSpeedMs, unit) },
                  { label: "Press", value: `${weather.pressure}` },
                  { label: "Vis", value: formatVisibility(weather.visibilityMeters) },
                ].map((cell) => (
                  <div
                    key={cell.label}
                    style={{
                      textAlign: "center",
                      padding: "10px 4px",
                      border: `1px solid ${cell.lead ? "var(--amber)" : "var(--border)"}`,
                      background: cell.lead ? "var(--amber-dim)" : "transparent",
                    }}
                  >
                    <div className="label">{cell.label}</div>
                    <div
                      style={{
                        font: "700 1rem/1.1 var(--ff-mono)",
                        color: cell.lead ? "var(--amber)" : "var(--text)",
                        margin: "6px 0 0",
                      }}
                    >
                      {cell.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !isLoading &&
            !isError && (
              <div className="card">
                <div className="kicker" style={{ marginBottom: 5 }}>
                  // CURRENT_LOCATION
                </div>
                <p className="deck" style={{ marginTop: 6 }}>
                  Search a city above to load current conditions.
                </p>
              </div>
            )
          )}
        </section>

        <aside>
          {/* Map — real Leaflet when coords resolve, else ported .map placeholder */}
          {coords ? (
            <WeatherMap coords={coords} />
          ) : geoError ? (
            <div className="map" role="note">
              <div className="pin" />
              <span>{geoError}</span>
            </div>
          ) : (
            <div className="map" role="img" aria-label="Map pending">
              <div className="pin" />
              <span>// MAP_PENDING</span>
            </div>
          )}

          {/* Recent searches — real client-tracked history */}
          <div className="card" style={{ marginTop: 12 }}>
            <div className="label" style={{ marginBottom: 10 }}>
              // RECENT_SEARCHES
            </div>
            {recent.length > 0 ? (
              <div className="stack">
                {recent.map((r) => (
                  <button
                    key={`${r.city}-${r.country}`}
                    type="button"
                    onClick={() => setCity(`${r.city}, ${r.country}`)}
                    className="row"
                    style={{
                      padding: "9px 0",
                      justifyContent: "space-between",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid var(--border)",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <span style={{ font: "500 0.75rem/1 var(--ff-mono)", color: "var(--text)" }}>
                      {r.city}, {r.country}
                    </span>
                    <span style={{ font: "400 0.68rem/1 var(--ff-mono)", color: "var(--text-4)" }}>
                      {tempValue(r.tempCelsius, unit)}°{unitLetter(unit)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="label" style={{ lineHeight: 1.9 }}>
                No searches yet.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
