"use client";

import "leaflet/dist/leaflet.css";
import { useState, useEffect, useRef } from "react";
import type { GeoCoordinates } from "@/types/geography";

type LayerKey = "clouds" | "precipitation" | "pressure" | "wind" | "temp" | "cycling";

const LAYERS: { key: LayerKey; label: string; attribution: string }[] = [
  { key: "clouds",        label: "Clouds",       attribution: "OpenWeatherMap" },
  { key: "precipitation", label: "Precip.",      attribution: "OpenWeatherMap" },
  { key: "pressure",      label: "Pressure",     attribution: "OpenWeatherMap" },
  { key: "wind",          label: "Wind",         attribution: "OpenWeatherMap" },
  { key: "temp",          label: "Temperature",  attribution: "OpenWeatherMap" },
  { key: "cycling",       label: "Cycling",      attribution: "CyclOSM" },
];

export function WeatherMap({ coords }: { coords: GeoCoordinates }) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const overlayRef  = useRef<any>(null);
  const [activeLayer, setActiveLayer] = useState<LayerKey | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if ((mapRef.current as any)._leaflet_id) return;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current || (mapRef.current as any)._leaflet_id) return;
      const map = L.map(mapRef.current, {
        center: [coords.latitude, coords.longitude],
        zoom: 8,
        zoomControl: false,
      });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      mapInstance.current = map;
    });
    return () => {
      cancelled = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mapInstance.current?.setView([coords.latitude, coords.longitude], 8);
  }, [coords.latitude, coords.longitude]);

  useEffect(() => {
    if (!mapInstance.current) return;
    import("leaflet").then((L) => {
      if (overlayRef.current) {
        mapInstance.current.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }
      if (!activeLayer) return;
      const layer = LAYERS.find((l) => l.key === activeLayer)!;
      const tile = L.tileLayer(`/api/geography/tiles/${activeLayer}/{z}/{x}/{y}.png`, {
        attribution: layer.attribution,
        opacity: 0.65,
      });
      tile.addTo(mapInstance.current);
      overlayRef.current = tile;
    });
  }, [activeLayer]);

  const toggle = (key: LayerKey) => setActiveLayer((prev) => (prev === key ? null : key));

  return (
    <section aria-label="Interactive weather map">
      {/* Layer toolbar */}
      <div className="border-ink">
        <div
          role="group"
          aria-label="Map overlay layers"
          className="flex flex-wrap items-center border-ink-b p-[10px_14px] bg-paper-2 gap-[10px]"
        >
          <span className="ed-label-muted uppercase shrink-0 tracking-[0.22em]" aria-hidden="true">
            Overlay
          </span>
          <div className="flex flex-wrap gap-[6px]">
            {LAYERS.map((l) => {
              const on = activeLayer === l.key;
              return (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => toggle(l.key)}
                  aria-pressed={on}
                  aria-label={`${on ? "Hide" : "Show"} ${l.label} overlay`}
                  className={`ed-label-muted font-mono uppercase transition-colors tracking-[0.18em] p-[3px_9px] border-ink cursor-pointer min-h-[36px]${on ? " bg-ink text-paper" : " bg-transparent text-ink-2"}`}
                >
                  {on && <span aria-hidden="true" className="text-red mr-1">▸</span>}
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* Map container — Leaflet manages its own keyboard navigation */}
        <div
          ref={mapRef}
          className="h-[560px]"
          role="application"
          aria-label="Map centered on current location"
        />
      </div>
    </section>
  );
}
