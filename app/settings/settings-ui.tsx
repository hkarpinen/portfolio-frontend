import { useState } from "react";

export const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "var(--ts-label)",
  fontWeight: 500,
  color: "var(--text-2)",
  letterSpacing: "0.02em",
  marginBottom: "6px",
};

export const sectionLabelStyle: React.CSSProperties = {
  fontSize: "var(--ts-meta)",
  fontWeight: 700,
  color: "var(--text-3)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

export const cardClassName = "bg-paper-2 border-ink p-5 shadow-stamp";

export const cardStyle: React.CSSProperties = {
  background: "var(--paper-2)",
  padding: "20px",
  boxShadow: "var(--shadow-stamp)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "38px",
  padding: "0 12px",
  background: "transparent",
  border: "none",
  borderBottom: "1.5px solid var(--ink-3)",
  color: "var(--ink)",
  fontFamily: "var(--ff-body)",
  fontSize: "0.938rem",
  outline: "none",
  transition: "border-color 150ms",
  borderRadius: 0,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--paper-2)",
  border: "1.5px solid var(--ink-3)",
  color: "var(--ink)",
  fontFamily: "var(--ff-body)",
  fontSize: "0.938rem",
  outline: "none",
  resize: "vertical",
  transition: "border-color 150ms",
  borderRadius: 0,
};

export function FocusInput({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      style={{ ...inputStyle, ...style, ...(focused ? { borderColor: "var(--ink)", boxShadow: "0 0 0 3px rgba(178,42,26,0.08)" } : {}) }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}

export function FocusTextarea({ style, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      style={{ ...textareaStyle, ...style, ...(focused ? { borderColor: "var(--ink)", boxShadow: "0 0 0 3px rgba(178,42,26,0.08)" } : {}) }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}
