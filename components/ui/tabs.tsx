"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
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
    <RadixTabs.Root value={activeTab} onValueChange={onChange}>
      <RadixTabs.List className={cn(styles.tabsBar, className)}>
        {tabs.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <RadixTabs.Trigger
              key={tab.key}
              value={tab.key}
              className={cn(styles.tab, active && styles.active)}
            >
              {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn(styles.tabCount, active && styles.tabCountActive)}>
                  {tab.count}
                </span>
              )}
            </RadixTabs.Trigger>
          );
        })}
      </RadixTabs.List>
    </RadixTabs.Root>
  );
}
