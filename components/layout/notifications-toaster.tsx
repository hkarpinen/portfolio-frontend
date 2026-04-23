"use client";

import Link from "next/link";
import { useNotifications } from "@/hooks/use-notifications";

interface Props {
  enabled: boolean;
}

const typeStyles: Record<"success" | "error" | "info", React.CSSProperties> = {
  success: {
    background: "var(--success-s)",
    border: "1px solid oklch(68% 0.18 152 / 0.35)",
    color: "var(--success)",
  },
  error: {
    background: "var(--danger-s)",
    border: "1px solid oklch(62% 0.21 22 / 0.35)",
    color: "var(--danger)",
  },
  info: {
    background: "var(--surface)",
    border: "1px solid var(--border-2)",
    color: "var(--text)",
  },
};

export function NotificationsToaster({ enabled }: Props) {
  const { notifications, removeNotification } = useNotifications({ connect: enabled });

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "320px",
      }}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {notifications.map((n) => (
        <div
          key={n.id}
          role={n.type === "error" ? "alert" : "status"}
          style={{
            ...typeStyles[n.type],
            borderRadius: "12px",
            padding: "12px 14px",
            boxShadow: "var(--shadow-md)",
            animation: "scaleIn 220ms cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
            <div style={{ flex: 1 }}>
              {n.title && (
                <div style={{
                  fontSize: "13px", fontWeight: "600",
                  fontFamily: "var(--ff-display)", marginBottom: "2px",
                }}>{n.title}</div>
              )}
              <div style={{ fontSize: "13px", lineHeight: "1.4" }}>{n.message}</div>
              {n.deepLink && (
                <Link
                  href={n.deepLink}
                  onClick={() => removeNotification(n.id)}
                  style={{
                    marginTop: "4px", display: "inline-block",
                    fontSize: "11px", fontWeight: "500",
                    color: "var(--accent)", textDecoration: "underline",
                  }}
                >
                  View
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeNotification(n.id)}
              aria-label="Dismiss"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "inherit", opacity: 0.6, fontSize: "13px", padding: "0",
                flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.6"}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
