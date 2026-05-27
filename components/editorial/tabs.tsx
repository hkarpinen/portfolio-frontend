"use client";
import React from "react";
import * as RadixTabs from "@radix-ui/react-tabs";

/**
 * <EditorialTabs> — section tabs (redesign)
 *
 * All visual rules in /app/globals.css under `.ed-tabs-list` / `.ed-tab`.
 */

interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface EditorialTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  children?: React.ReactNode;
  ariaLabel?: string;
}

export function EditorialTabs({ tabs, active, onChange, children, ariaLabel }: EditorialTabsProps) {
  return (
    <RadixTabs.Root value={active} onValueChange={onChange}>
      <RadixTabs.List aria-label={ariaLabel || "Section navigation"} className="ed-tabs-list">
        {tabs.map(tab => (
          <RadixTabs.Trigger key={tab.id} value={tab.id} className="ed-tab">
            <span className="inline-flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && <span className="ed-tab-count">({tab.count})</span>}
            </span>
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  );
}
