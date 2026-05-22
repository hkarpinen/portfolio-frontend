"use client";

export const tdBase: React.CSSProperties = {
  padding: "9px 10px",
  fontSize: "var(--ts-body-sm)",
  color: "var(--text)",
  borderBottom: "1.5px solid var(--ink)",
  verticalAlign: "middle",
};

export const tdMeta: React.CSSProperties = {
  ...tdBase,
  fontSize: "var(--ts-label)",
  color: "var(--text-3)",
  whiteSpace: "nowrap",
};

export interface TableItem {
  key: string;
  dayLabel: string;
  name: React.ReactNode;
  type: "Shared" | "Personal";
  amount: string;
  currency: string;
  paid?: boolean;
  count?: number;
  payToggle?: React.ReactNode;
}

export function ItemTableRow({ item, isLast }: { item: TableItem; isLast: boolean }) {
  const lastStyle = isLast ? { borderBottom: "none" } : {};
  return (
    <tr>
      <td className="pl-10 pr-4 w-[44px] text-right" style={{ ...tdMeta, ...lastStyle }}>{item.dayLabel}</td>
      <td className="font-semibold" style={{ ...tdBase, ...lastStyle }}>{item.name}</td>
      <td style={{ ...tdMeta, ...lastStyle }}>
        <span className="inline-block py-[1px] px-[7px] text-sm font-mono" style={{ background: item.type === "Shared" ? "rgba(178,42,26,0.08)" : "var(--paper-3)", color: item.type === "Shared" ? "var(--red)" : "var(--text-3)", border: `1px solid ${item.type === "Shared" ? "rgba(178,42,26,0.3)" : "var(--ink-3)"}` }}>
          {item.type}
        </span>
      </td>
      <td className="font-serif font-bold text-right whitespace-nowrap pr-6" style={{ ...tdBase, ...lastStyle }}>
        {item.count !== undefined && item.count > 1
          ? <><span className="text-sm font-mono font-normal text-ink-3 mr-[5px]">{item.currency}</span>{item.amount} <span className="text-sm font-medium text-ink-3">×{item.count}</span></>
          : <><span className="text-sm font-mono font-normal text-ink-3 mr-[5px]">{item.currency}</span>{item.amount}</>
        }
      </td>
      {item.payToggle !== undefined && (
        <td className="text-right pr-8 w-[110px] whitespace-nowrap" style={{ ...tdBase, ...lastStyle }}>
          {item.payToggle}
        </td>
      )}
    </tr>
  );
}

export function StackedItemRow({ item, isLast }: { item: TableItem; isLast: boolean }) {
  return (
    <div className="flex items-start justify-between gap-5 py-[11px] px-[16px]" style={{ borderBottom: isLast ? "none" : "1.5px solid var(--ink)" }}>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-base text-ink overflow-hidden text-ellipsis whitespace-nowrap">
          {item.name}
        </div>
        <div className="flex items-center gap-3 mt-[3px] flex-wrap">
          {item.dayLabel !== "—" && (
            <span className="text-sm text-ink-3">Day {item.dayLabel}</span>
          )}
          <span className="inline-block py-0 px-3 text-sm font-mono" style={{ background: item.type === "Shared" ? "rgba(178,42,26,0.08)" : "var(--paper-3)", color: item.type === "Shared" ? "var(--red)" : "var(--text-3)", border: `1px solid ${item.type === "Shared" ? "rgba(178,42,26,0.3)" : "var(--ink-3)"}` }}>
            {item.type}
          </span>
          {item.count !== undefined && item.count > 1 && (
            <span className="text-sm text-ink-3">×{item.count}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-[5px] shrink-0">
        <span className="font-serif font-bold text-base text-ink whitespace-nowrap">
          <span className="text-sm font-mono font-normal text-ink-3 mr-[5px]">{item.currency}</span>{item.amount}
        </span>
        {item.payToggle}
      </div>
    </div>
  );
}
