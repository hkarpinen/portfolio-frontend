"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./personal-finance-sub-nav.module.css";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Expenses", href: "/expenses" },
  { label: "Income",   href: "/income" },
] as const;

export function PersonalFinanceSubNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-paper-2 p-[0_32px] flex gap-2 overflow-x-auto shrink-0" style={{ borderBottom: "1.5px solid var(--ink)" }}>
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(active ? `${styles.link} ${styles.active}` : styles.link, "mb-[-1px]")}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
