"use client";

import { cn } from "@/lib/utils";
import styles from "./toggle.module.css";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  id?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
  size = "md",
  className,
  id,
}: ToggleProps) {
  const toggleId = id ?? (label ? `toggle-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
  return (
    <div className={cn(styles.container, className)}>
      <button
        type="button"
        role="switch"
        id={toggleId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(styles.track, styles[size], checked && styles.checked)}
      >
        <span className={cn(styles.knob, checked && styles.knobChecked)} />
      </button>
      {label && (
        <label htmlFor={toggleId} className={styles.label}>
          {label}
        </label>
      )}
    </div>
  );
}
