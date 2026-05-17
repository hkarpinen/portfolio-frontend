import React from "react";

type AlertVariant = "info" | "warning" | "danger" | "success";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
}

const VARIANT_COLOR: Record<AlertVariant, string> = {
  info:    "var(--ink)",
  warning: "var(--red)",
  danger:  "var(--red)",
  success: "var(--green)",
};

const VARIANT_LABEL: Record<AlertVariant, string> = {
  info:    "— Notice —",
  warning: "— Warning —",
  danger:  "— Danger —",
  success: "— Note —",
};

export function Alert({ variant = "info", title, children }: AlertProps) {
  const color = VARIANT_COLOR[variant];
  return (
    <div
      className="bg-paper"
      style={{
        border: `1.5px solid ${color}`,
        borderLeftWidth: 4,
        padding: "12px 14px",
      }}
    >
      <p
        className="font-mono uppercase"
        style={{ fontSize: "0.594rem", color, letterSpacing: "0.22em", marginBottom: 4 }}
      >
        {VARIANT_LABEL[variant]}
      </p>
      {title && (
        <p
          className="font-serif italic"
          style={{ fontSize: "1.0625rem", color: "var(--ink)", marginBottom: 4, lineHeight: 1.1 }}
        >
          {title}
        </p>
      )}
      <div
        className="font-body"
        style={{ fontSize: "0.875rem", color: "var(--ink-2)", lineHeight: 1.55 }}
      >
        {children}
      </div>
    </div>
  );
}
