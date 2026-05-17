import React from "react";
import { Btn } from "./button";

interface EmptyStateProps {
  title: string;
  body?: string;
  cta?: { label: string; href?: string; onClick?: () => void };
}

export function EmptyState({ title, body, cta }: EmptyStateProps) {
  return (
    <div
      className="text-center flex flex-col items-center"
      style={{ padding: "48px 24px", border: "1.5px dashed var(--ink-3)" }}
    >
      <p
        className="font-mono"
        style={{ fontSize: "0.625rem", letterSpacing: "0.30em", color: "var(--ink-3)", marginBottom: 12, textTransform: "uppercase" }}
      >
        — NIL —
      </p>
      <p
        className="font-serif italic"
        style={{ fontSize: "1.75rem", lineHeight: 1, marginBottom: 8, color: "var(--ink)" }}
      >
        {title}
      </p>
      {body && (
        <p
          className="font-body"
          style={{ fontSize: "0.875rem", color: "var(--ink-2)", maxWidth: 320, lineHeight: 1.55 }}
        >
          {body}
        </p>
      )}
      {cta && (
        <div className="mt-6">
          <Btn href={cta.href} onClick={cta.onClick} variant="primary" size="sm">
            {cta.label}
          </Btn>
        </div>
      )}
    </div>
  );
}
