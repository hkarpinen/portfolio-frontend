import { Btn, Icon } from "@/components/editorial";
import { SectionHead } from "../../section-head";
import { FinanceTabs } from "../../personal-finance-sub-nav";
import { getCookieHeader } from "@/lib/server-cookies";
import { IncomeList } from "./income-list";
import { fetchIncomeServer, fetchNetPaySummaryServer } from "@/lib/api/income";
import type { IncomeSource } from "@/types/income";
import type { NetPaySummary } from "@/types/tax";

import { currentMonthName } from "@/lib/finance/editorial-copy";
import { formatCurrency } from "@/lib/formatting";
import { pluralize } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Personal income is USD-only today (no per-source currency field). The
// audit's §5.1 concern about hardcoded "$" is acknowledged in
// lib/finance/editorial-copy.ts; same applies here. When personal-side
// non-USD ships, thread `user.currency` into the page from `useMe()` /
// `fetchMeServer()` and replace these "USD" literals.

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

  return (
    <div className="page-enter flex flex-col gap-8">
      {/* Terminus `.page-head` — mirrors the Finance overview head, Income desk. */}
      <header className="page-head">
        <div className="titles">
          <div className="kicker" style={{ marginBottom: "8px" }}>
            // WORKSPACE · INCOME
          </div>
          <h1>Income</h1>
          <p className="deck">
            Each source models its own pay cadence, deductions, and tax profile — rolled up to your
            monthly take-home.
          </p>
        </div>
        <div className="actions">
          <Btn
            href="/finance/income/new"
            variant="primary"
            size="sm"
            iconLeft={<Icon name="plus" size={12} strokeWidth={2.5} />}
          >
            Add income source
          </Btn>
        </div>
      </header>

      <FinanceTabs />

      {/* `.stats` 4-up — Net take-home (green) / Gross / Tax withheld (amber) / Annual gross. */}
      <div className="stats">
        <div className="stat">
          <div className="label">Net · take-home</div>
          <div className="val green">{formatCurrency(monthlyNet, "USD", { precision: 0 })}</div>
          <div className="delta">
            {totalTaxWithheld > 0
              ? `after ${formatCurrency(totalTaxWithheld, "USD", { precision: 0 })} withheld`
              : "gross equals net"}
          </div>
        </div>
        <div className="stat">
          <div className="label">Gross · monthly</div>
          <div className="val">{formatCurrency(monthlyGross, "USD", { precision: 0 })}</div>
          <div className="delta">before deductions</div>
        </div>
        <div className="stat">
          <div className="label">Tax withheld</div>
          <div className="val amber">
            {formatCurrency(totalTaxWithheld, "USD", { precision: 0 })}
          </div>
          <div className="delta">{totalTaxWithheld > 0 ? "fed + state + FICA" : "none on file"}</div>
        </div>
        <div className="stat">
          <div className="label">Annual gross</div>
          <div className="val">{formatCurrency(annualGross, "USD", { precision: 0 })}</div>
          <div className="delta">{monthName} run-rate × 12</div>
        </div>
      </div>

      <section className="flex flex-col gap-5">
        <SectionHead
          kicker="SOURCES · ON FILE"
          count={`${sources.length} ${pluralize("stream", sources.length)}`}
          title="Income <em>sources</em>"
          deck="Each source models its own pay cadence, deductions, and tax profile."
        />
        <IncomeList initialData={incomePage} />
      </section>
    </div>
  );
}
