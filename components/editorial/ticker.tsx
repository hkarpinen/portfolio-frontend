import React from "react";
import type { TickerItem } from "@/types/ticker";

export type { TickerItem };

/**
 * <Ticker> — animated horizontal data strip (editorial)
 *
 * Items render twice end-to-end so the marquee loops seamlessly. Animation
 * pauses on hover/focus, and is removed entirely under
 * `prefers-reduced-motion`. Pure decoration over live data — no a11y noise.
 *
 * All visual rules live in /app/globals.css under `.ed-ticker*`.
 *
 * The TickerItem shape lives in @/types/ticker so lib/-layer copy helpers
 * (lib/finance/editorial-copy etc.) can produce payloads without depending
 * on components/. Re-exported here for the existing import surface.
 */

interface TickerProps {
  items: TickerItem[];
  /** Seconds for one full loop. Lower = faster. Defaults to 70. */
  speedSeconds?: number;
  /** Accessible label for the region. Defaults to "Live ticker". */
  ariaLabel?: string;
}

function Row({ items }: { items: TickerItem[] }) {
  return (
    <>
      {items.map((it, i) => {
        const tone =
          it.direction === "up"
            ? "ed-ticker-up"
            : it.direction === "down"
              ? "ed-ticker-down"
              : "ed-ticker-value";
        return (
          <span key={i} className="ed-ticker-item">
            {it.kicker && <span className="ed-ticker-kicker">{it.kicker}</span>}
            <span>{it.label}</span>
            {it.value && <span className={tone}>{it.value}</span>}
          </span>
        );
      })}
    </>
  );
}

export function Ticker({ items, speedSeconds = 70, ariaLabel = "Live ticker" }: TickerProps) {
  if (items.length === 0) return null;
  // The CSS animates the track. Duration is forwarded as a style so callers
  // can tune speed per-page without a new utility class per value.
  return (
    <div className="ed-ticker" role="region" aria-label={ariaLabel} aria-live="off">
      <div className="ed-ticker-track" style={{ animationDuration: `${speedSeconds}s` }}>
        <Row items={items} />
        <Row items={items} />
      </div>
    </div>
  );
}
