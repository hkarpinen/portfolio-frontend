/** Shared class string for settings section cards. */
export const cardClassName = "bg-paper-2 border-ink p-5 shadow-stamp";

export function FocusTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={`ed-settings-textarea${className ? ` ${className}` : ""}`} {...props} />
  );
}
