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
          background: "#f5efe3",
          color: "#15120a",
          fontFamily: "Georgia, serif",
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
            color: "#5a544a",
          }}
        >
          Critical error
        </p>
        <h1 style={{ fontSize: "1.625rem", marginBottom: "16px" }}>
          The application failed to start.
        </h1>
        {error.digest ? (
          <p
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.72rem",
              color: "#5a544a",
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
            background: "#15120a",
            color: "#f5efe3",
            border: "1.5px solid #15120a",
            padding: "10px 20px",
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.78rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
