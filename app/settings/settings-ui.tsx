import { useState } from "react";

/** Shared class string for settings section cards. Use instead of the old cardStyle CSSProperties. */
export const cardClassName = "bg-paper-2 border-ink p-5 shadow-stamp";

export function FocusInput({ style, className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      className={`w-full h-[38px] p-[0_12px] bg-transparent border-0 [border-bottom:1.5px_solid_var(--ink-3)] text-ink font-body text-[0.938rem] outline-none transition-[border-color] duration-150 rounded-none${className ? ` ${className}` : ""}`}
      style={{ ...style, ...(focused ? { borderColor: "var(--ink)", boxShadow: "0 0 0 3px rgba(178,42,26,0.08)" } : {}) }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}

export function FocusTextarea({ style, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      className={`w-full p-[10px_12px] bg-paper-2 [border:1.5px_solid_var(--ink-3)] text-ink font-body text-[0.938rem] outline-none resize-y transition-[border-color] duration-150 rounded-none${className ? ` ${className}` : ""}`}
      style={{ ...style, ...(focused ? { borderColor: "var(--ink)", boxShadow: "0 0 0 3px rgba(178,42,26,0.08)" } : {}) }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}
