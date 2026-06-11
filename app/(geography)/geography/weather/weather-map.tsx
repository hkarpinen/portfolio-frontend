"use client";

import "leaflet/dist/leaflet.css";
import { useState, useEffect, useRef } from "react";
import type { Map as LeafletMap, TileLayer } from "leaflet";
import type { GeoCoordinates } from "@/types/geography";
import { Icon } from "@/components/editorial";

/**
 * Leaflet stamps an `_leaflet_id` property on the container element after
 * `L.map(el)` is called. It's an internal property the public type doesn't
 * expose; we narrow with a local intersection rather than `as any` (audit
 * §1.2). If Leaflet renames it across a major, the runtime guard fails
 * loudly (re-init re-stamps) rather than silently double-mounting.
 */
type LeafletElement = HTMLDivElement & { _leaflet_id?: number };

type LayerKey = "clouds" | "precipitation" | "pressure" | "wind" | "temp" | "cycling";

const LAYERS: { key: LayerKey; label: string; attribution: string }[] = [
  { key: "clouds", label: "Clouds", attribution: "OpenWeatherMap" },
  { key: "precipitation", label: "Precip.", attribution: "OpenWeatherMap" },
  { key: "pressure", label: "Pressure", attribution: "OpenWeatherMap" },
  { key: "wind", label: "Wind", attribution: "OpenWeatherMap" },
  { key: "temp", label: "Temperature", attribution: "OpenWeatherMap" },
  { key: "cycling", label: "Cycling", attribution: "CyclOSM" },
];

export function WeatherMap({ coords }: { coords: GeoCoordinates }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const overlayRef = useRef<TileLayer | null>(null);
  const [activeLayer, setActiveLayer] = useState<LayerKey | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if ((mapRef.current as LeafletElement)._leaflet_id) return;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current || (mapRef.current as LeafletElement)._leaflet_id) return;
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
      // Re-check after the dynamic import resolves; the effect-cleanup
      // could have nulled mapInstance.current between the schedule and
      // the resume. Captured-local pattern keeps TS narrowing inside the
      // callback where the typed ref otherwise widens back to `T | null`.
      const map = mapInstance.current;
      if (!map) return;
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }
      if (!activeLayer) return;
      const layer = LAYERS.find((l) => l.key === activeLayer)!;
      const tile = L.tileLayer(`/api/geography/tiles/${activeLayer}/{z}/{x}/{y}.png`, {
        attribution: layer.attribution,
        opacity: 0.65,
      });
      tile.addTo(map);
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
          className="border-ink-b flex flex-wrap items-center gap-5 bg-paper-2 p-[10px_14px]"
        >
          <span className="ed-label-muted shrink-0 uppercase tracking-[0.22em]" aria-hidden="true">
            Overlay
          </span>
          <div className="flex flex-wrap gap-3">
            {LAYERS.map((l) => {
              const on = activeLayer === l.key;
              return (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => toggle(l.key)}
                  aria-pressed={on}
                  aria-label={`${on ? "Hide" : "Show"} ${l.label} overlay`}
                  className={`ed-label-muted cursor-pointer border-ink p-[3px_9px] font-mono uppercase tracking-[0.18em] transition-colors min-h-18${on ? "bg-ink text-paper" : "bg-transparent text-ink-2"}`}
                >
                  {on && (
                    <span aria-hidden="true" className="mr-1 inline-flex text-red">
                      <Icon name="chevRight" size={11} strokeWidth={2.5} />
                    </span>
                  )}
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
