"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./finance-sub-nav.module.css";

const TABS = [
  { label: "Households",  href: "/households" },
  { label: "Expenses",    href: "/expenses" },
  { label: "Income",      href: "/income" },
] as const;

export function FinanceSubNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      borderBottom: "1px solid var(--border)",
      background: "var(--surface)",
      padding: "0 32px",
      display: "flex",
      gap: "4px",
      overflowX: "auto",
      flexShrink: 0,
    }}>
      {TABS.map((tab) => {
        const active = tab.href === "/households"
          ? pathname.startsWith("/households")
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={active ? `${styles.link} ${styles.active}` : styles.link}
            style={{
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}