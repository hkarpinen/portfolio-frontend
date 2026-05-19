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

const rule = "1.5px solid var(--ink)";

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
    <div style={{ border: rule }}>
      {/* Layer toolbar */}
      <div
        className="flex flex-wrap items-center"
        style={{ borderBottom: rule, padding: "10px 14px", background: "var(--paper-2)", gap: "10px" }}
      >
        <span className="font-mono uppercase shrink-0" style={{ fontSize: "0.594rem", letterSpacing: "0.22em", color: "var(--ink-3)" }}>
          Overlay
        </span>
        <div className="flex flex-wrap gap-[6px]">
          {LAYERS.map((l) => {
            const on = activeLayer === l.key;
            return (
              <button
                key={l.key}
                onClick={() => toggle(l.key)}
                className="font-mono uppercase transition-colors"
                style={{
                  fontSize: "0.594rem", letterSpacing: "0.18em", padding: "3px 9px",
                  border: rule,
                  background: on ? "var(--ink)" : "transparent",
                  color: on ? "var(--paper)" : "var(--ink-2)",
                  cursor: "pointer",
                }}
              >
                {on && <span style={{ color: "var(--red)", marginRight: 4 }}>▸</span>}
                {l.label}
              </button>
            );
          })}
        </div>
      </div>
      <div ref={mapRef} style={{ height: 560 }} />
    </div>
  );
}
