"use client";

import Link from "next/link";
import * as Toast from "@radix-ui/react-toast";
import { useNotificationsContext } from "@/components/layout/notifications-provider";
import { Icon } from "@/components/editorial/icon";
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
    background: "var(--paper-2)",
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
          className="py-[12px] px-[14px] shadow-stamp" style={{ ...typeStyles[n.type] }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {n.title && (
                <Toast.Title className="text-md font-semibold font-serif mb-1 block">
                  {n.title}
                </Toast.Title>
              )}
              <Toast.Description className="text-md leading-[1.4]">
                {n.message}
              </Toast.Description>
              {n.deepLink && (
                <Toast.Action altText="View" asChild>
                  <Link
                    href={n.deepLink}
                    onClick={() => { markRead(n.id); removeToast(n.id); }}
                    className="mt-2 inline-block text-sm font-medium text-red underline"
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
                <Icon name="x" size={12} strokeWidth={2.5} />
              </button>
            </Toast.Close>
          </div>
        </Toast.Root>
      ))}
      <Toast.Viewport
        className="fixed bottom-[20px] right-[20px] flex flex-col gap-4 w-[320px] max-w-[calc(100vw - 32px)] z-notifications list-none p-0 m-0 outline-none"
      />
    </Toast.Provider>
  );
}