"use client";
import React from "react";

/* ── Input ──────────────────────────────────────────────────────────────────*/
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, hint, error, iconLeft, className = "", onBlur, onFocus, ...props }, ref) {
  return (
    <div className="flex flex-col gap-[6px]">
      {label && (
        <label
          className="font-mono uppercase font-medium"
          style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--ink-2)" }}
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {iconLeft && (
          <span className="absolute left-0 text-ink-3" style={{ pointerEvents: "none" }}>
            {iconLeft}
          </span>
        )}
        <input
          {...props}
          ref={ref}
          className={`w-full bg-transparent font-body text-ink ${iconLeft ? "pl-6" : ""} ${className}`}
          style={{
            border: "none",
            borderBottom: error ? "1.5px solid var(--red)" : "1.5px solid var(--ink-3)",
            fontSize: "0.938rem",
            padding: "8px 0 6px 0",
            outline: "none",
            borderRadius: 0,
            ...props.style,
          }}
          onFocus={e => {
            e.currentTarget.style.borderBottomColor = "var(--ink)";
            onFocus?.(e);
          }}
          onBlur={e => {
            e.currentTarget.style.borderBottomColor = error ? "var(--red)" : "var(--ink-3)";
            onBlur?.(e);
          }}
        />
      </div>
      {error && (
        <p className="font-mono" style={{ fontSize: "0.6rem", color: "var(--red)", letterSpacing: "0.06em" }}>
          ↳ {error}
        </p>
      )}
      {hint && !error && (
        <p className="font-mono" style={{ fontSize: "0.6rem", color: "var(--ink-3)", letterSpacing: "0.06em" }}>
          {hint}
        </p>
      )}
    </div>
  );
});

/* ── Textarea ───────────────────────────────────────────────────────────────*/
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      {label && (
        <label
          className="font-mono uppercase font-medium"
          style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--ink-2)" }}
        >
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full bg-paper font-body text-ink ${className}`}
        style={{
          border: error ? "1.5px solid var(--red)" : "1.5px solid var(--ink-3)",
          fontSize: "0.938rem",
          padding: "12px 14px",
          outline: "none",
          borderRadius: 0,
          resize: "vertical",
          ...props.style,
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = "var(--ink)";
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = error ? "var(--red)" : "var(--ink-3)";
        }}
      />
      {error && (
        <p className="font-mono" style={{ fontSize: "0.6rem", color: "var(--red)", letterSpacing: "0.06em" }}>
          ↳ {error}
        </p>
      )}
      {hint && !error && (
        <p className="font-mono" style={{ fontSize: "0.6rem", color: "var(--ink-3)", letterSpacing: "0.06em" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/* ── Select ─────────────────────────────────────────────────────────────────*/
interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function SelectField({ label, hint, error, options, className = "", ...props }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      {label && (
        <label
          className="font-mono uppercase font-medium"
          style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--ink-2)" }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          {...props}
          className={`w-full bg-transparent font-body text-ink appearance-none pr-8 ${className}`}
          style={{
            border: "none",
            borderBottom: error ? "1.5px solid var(--red)" : "1.5px solid var(--ink-3)",
            fontSize: "0.938rem",
            padding: "8px 28px 6px 0",
            outline: "none",
            borderRadius: 0,
            cursor: "pointer",
            ...props.style,
          }}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-ink-3">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </span>
      </div>
      {error && (
        <p className="font-mono" style={{ fontSize: "0.6rem", color: "var(--red)", letterSpacing: "0.06em" }}>
          ↳ {error}
        </p>
      )}
      {hint && !error && (
        <p className="font-mono" style={{ fontSize: "0.6rem", color: "var(--ink-3)", letterSpacing: "0.06em" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
