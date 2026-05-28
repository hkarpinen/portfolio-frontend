/** Shared class string for settings section cards. */
export const cardClassName = "bg-paper-2 border-ink p-5 shadow-stamp";

/**
 * Settings-page input. Visual rules (height, bottom-border, focus ring)
 * live in app/globals.css under `.ed-settings-input` so the focus state is
 * a real `:focus` pseudo-class — see audit §2.5. The previous
 * `useState`-driven onFocus/onBlur with inline `style` is gone.
 */
export function FocusInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`ed-settings-input${className ? ` ${className}` : ""}`} {...props} />;
}

export function FocusTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={`ed-settings-textarea${className ? ` ${className}` : ""}`} {...props} />
  );
}
