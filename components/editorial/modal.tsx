"use client";
import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Icon } from "./icon";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: number | string;
}

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  actions,
  maxWidth = 540,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-modal flex items-end justify-center md:items-center md:p-4"
          style={{ background: "var(--overlay)", animation: "fadeIn 150ms" }}
        >
          <Dialog.Content
            className="flex w-full flex-col"
            style={{
              maxWidth,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              animation: "scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1)",
              maxHeight: "90vh",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              className="flex shrink-0 items-center justify-between px-[22px] py-8"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <Dialog.Title
                style={{ font: "700 1rem/1 var(--ff-mono)", color: "var(--text)" }}
              >
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  aria-label="Close"
                  className="flex cursor-pointer items-center justify-center border-none bg-transparent text-ink-3"
                  style={{ width: 28, height: 28, transition: "color 110ms" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--ink)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--ink-3)";
                  }}
                >
                  <Icon name="x" size={14} strokeWidth={2} />
                </button>
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-[20px_22px]">{children}</div>

            {/* Actions */}
            {actions && (
              <div
                className="flex shrink-0 items-center justify-end gap-5 px-[22px] py-7"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                {actions}
              </div>
            )}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
