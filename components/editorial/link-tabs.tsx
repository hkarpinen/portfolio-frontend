"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface LinkTabItem {
  label: string;
  href: string;
  /** Value compared against the resolved active value to determine active state. */
  queryValue: string;
}

/**
 * <LinkTabs> — URL-driven tab strip that visually matches `<EditorialTabs>`.
 *
 * Pass `activeValue` from a server component's `searchParams` to avoid the
 * Suspense boundary requirement for `useSearchParams`. When `activeValue` is
 * provided, the internal `useSearchParams` result is ignored.
 *
 * When no resolved value is present, the first item is treated as active.
 */
export function LinkTabs({
  items,
  searchParam,
  activeValue,
  className,
  "aria-label": ariaLabel,
}: {
  items: LinkTabItem[];
  /** Query param name to read when `activeValue` is not provided. */
  searchParam?: string;
  /** Explicitly-provided active value (e.g. from a server component's searchParams).
   *  When set, bypasses the `useSearchParams()` read. */
  activeValue?: string;
  className?: string;
  "aria-label"?: string;
}) {
  const searchParams = useSearchParams();
  const resolved =
    activeValue !== undefined
      ? activeValue
      : searchParam
        ? (searchParams.get(searchParam) ?? "")
        : "";

  return (
    <nav className={cn("ed-tabs-list", className)} role="tablist" aria-label={ariaLabel}>
      {items.map((item, i) => {
        const active = resolved ? resolved === item.queryValue : i === 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="ed-tab"
            aria-current={active ? "page" : undefined}
            role="tab"
            aria-selected={active}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
