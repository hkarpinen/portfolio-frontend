import React from "react";
import Link from "next/link";
import { Spinner } from "./spinner";

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
  style?: React.CSSProperties;
  formAction?: string | ((formData: FormData) => void | Promise<void>);
}

const SIZES: Record<BtnSize, { padding: string; fontSize: string; height: string; letterSpacing: string }> = {
  xs: { padding: "4px 9px",  fontSize: "0.6rem",  height: "24px", letterSpacing: "0.14em" },
  sm: { padding: "6px 12px", fontSize: "0.688rem", height: "30px", letterSpacing: "0.16em" },
  md: { padding: "9px 16px", fontSize: "0.688rem", height: "36px", letterSpacing: "0.18em" },
  lg: { padding: "12px 22px",fontSize: "0.75rem",  height: "44px", letterSpacing: "0.20em" },
  xl: { padding: "15px 28px",fontSize: "0.75rem",  height: "52px", letterSpacing: "0.22em" },
};

function getBtnStyles(variant: BtnVariant, size: BtnSize, fullWidth?: boolean, disabled?: boolean): React.CSSProperties {
  const s = SIZES[size];
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "var(--ff-mono)",
    fontWeight: 500,
    textTransform: "uppercase",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    borderRadius: 0,
    textDecoration: "none",
    whiteSpace: "nowrap",
    flexShrink: 0,
    transition: "transform 140ms, box-shadow 140ms, background 140ms, color 140ms",
    width: fullWidth ? "100%" : undefined,
    minHeight: 44,
    ...s,
  };

  switch (variant) {
    case "primary":   return { ...base, background: "var(--ink)", color: "var(--paper)" };
    case "secondary": return { ...base, background: "transparent", color: "var(--ink)" };
    case "ghost":     return { ...base, background: "transparent", color: "var(--ink)", border: "none", borderBottom: "1px solid var(--ink-3)" };
    case "danger":    return { ...base, background: "var(--red)", color: "var(--paper)", border: "1.5px solid var(--red)" };
    case "outline":   return { ...base, background: "transparent", color: "var(--red)", border: "1.5px solid var(--red)" };
    case "success":   return { ...base, background: "var(--green)", color: "var(--paper)", border: "1.5px solid var(--green)" };
  }
}

const BTN_CSS = `
  .btn-primary:not(:disabled):hover { background: var(--red); transform: translate(-2px, -2px); box-shadow: 4px 4px 0 var(--ink); }
  .btn-secondary:not(:disabled):hover { background: var(--ink); color: var(--paper); transform: translate(-2px, -2px); box-shadow: 4px 4px 0 var(--red); }
  .btn-danger:not(:disabled):hover { background: var(--red-deep); }
  .btn-ghost:not(:disabled):hover { background: var(--paper-2); border-bottom-color: var(--red); }
`;

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
  style: styleProp,
  formAction,
}: BtnProps) {
  const styles = getBtnStyles(variant, size, fullWidth, disabled || loading);
  const borderInk = variant === "primary" || variant === "secondary" ? " border-ink" : "";

  const content = (
    <>
      {loading ? <Spinner size={14} /> : iconLeft}
      {children}
      {iconRight}
    </>
  );

  if (href) {
    return (
      <>
        <style>{BTN_CSS}</style>
        <Link
          href={href}
          className={`btn-${variant}${className ? " " + className : ""}${borderInk}`}
          style={styles}
        >
          {content}
        </Link>
      </>
    );
  }

  return (
    <>
      <style>{BTN_CSS}</style>
      <button
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        form={form}
        formAction={formAction as string}
        className={`btn-${variant}${className ? " " + className : ""}${borderInk}`}
        style={{ ...styles, ...styleProp }}
      >
        {content}
      </button>
    </>
  );
}
