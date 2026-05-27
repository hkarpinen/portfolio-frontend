"use client";

import { useState } from "react";

interface DeleteConfirmProps {
  communityName: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirm({ communityName, isPending, onCancel, onConfirm }: DeleteConfirmProps) {
  const [value, setValue] = useState("");
  const matches = value === communityName;

  return (
    <div className="flex gap-4 items-center flex-wrap">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={communityName}
        className="h-[36px] bg-paper-2 p-[0_12px] text-base text-ink outline-none min-w-[180px] border-ink"

      />
      <button
        type="button"
        disabled={!matches || isPending}
        onClick={onConfirm}
        className={`py-[8px] px-[18px] text-base font-semibold border-none transition-[background] duration-110 cursor-pointer disabled:cursor-not-allowed${matches && !isPending ? " bg-[var(--danger)] text-white" : " bg-paper-3 text-ink-3"}`}
      >
        {isPending ? "Deleting…" : "Confirm delete"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        className="py-[8px] px-[14px] bg-transparent text-ink-3 text-base cursor-pointer border-ink transition-[background] duration-110"
      >
        Cancel
      </button>
    </div>
  );
}
