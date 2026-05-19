import { getCookieHeader } from "@/lib/server-cookies";
import { IncomeList } from "./income-list";
import { fetchIncomeServer } from "@/lib/api/income";
import { toMonthlyAmount } from "@/lib/utils";
import type { IncomeSource } from "@/types/finance";
import Link from "next/link";
import { Icon } from "@/components/editorial/icon";

export const dynamic = 'force-dynamic';

export default async function IncomePage() {
  const incomePage = await fetchIncomeServer(await getCookieHeader()) ?? { items: [] as IncomeSource[] };
  const sources: IncomeSource[] = incomePage.items ?? [];

  const toMonthly = (s: IncomeSource) => toMonthlyAmount(s.amount, s.quotedAs);

  const isRecurring = (s: IncomeSource) => {
    const freq = s.paidEvery?.toUpperCase();
    return freq && freq !== "ONCE" && freq !== "ONE_TIME" && freq !== "ONETIME";
  };

  const monthlyGross = sources.reduce((sum, s) => sum + toMonthly(s), 0);
  const recurringTotal = sources.filter(isRecurring).reduce((sum, s) => sum + toMonthly(s), 0);

  return (
    <div className="page-enter flex flex-col gap-[28px]" >
      {/* Header */}
      <div className="flex items-start justify-between gap-8">
        <div>
          <h1 className="font-serif font-extrabold text-4xl leading-none tracking-snug tracking-[-0.025em] text-ink">
            Income
          </h1>
          <p className="text-ink-3 mt-2 text-base">
            Manage your personal income sources
          </p>
        </div>
        <Link
          href="/income/new"
          className="inline-flex items-center gap-3 py-[9px] px-[18px] bg-red text-white text-base font-semibold no-underline shrink-0 mt-2"
        >
          <Icon name="plus" size={13} strokeWidth={2.5} />
          Add income source
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid gap-[14px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
        {[
          { label: "Gross Monthly", value: `$${monthlyGross.toFixed(2)}`, icon: <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>, accent: "var(--red)", bg: "rgba(178,42,26,0.08)" },
          { label: "Recurring", value: `$${recurringTotal.toFixed(2)}`, icon: <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>, accent: "var(--success)", bg: "var(--success-s)" },
          { label: "Sources", value: String(sources.length), icon: <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>, accent: "var(--warning)", bg: "var(--warning-s)" },
        ].map(({ label, value, icon, accent, bg }) => (
          <div key={label} className="bg-paper py-[18px] px-[20px] shadow-card flex flex-col gap-5 border-ink">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em]">{label}</span>
              <div className="w-[30px] h-[30px] flex items-center justify-center" style={{ background: bg }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
              </div>
            </div>
            <p className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink leading-none">{value}</p>
          </div>
        ))}
      </div>

      {/* Income sources list */}
      <div>
        <p className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em] mb-8">
          Income Sources
        </p>
        <IncomeList initialData={incomePage} />
      </div>
    </div>
  );
}
