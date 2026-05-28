import { getCookieHeader } from "@/lib/server-cookies";
import { IncomeList } from "./income-list";
import { fetchIncomeServer, fetchNetPaySummaryServer } from "@/lib/api/income";
import type { IncomeSource } from "@/types/income";
import type { NetPaySummary } from "@/types/tax";
import { EditorialPageHead } from "@/components/editorial/editorial-page-head";
import { LedeStat } from "@/components/editorial/lede-stat";
import { Ticker } from "@/components/editorial/ticker";
// LedgerStrip removed — its figures duplicated the LedeStat aside.
import { DepartmentHead } from "@/components/editorial/department-head";
import {
  currentMonthName,
  incomeHeadline,
  incomeDeck,
  buildIncomeTicker,
} from "@/lib/finance/editorial-copy";
import { formatAmount } from "@/lib/formatting";

export const dynamic = "force-dynamic";

const fmt0 = (n: number) => `$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
const fmt2 = (n: number) => `$${formatAmount(n)}`;

export default async function IncomePage() {
  const cookieHeader = await getCookieHeader();

  // One round-trip each: the list (for the per-row table) and the aggregate
  // summary (for the stats strip). The summary used to be derived client-
  // side by fanning out a /net-pay call per source — moved server-side so
  // the page renders in two parallel calls regardless of how many sources
  // the user has.
  const [incomePage, summary] = await Promise.all([
    fetchIncomeServer(cookieHeader).then((p) => p ?? { items: [] as IncomeSource[] }),
    fetchNetPaySummaryServer(cookieHeader).catch(() => null as NetPaySummary | null),
  ]);
  const sources: IncomeSource[] = incomePage.items ?? [];

  const monthlyGross = summary?.monthlyGross ?? 0;
  const monthlyNet = summary?.monthlyNet ?? 0;
  const totalTaxWithheld = summary?.totalTaxWithheld ?? 0;
  const annualGross = summary?.annualGross ?? monthlyGross * 12;

  const now = new Date();
  const monthName = currentMonthName(now);

  const ticker = buildIncomeTicker({
    monthlyGross,
    monthlyNet,
    totalTaxWithheld,
    annualGross,
    sourcesCount: sources.length,
  });

  return (
    <div className="page-enter flex flex-col gap-6">
      <EditorialPageHead
        kicker={`${monthName} edition`}
        title={incomeHeadline({ sourcesCount: sources.length, monthlyNet })}
        deck={incomeDeck({
          sourcesCount: sources.length,
          monthlyGross,
          monthlyNet,
          totalTaxWithheld,
        })}
      />

      <Ticker items={ticker} ariaLabel="Income figures" />

      <LedeStat
        label="Net · monthly take-home"
        value={fmt2(monthlyNet)}
        deck={
          totalTaxWithheld > 0
            ? `After ${fmt0(totalTaxWithheld)} withheld in federal, state, and FICA.`
            : "No payroll deductions on file — gross equals net."
        }
        aside={[
          { label: "Gross monthly", value: fmt0(monthlyGross), sub: "before deductions" },
          {
            label: "Tax withheld",
            value: fmt0(totalTaxWithheld),
            sub: totalTaxWithheld > 0 ? "fed + state + FICA" : undefined,
          },
          { label: "Annual gross", value: fmt0(annualGross), sub: "monthly × 12" },
          { label: "Sources", value: String(sources.length) },
        ]}
      />

      <section className="flex flex-col gap-5">
        <DepartmentHead
          kicker="Sources · On file"
          count={`${sources.length} stream${sources.length === 1 ? "" : "s"}`}
          title="Income <em>sources</em>"
          deck="Each source models its own pay cadence, deductions, and tax profile."
        />
        <IncomeList initialData={incomePage} />
      </section>
    </div>
  );
}
