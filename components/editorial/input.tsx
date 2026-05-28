"use client";
import React from "react";
import { Icon } from "./icon";

/**
 * <Input>, <Textarea>, <SelectField> — editorial inputs (redesign)
 *
 * All visual rules in /app/globals.css under `.ed-input` / `.ed-label` /
 * `.ed-hint` / `.ed-error` classes.
 */

function fieldId(label: string | undefined, id: string | undefined) {
  if (id) return id;
  if (label) return `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return undefined;
}

/* ── Input ──────────────────────────────────────────────────────────────────*/
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, iconLeft, className = "", id, ...props },
  ref,
) {
  const inputId = fieldId(label, id);
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="ed-label">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {iconLeft && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
          >
            {iconLeft}
          </span>
        )}
        <input
          {...props}
          id={inputId}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className={`ed-input ${iconLeft ? "pl-11" : ""} ${className}`}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="ed-error">
          ↳ {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="ed-hint">
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

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className = "", id, ...props },
  ref,
) {
  const inputId = fieldId(label, id);
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="ed-label">
          {label}
        </label>
      )}
      <textarea
        {...props}
        id={inputId}
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        className={`ed-input ed-textarea ${className}`}
      />
      {error && (
        <p id={`${inputId}-error`} className="ed-error">
          ↳ {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="ed-hint">
          {hint}
        </p>
      )}
    </div>
  );
});

/* ── Select ─────────────────────────────────────────────────────────────────*/
interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField({ label, hint, error, children, className = "", id, ...props }, ref) {
    const inputId = fieldId(label, id);
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="ed-label">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            {...props}
            id={inputId}
            ref={ref}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={describedBy}
            className={`ed-input ed-select ${className}`}
          >
            {children}
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-3"
          >
            <Icon name="chevDown" size={14} strokeWidth={2} />
          </span>
        </div>
        {error && (
          <p id={`${inputId}-error`} className="ed-error">
            ↳ {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="ed-hint">
            {hint}
          </p>
        )}
      </div>
    );
  },
);
