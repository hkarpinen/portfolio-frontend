import React from "react";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { Spinner } from "./spinner";

/**
 * <Btn> — editorial button (redesign)
 *
 * Drop-in replacement. Same API.
 *
 * All visual rules live in /app/globals.css under `.ed-btn*` classes.
 * This file builds the className string; no inline styles.
 */

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "success";
type BtnSize = "xs" | "sm" | "md" | "lg" | "xl";

interface BtnProps {
  variant?: BtnVariant;
  size?: BtnSize;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  form?: string;
  formAction?: string | ((formData: FormData) => void | Promise<void>);
  "aria-label"?: string;
  style?: React.CSSProperties;
  /** When true, merges props onto the single child element (Radix Slot). */
  asChild?: boolean;
}

const VARIANT_CLASS: Record<BtnVariant, string> = {
  primary: "ed-btn-primary",
  secondary: "ed-btn-secondary",
  ghost: "ed-btn-ghost",
  danger: "ed-btn-danger",
  outline: "ed-btn-outline",
  success: "ed-btn-success",
};

const SIZE_CLASS: Record<BtnSize, string> = {
  xs: "ed-btn-xs",
  sm: "ed-btn-sm",
  md: "ed-btn-md",
  lg: "ed-btn-lg",
  xl: "ed-btn-xl",
};

function classes(variant: BtnVariant, size: BtnSize, fullWidth?: boolean, extra?: string) {
  return [
    "ed-btn",
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    fullWidth ? "ed-btn-block" : "",
    extra || "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function Btn({
  variant = "primary",
  size = "md",
  href,
  onClick,
  type = "button",
  disabled,
  loading,
  iconLeft,
  iconRight,
  fullWidth,
  children,
  className = "",
  form,
  formAction,
  "aria-label": ariaLabel,
  style,
  asChild = false,
}: BtnProps) {
  const cls = classes(variant, size, fullWidth, className);
  const content = (
    <>
      {loading ? <Spinner size={14} /> : iconLeft}
      {children}
      {iconRight}
    </>
  );

  if (asChild) {
    return (
      <Slot aria-label={ariaLabel} className={cls} style={style}>
        {children}
      </Slot>
    );
  }

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={cls} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      form={form}
      formAction={formAction as string}
      aria-label={ariaLabel}
      className={cls}
      style={style}
    >
      {content}
    </button>
  );
}
