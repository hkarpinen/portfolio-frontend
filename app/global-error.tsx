"use client";

import React, { useEffect } from "react";

/**
 * Global error boundary — fires when the root layout itself fails to render.
 * Cannot use the editorial primitives because the root <html>/<body> have
 * not been emitted by the failing layout. Keep this dependency-free.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          background: "#0d1117",
          color: "#e6edf3",
          fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "32px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.72rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            marginBottom: "24px",
            color: "#e6b450",
          }}
        >
          // CRITICAL_ERROR
        </p>
        <h1 style={{ fontSize: "1.625rem", marginBottom: "16px", fontWeight: 700 }}>
          The application failed to start.
        </h1>
        {error.digest ? (
          <p
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.72rem",
              color: "#8b949e",
              marginBottom: "24px",
            }}
          >
            Reference: {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          style={{
            background: "#e6b450",
            color: "#0d1117",
            border: "1px solid #e6b450",
            padding: "10px 20px",
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.78rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          $ try-again
        </button>
      </body>
    </html>
  );
}
