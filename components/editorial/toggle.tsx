"use client";
import React from "react";
import * as RadixSwitch from "@radix-ui/react-switch";

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (val: boolean) => void;
  size?: "sm" | "md";
  id?: string;
  label?: string;
  disabled?: boolean;
}

export function Toggle({
  checked,
  onCheckedChange,
  size = "md",
  id,
  label,
  disabled,
}: ToggleProps) {
  const trackW = size === "md" ? 38 : 30;
  const trackH = size === "md" ? 20 : 16;
  const knobSize = trackH - 4;

  return (
    <div className="flex items-center gap-3">
      <RadixSwitch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="border-ink"
        style={{
          width: trackW,
          height: trackH,
          background: checked ? "var(--ink)" : "var(--paper-3)",
          position: "relative",
          cursor: disabled ? "not-allowed" : "pointer",
          flexShrink: 0,
          outline: "none",
          transition: "background 180ms",
        }}
      >
        <RadixSwitch.Thumb
          style={{
            display: "block",
            width: knobSize,
            height: knobSize,
            background: "var(--paper)",
            position: "absolute",
            top: 1,
            left: checked ? `${trackW - knobSize - 3}px` : "1px",
            transition: "left 180ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </RadixSwitch.Root>
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer font-body"
          style={{ fontSize: "0.938rem", color: "var(--ink-2)" }}
        >
          {label}
        </label>
      )}
    </div>
  );
}
