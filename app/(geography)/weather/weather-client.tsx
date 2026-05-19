"use client";

import { useState, useEffect } from "react";
import { useWeather } from "@/hooks/use-weather";
import { SectionHeader } from "@/components/editorial/section-header";
import { StatCard } from "@/components/editorial/stat-card";
import { WeatherMap } from "./weather-map";
import { LocationSearch } from "./location-search";
import type { GeoCoordinates, WeatherUnit } from "@/types/geography";

function celsiusToFahrenheit(c: number) { return c * 9 / 5 + 32; }
function msToMph(ms: number) { return ms * 2.237; }

function formatTemp(celsius: number, unit: WeatherUnit) {
  const value = unit === "imperial" ? celsiusToFahrenheit(celsius) : celsius;
  return `${Math.round(value)}°${unit === "imperial" ? "F" : "C"}`;
}
function formatWind(ms: number, unit: WeatherUnit) {
  return unit === "imperial" ? `${msToMph(ms).toFixed(1)} mph` : `${ms.toFixed(1)} m/s`;
}
function formatVisibility(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
}

const rule = "1.5px solid var(--ink)";

export function WeatherClient() {
  const [cityInput,  setCityInput]  = useState("");
  const [stateInput, setStateInput] = useState("");
  const [city,       setCity]       = useState<string | null>(null);
  const [unit,       setUnit]       = useState<WeatherUnit>("imperial");
  const [coords,     setCoords]     = useState<GeoCoordinates | null>(null);
  const [geoError,   setGeoError]   = useState<string | null>(null);

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
    const trimmed = [cityInput.trim(), stateInput.trim()].filter(Boolean).join(", ");
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
        cityInput={cityInput}
        stateInput={stateInput}
        unit={unit}
        onCityChange={setCityInput}
        onStateChange={setStateInput}
        onUnitChange={setUnit}
        onSearch={search}
      />

      {isLoading && (
        <p className="font-mono uppercase text-ink-3" style={{ fontSize: "0.688rem", letterSpacing: "0.18em" }}>
          Fetching conditions…
        </p>
      )}
      {isError && (
        <p className="font-mono uppercase" style={{ fontSize: "0.688rem", letterSpacing: "0.18em", color: "var(--red)" }}>
          City not found — try a different search.
        </p>
      )}

      {weather && (
        <div className="bg-paper shadow-stamp" style={{ border: rule }}>
          <div className="flex items-start justify-between gap-6 flex-wrap" style={{ padding: "20px 24px", borderBottom: rule }}>
            <div className="flex flex-col gap-1">
              <p className="font-mono uppercase text-red" style={{ fontSize: "0.594rem", letterSpacing: "0.26em" }}>
                Current conditions
              </p>
              <h2 className="font-serif text-ink leading-[0.95]" style={{ fontSize: "2rem", letterSpacing: "-0.02em" }}>
                {weather.city}<span className="text-ink-3">, {weather.country}</span>
              </h2>
              <p className="font-body text-ink-3 capitalize" style={{ fontSize: "0.875rem", marginTop: 4 }}>
                {weather.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://openweathermap.org/img/wn/${weather.iconCode}@2x.png`} alt={weather.description} width={56} height={56} />
              <p className="font-serif text-ink" style={{ fontSize: "3rem", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {formatTemp(weather.temperatureCelsius, unit)}
              </p>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            {[
              { label: "Feels like", value: formatTemp(weather.feelsLikeCelsius, unit) },
              { label: "Humidity",   value: `${weather.humidity}%`,                     italic: true },
              { label: "Wind",       value: formatWind(weather.windSpeedMs, unit) },
              { label: "Pressure",   value: `${weather.pressure} hPa`,                  italic: true },
              { label: "Visibility", value: formatVisibility(weather.visibilityMeters) },
            ].map((s, i, arr) => (
              <div key={s.label} style={{ borderRight: i < arr.length - 1 ? rule : undefined }}>
                <StatCard label={s.label} value={s.value} italic={s.italic} />
              </div>
            ))}
          </div>
        </div>
      )}

      {geoError && !coords && (
        <p className="font-mono uppercase text-ink-3" style={{ fontSize: "0.688rem", letterSpacing: "0.18em" }}>
          {geoError}
        </p>
      )}
      {coords && <WeatherMap coords={coords} />}
    </div>
  );
}
