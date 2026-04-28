"use client";

import { cn } from "@/lib/utils";
import styles from "./tabs.module.css";

interface Tab {
  key: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn(styles.tabsBar, className)} role="tablist">
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={cn(styles.tab, active && styles.active)}
          >
            {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(styles.tabCount, active && styles.tabCountActive)}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
