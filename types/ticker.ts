/**
 * One row of an editorial Ticker — small kicker, label, optional value, and
 * a direction tint. Lives in `types/` (not the component file) so that
 * lib/-layer copy helpers can produce ticker payloads without depending on
 * the components/ layer. The component renders this type; it doesn't own it.
 */
export interface TickerItem {
  /** Small red lead-in word (optional). e.g. "NEXT DUE". */
  kicker?: string;
  /** Primary label of the item. e.g. "Electric". */
  label: string;
  /** Right-side value, set in tabular nums. e.g. "$98 Fri". */
  value?: string;
  /** Direction tints the value: up→green, down→red. */
  direction?: "up" | "down" | "flat";
}
