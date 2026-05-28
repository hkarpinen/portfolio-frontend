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
          className="px-[14px] py-[12px] shadow-stamp"
          style={{ ...typeStyles[n.type] }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {n.title && (
                <Toast.Title className="mb-1 block font-serif text-md font-semibold">
                  {n.title}
                </Toast.Title>
              )}
              <Toast.Description className="text-md leading-[1.4]">{n.message}</Toast.Description>
              {n.deepLink && (
                <Toast.Action altText="View" asChild>
                  <Link
                    href={n.deepLink}
                    onClick={() => {
                      markRead(n.id);
                      removeToast(n.id);
                    }}
                    className="mt-2 inline-block text-sm font-medium text-red underline"
                  >
                    View
                  </Link>
                </Toast.Action>
              )}
            </div>
            <Toast.Close asChild>
              <button type="button" aria-label="Dismiss" className={styles.dismissBtn}>
                <Icon name="x" size={12} strokeWidth={2.5} />
              </button>
            </Toast.Close>
          </div>
        </Toast.Root>
      ))}
      <Toast.Viewport className="max-w-[calc(100vw - 32px)] fixed bottom-[20px] right-[20px] z-notifications m-0 flex w-[320px] list-none flex-col gap-4 p-0 outline-none" />
    </Toast.Provider>
  );
}
