"use client";

import { Icon } from "@/components/editorial";
import type { IconName } from "@/components/editorial";
import Link from "next/link";

/**
 * <MobileNav> — bottom strip nav for mobile (redesign)
 *
 * All visual rules in /app/globals.css under `.ed-mobile-nav*` classes.
 */

type Cell = { label: string; href: string; icon: IconName; activeIfStartsWith?: string[] };

const CELLS: Cell[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "House", href: "/household", icon: "household", activeIfStartsWith: ["/household"] },
  {
    label: "Finance",
    href: "/expenses",
    icon: "expenses",
    activeIfStartsWith: ["/expenses", "/income"],
  },
  { label: "Forum", href: "/forum", icon: "forum", activeIfStartsWith: ["/forum"] },
  { label: "Me", href: "/settings/profile", icon: "about", activeIfStartsWith: ["/settings"] },
];

export function MobileNav({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Mobile navigation" className="ed-mobile-nav mobile-only">
      <ul className="ed-mobile-nav-list">
        {CELLS.map((c) => {
          const active =
            c.href === "/"
              ? pathname === "/"
              : c.activeIfStartsWith
                ? c.activeIfStartsWith.some((p) => pathname.startsWith(p))
                : pathname.startsWith(c.href);
          return (
            <li key={c.href}>
              <Link
                href={c.href}
                aria-current={active ? "page" : undefined}
                className="ed-mobile-nav-cell"
              >
                <Icon name={c.icon} size={22} strokeWidth={active ? 2 : 1.5} />
                <span>{c.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
