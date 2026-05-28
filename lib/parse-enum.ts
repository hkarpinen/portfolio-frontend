// lib/parse-enum.ts
//
// Tiny guard for the recurring pattern of taking an untrusted string (HTML
// `<select>` value, backend DTO, query string) and narrowing it to a TS
// string enum. Without this, the codebase reaches for `value as MyEnum`
// everywhere, which is a lie: a stale form value or a backend rename
// silently becomes a corrupt enum member and surfaces later as
// `undefined.foo` deep in business logic.
//
// Usage:
//   parseEnum(HouseholdRole, m.role) // HouseholdRole | undefined
//   parseEnum(HouseholdRole, m.role, HouseholdRole.Member) // always returns a member
//   isEnumValue(HouseholdRole, m.role) // type guard form
//
// Only works for string enums (which is everything we use; see
// types/membership.ts, types/forum.ts, types/schedule.ts).

type StringEnum = Record<string, string>;
type EnumValue<E extends StringEnum> = E[keyof E];

function isEnumValue<E extends StringEnum>(e: E, value: unknown): value is EnumValue<E> {
  return typeof value === "string" && (Object.values(e) as string[]).includes(value);
}

export function parseEnum<E extends StringEnum>(e: E, value: unknown): EnumValue<E> | undefined;
export function parseEnum<E extends StringEnum>(
  e: E,
  value: unknown,
  fallback: EnumValue<E>,
): EnumValue<E>;
export function parseEnum<E extends StringEnum>(
  e: E,
  value: unknown,
  fallback?: EnumValue<E>,
): EnumValue<E> | undefined {
  return isEnumValue(e, value) ? value : fallback;
}

// String-union counterpart of parseEnum — for types declared as
// `type Foo = "A" | "B"` rather than `enum Foo`. Requires a `readonly` tuple
// of the allowed values (the runtime witness the union itself doesn't carry).
//
//   const FREQS = ["Daily", "Weekly"] as const;
//   type Freq = typeof FREQS[number];
//   parseUnion(FREQS, e.target.value, "Daily");

export function parseUnion<const T extends readonly string[]>(
  options: T,
  value: unknown,
): T[number] | undefined;
export function parseUnion<const T extends readonly string[]>(
  options: T,
  value: unknown,
  fallback: T[number],
): T[number];
export function parseUnion<const T extends readonly string[]>(
  options: T,
  value: unknown,
  fallback?: T[number],
): T[number] | undefined {
  return typeof value === "string" && (options as readonly string[]).includes(value)
    ? (value as T[number])
    : fallback;
}
