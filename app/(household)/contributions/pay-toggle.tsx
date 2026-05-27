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
      className={`py-[2px] px-[9px] text-sm font-semibold shrink-0 transition-all duration-[110ms] cursor-pointer disabled:cursor-default disabled:opacity-50${paid ? " bg-[var(--success-s)] text-[var(--success)] [border:1px_solid_var(--success)]" : " bg-paper-3 text-ink-3 border border-ink-3"}`}
    >
      {paid ? "Paid" : "Mark paid"}
    </button>
  );
}
