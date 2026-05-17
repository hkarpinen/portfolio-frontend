"use client";
import React from "react";
import * as RadixTabs from "@radix-ui/react-tabs";

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
}

export function EditorialTabs({ tabs, active, onChange, children }: EditorialTabsProps) {
  return (
    <RadixTabs.Root value={active} onValueChange={onChange}>
      <RadixTabs.List
        className="flex overflow-x-auto"
        style={{
          borderBottom: "1.5px solid var(--ink)",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {tabs.map(tab => (
          <RadixTabs.Trigger
            key={tab.id}
            value={tab.id}
            className="font-mono uppercase shrink-0 cursor-pointer bg-transparent"
            style={{
              padding: "10px 16px 11px",
              fontSize: "0.688rem",
              letterSpacing: "0.16em",
              border: "none",
              whiteSpace: "nowrap",
              outline: "none",
              transition: "color 110ms",
            }}
            data-state={active === tab.id ? "active" : "inactive"}
          >
            <span
              style={{
                color: active === tab.id ? "var(--red)" : "var(--ink-2)",
                borderBottom: active === tab.id ? "3px solid var(--red)" : "3px solid transparent",
                marginBottom: -1.5,
                display: "inline-block",
                paddingBottom: 2,
              }}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: "0.525rem",
                    color: active === tab.id ? "var(--red)" : "var(--ink-3)",
                  }}
                >
                  ({tab.count})
                </span>
              )}
            </span>
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  );
}
