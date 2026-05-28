import { useState } from "react";

/** Shared class string for settings section cards. Use instead of the old cardStyle CSSProperties. */
export const cardClassName = "bg-paper-2 border-ink p-5 shadow-stamp";

export function FocusInput({
  style,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      className={`h-[38px] w-full border-0 bg-transparent p-[0_12px] font-body text-[0.938rem] text-ink outline-none transition-[border-color] duration-150 [border-bottom:1.5px_solid_var(--ink-3)] rounded-none${className ? ` ${className}` : ""}`}
      style={{
        ...style,
        ...(focused
          ? { borderColor: "var(--ink)", boxShadow: "0 0 0 3px rgba(178,42,26,0.08)" }
          : {}),
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}

export function FocusTextarea({
  style,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      className={`w-full resize-y bg-paper-2 p-[10px_12px] font-body text-[0.938rem] text-ink outline-none transition-[border-color] duration-150 [border:1.5px_solid_var(--ink-3)] rounded-none${className ? ` ${className}` : ""}`}
      style={{
        ...style,
        ...(focused
          ? { borderColor: "var(--ink)", boxShadow: "0 0 0 3px rgba(178,42,26,0.08)" }
          : {}),
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}
