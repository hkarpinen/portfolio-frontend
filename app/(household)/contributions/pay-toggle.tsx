"use client";

export function PayToggle({
  paid,
  pending,
  onToggle,
}: {
  paid: boolean;
  pending: boolean;
  onToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onToggle}
      className={`shrink-0 cursor-pointer px-[9px] py-1 text-sm font-semibold transition-all duration-[110ms] disabled:cursor-default disabled:opacity-50${paid ? "bg-[var(--success-s)] text-[var(--success)] [border:1px_solid_var(--success)]" : "border border-ink-3 bg-paper-3 text-ink-3"}`}
    >
      {paid ? "Paid" : "Mark paid"}
    </button>
  );
}
