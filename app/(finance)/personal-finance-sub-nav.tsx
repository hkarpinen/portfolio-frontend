"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./personal-finance-sub-nav.module.css";

const TABS = [
  { label: "Expenses", href: "/expenses" },
  { label: "Income",   href: "/income" },
] as const;

export function PersonalFinanceSubNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      borderBottom: "1.5px solid var(--ink)",
      background: "var(--paper-2)",
      padding: "0 32px",
      display: "flex",
      gap: "4px",
      overflowX: "auto",
      flexShrink: 0,
    }}>
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={active ? `${styles.link} ${styles.active}` : styles.link}
            style={{ marginBottom: "-1px" }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
