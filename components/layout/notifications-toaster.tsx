"use client";

import Link from "next/link";
import * as Toast from "@radix-ui/react-toast";
import { useNotificationsContext } from "@/components/layout/notifications-provider";
import styles from "./notifications-toaster.module.css";

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

export function NotificationsToaster() {
  const { toasts, removeToast, markRead } = useNotificationsContext();

  return (
    <Toast.Provider swipeDirection="right" duration={6000}>
      {toasts.map((n) => (
        <Toast.Root
          key={n.id}
          open
          onOpenChange={(open) => {
            if (!open) {
              markRead(n.id);
              removeToast(n.id);
            }
          }}
          style={{
            ...typeStyles[n.type],
            borderRadius: "12px",
            padding: "12px 14px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
            <div style={{ flex: 1 }}>
              {n.title && (
                <Toast.Title style={{ fontSize: "13px", fontWeight: "600", fontFamily: "var(--ff-display)", marginBottom: "2px", display: "block" }}>
                  {n.title}
                </Toast.Title>
              )}
              <Toast.Description style={{ fontSize: "13px", lineHeight: "1.4" }}>
                {n.message}
              </Toast.Description>
              {n.deepLink && (
                <Toast.Action altText="View" asChild>
                  <Link
                    href={n.deepLink}
                    onClick={() => { markRead(n.id); removeToast(n.id); }}
                    style={{
                      marginTop: "4px", display: "inline-block",
                      fontSize: "11px", fontWeight: "500",
                      color: "var(--accent)", textDecoration: "underline",
                    }}
                  >
                    View
                  </Link>
                </Toast.Action>
              )}
            </div>
            <Toast.Close asChild>
              <button
                type="button"
                aria-label="Dismiss"
                className={styles.dismissBtn}
              >
                ✕
              </button>
            </Toast.Close>
          </div>
        </Toast.Root>
      ))}
      <Toast.Viewport
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: "320px",
          maxWidth: "calc(100vw - 32px)",
          zIndex: 100,
          listStyle: "none",
          padding: 0,
          margin: 0,
          outline: "none",
        }}
      />
    </Toast.Provider>
  );
}