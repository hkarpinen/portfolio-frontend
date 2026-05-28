"use client";

import { useState, useEffect } from "react";
import { useWeather } from "@/hooks/use-weather";
import { SectionHeader } from "@/components/editorial/section-header";
import { StatCard } from "@/components/editorial/stat-card";
import { WeatherMap } from "./weather-map";
import { LocationSearch } from "./location-search";
import { WeatherUnit, type GeoCoordinates } from "@/types/geography";

function celsiusToFahrenheit(c: number) {
  return (c * 9) / 5 + 32;
}
function msToMph(ms: number) {
  return ms * 2.237;
}

function formatTemp(celsius: number, unit: WeatherUnit) {
  const value = unit === WeatherUnit.Imperial ? celsiusToFahrenheit(celsius) : celsius;
  return `${Math.round(value)}°${unit === WeatherUnit.Imperial ? "F" : "C"}`;
}
function formatWind(ms: number, unit: WeatherUnit) {
  return unit === WeatherUnit.Imperial ? `${msToMph(ms).toFixed(1)} mph` : `${ms.toFixed(1)} m/s`;
}
function formatVisibility(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
}

export function WeatherClient() {
  const [searchInput, setSearchInput] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [unit, setUnit] = useState<WeatherUnit>(WeatherUnit.Imperial);
  const [coords, setCoords] = useState<GeoCoordinates | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const { data: weather, isLoading, isError } = useWeather(city);

  useEffect(() => {
    if (weather) setCoords({ latitude: weather.latitude, longitude: weather.longitude });
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
    // Pass the full combined input as the city query; the hook passes it as-is to the API.
    // TODO(handoff8): if the backend ever needs separate city/region params, split on "," here.
    if (trimmed) setCity(trimmed);
  };

  return (
    <div className="page-enter flex flex-col gap-10">
      <SectionHeader
        kicker="Geography · Live conditions"
        title="Weather."
        subtitle="Current conditions for any city, served through the Geography microservice."
      />

      <LocationSearch
        searchInput={searchInput}
        unit={unit}
        onSearchChange={setSearchInput}
        onUnitChange={setUnit}
        onSearch={search}
      />

      {/* Live region for loading / error announcements */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {isLoading && <p className="ed-label-muted tracking-[0.18em]">Fetching conditions…</p>}
        {isError && (
          <p className="ed-kicker tracking-[0.18em]">City not found — try a different search.</p>
        )}
      </div>

      {weather && (
        <div className="border-ink bg-paper shadow-stamp">
          <div className="border-ink-b flex flex-wrap items-start justify-between gap-6 p-5 px-6">
            <div className="flex flex-col gap-1">
              <p className="ed-kicker">Currently in</p>
              <h2 className="ed-h2">
                {weather.city}
                <span className="text-ink-3">, {weather.country}</span>
              </h2>
              <p className="ed-meta mt-1">
                {Math.abs(weather.latitude).toFixed(2)}°{weather.latitude >= 0 ? "N" : "S"} ·{" "}
                {Math.abs(weather.longitude).toFixed(2)}°{weather.longitude >= 0 ? "E" : "W"}
              </p>
              <p className="ed-hint mt-1 capitalize">{weather.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://openweathermap.org/img/wn/${weather.iconCode}@2x.png`}
                alt={weather.description}
                width={56}
                height={56}
              />
              <p className="font-serif text-5xl leading-none tracking-[-0.03em] text-ink">
                {formatTemp(weather.temperatureCelsius, unit)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 min-[900px]:grid-cols-5">
            {[
              { label: "Feels like", value: formatTemp(weather.feelsLikeCelsius, unit) },
              { label: "Humidity", value: `${weather.humidity}%`, italic: true },
              { label: "Wind", value: formatWind(weather.windSpeedMs, unit) },
              { label: "Pressure", value: `${weather.pressure} hPa`, italic: true },
              { label: "Visibility", value: formatVisibility(weather.visibilityMeters) },
            ].map((s, i, arr) => (
              <div key={s.label} className={i < arr.length - 1 ? "border-ink-r" : ""}>
                <StatCard label={s.label} value={s.value} italic={s.italic} />
              </div>
            ))}
          </div>
        </div>
      )}

      {geoError && !coords && (
        <p className="ed-label-muted" role="note">
          {geoError}
        </p>
      )}
      {!coords && !geoError && (
        /* Map placeholder shown while geolocation is pending */
        <div
          className="border-ink-dashed flex items-center justify-center bg-paper-2"
          style={{ minHeight: 280 }}
          aria-hidden="true"
        >
          <span className="ed-label-muted">Map will appear here</span>
        </div>
      )}
      {coords && <WeatherMap coords={coords} />}
    </div>
  );
}
