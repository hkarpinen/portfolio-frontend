"use client";

import * as Switch from "@radix-ui/react-switch";
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
      <Switch.Root
        id={toggleId}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className={cn(styles.track, styles[size], checked && styles.checked)}
      >
        <Switch.Thumb className={cn(styles.knob, checked && styles.knobChecked)} />
      </Switch.Root>
      {label && (
        <label htmlFor={toggleId} className={styles.label}>
          {label}
        </label>
      )}
    </div>
  );
}
