/**
 * Static config for the unit converter.
 *
 * The category order, default unit pairs, and "Quick Values" preset chips
 * are pure data and live outside the client component so the UI file stays
 * focused on rendering. Unit strings must match the backend
 * `/api/math/convert/units` response exactly.
 */

export const CATEGORY_ORDER = [
  "length",
  "weight",
  "temperature",
  "volume",
  "speed",
  "area",
  "data",
];

/** Sensible default `from → to` unit pair per backend category slug. */
export const DEFAULT_UNITS: Record<string, { from: string; to: string }> = {
  length: { from: "m", to: "ft" },
  weight: { from: "kg", to: "lb" },
  temperature: { from: "c", to: "f" },
  volume: { from: "l", to: "gal" },
  speed: { from: "m_s", to: "mph" },
  area: { from: "m2", to: "ft2" },
  data: { from: "gb", to: "mb" },
};

/** Quick-reference preset chips displayed below the converter per category. */
export const QUICK_VALUES: Record<
  string,
  { label: string; from: string; to: string; value: number }[]
> = {
  length: [
    { label: "1 m = 3.28 ft", from: "m", to: "ft", value: 1 },
    { label: "1 mi = 1.61 km", from: "mi", to: "km", value: 1 },
    { label: "1 in = 2.54 cm", from: "in", to: "cm", value: 1 },
    { label: "100 yd = 91.4 m", from: "yd", to: "m", value: 100 },
  ],
  weight: [
    { label: "1 kg = 2.205 lb", from: "kg", to: "lb", value: 1 },
    { label: "1 oz = 28.35 g", from: "oz", to: "g", value: 1 },
    { label: "1 t = 1000 kg", from: "t", to: "kg", value: 1 },
    { label: "1 st = 6.35 kg", from: "st", to: "kg", value: 1 },
  ],
  temperature: [
    { label: "0 °C = 32 °F", from: "c", to: "f", value: 0 },
    { label: "100 °C = 212 °F", from: "c", to: "f", value: 100 },
    { label: "37 °C = 98.6 °F", from: "c", to: "f", value: 37 },
    { label: "−40 °C = −40 °F", from: "c", to: "f", value: -40 },
  ],
  volume: [
    { label: "1 L = 0.264 gal", from: "l", to: "gal", value: 1 },
    { label: "1 fl oz = 29.6 mL", from: "fl_oz", to: "ml", value: 1 },
    { label: "1 pt = 0.473 L", from: "pt", to: "l", value: 1 },
    { label: "1 qt = 0.946 L", from: "qt", to: "l", value: 1 },
  ],
  speed: [
    { label: "1 m/s = 2.24 mph", from: "m_s", to: "mph", value: 1 },
    { label: "100 km/h = 62 mph", from: "km_h", to: "mph", value: 100 },
    { label: "1 kt = 1.85 km/h", from: "kt", to: "km_h", value: 1 },
  ],
  area: [
    { label: "1 m² = 10.76 ft²", from: "m2", to: "ft2", value: 1 },
    { label: "1 ac = 4047 m²", from: "acre", to: "m2", value: 1 },
    { label: "1 km² = 247 ac", from: "km2", to: "acre", value: 1 },
  ],
  data: [
    { label: "1 GB = 1000 MB", from: "gb", to: "mb", value: 1 },
    { label: "1 TB = 1000 GB", from: "tb", to: "gb", value: 1 },
    { label: "1 KB = 1000 B", from: "kb", to: "b", value: 1 },
  ],
};

/** Trailing-zero-stripped, comma-grouped number formatting for the result row. */
export function formatNumber(n: number): string {
  const s = n.toFixed(10).replace(/\.?0+$/, "");
  // `split(".")` always returns at least one element; pin int with a
  // default so strict-indexed-access doesn't widen it to undefined.
  const [int = "", dec] = s.split(".");
  const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${intFmt}.${dec}` : intFmt;
}
