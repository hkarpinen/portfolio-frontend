"use client";
import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Btn } from "./button";
import { Icon } from "./icon";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: number | string;
}

export function Modal({ open, onOpenChange, title, children, actions, maxWidth = 540 }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-[200] flex items-end justify-center md:items-center md:p-4"
          style={{ background: "var(--overlay)", animation: "fadeIn 150ms" }}
        >
          <Dialog.Content
            className="bg-paper w-full flex flex-col"
            style={{
              maxWidth,
              border: "2px solid var(--ink)",
              boxShadow: "var(--shadow-modal)",
              animation: "scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1)",
              maxHeight: "90vh",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-[22px] py-[16px] shrink-0"
              style={{ borderBottom: "1.5px solid var(--ink)" }}
            >
              <Dialog.Title
                className="font-serif italic font-normal text-ink"
                style={{ fontSize: "1.5rem", lineHeight: 1 }}
              >
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  aria-label="Close"
                  className="bg-transparent border-none cursor-pointer text-ink-3 flex items-center justify-center"
                  style={{ width: 28, height: 28, transition: "color 110ms" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--ink)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--ink-3)"; }}
                >
                  <Icon name="x" size={14} strokeWidth={2} />
                </button>
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="p-[20px_22px] overflow-y-auto flex-1">
              {children}
            </div>

            {/* Actions */}
            {actions && (
              <div
                className="px-[22px] py-[14px] flex items-center justify-end gap-[10px] shrink-0"
                style={{ borderTop: "1.5px solid var(--ink)" }}
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
