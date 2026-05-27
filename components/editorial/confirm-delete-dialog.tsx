"use client";
import { useState, useEffect } from "react";
import { Modal } from "@/components/editorial/modal";
import { Btn } from "@/components/editorial/button";

type RequireTextProps = {
  /** When set, requires the user to type this exact string before confirm enables. */
  expectedText: string;
  label: string;
};

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body?: string;
  confirmLabel?: string;
  isPending: boolean;
  onConfirm: () => void;
  requireText?: RequireTextProps;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel = "Delete",
  isPending,
  onConfirm,
  requireText,
}: ConfirmDeleteDialogProps) {
  const [typed, setTyped] = useState("");

  // Reset typed value whenever dialog closes
  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  const canConfirm = requireText ? typed === requireText.expectedText : true;

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      {body && <p className="text-base text-ink-2 mb-4">{body}</p>}
      {requireText && (
        <label className="block mb-4">
          <span className="ed-label">{requireText.label}</span>
          <input
            className="ed-input mt-1"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={requireText.expectedText}
          />
        </label>
      )}
      <div className="flex gap-2 justify-end">
        <Btn variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
          Cancel
        </Btn>
        <Btn
          variant="danger"
          onClick={onConfirm}
          disabled={!canConfirm || isPending}
          loading={isPending}
        >
          {isPending ? "Deleting…" : confirmLabel}
        </Btn>
      </div>
    </Modal>
  );
}
