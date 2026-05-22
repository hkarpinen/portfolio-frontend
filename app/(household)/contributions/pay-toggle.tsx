"use client";

export function PayToggle({ paid, pending, onToggle }: {
  paid: boolean;
  pending: boolean;
  onToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onToggle}
      className="py-[2px] px-[9px] text-sm font-semibold shrink-0"
      style={{
        cursor: pending ? "default" : "pointer",
        background: paid ? "var(--success-s)" : "var(--paper-3)",
        border: `1px solid ${paid ? "var(--success)" : "var(--ink-3)"}`,
        color: paid ? "var(--success)" : "var(--text-3)",
        transition: "all 110ms",
        opacity: pending ? 0.5 : 1,
      }}
    >
      {paid ? "Paid" : "Mark paid"}
    </button>
  );
}
