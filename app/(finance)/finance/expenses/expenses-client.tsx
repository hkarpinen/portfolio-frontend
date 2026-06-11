"use client";

import { DepartmentHead, EmptyDispatch, Icon, Ticker } from "@/components/editorial";
import { useId, useState, type ReactNode } from "react";
import { useOverview } from "@/hooks/use-household";
import { useIncome } from "@/hooks/use-income";
import { useExpenses } from "@/hooks/use-expenses";
import { ExpenseList } from "./expense-list";
import { FinancialSummary } from "./financial-summary";
import { PersonalOneTimeList } from "./personal-one-time-list";
import { SharedSplitsTable, groupSharedSplitsByBill } from "./shared-splits-table";
import { buildUpcomingFromPeriod } from "./expenses-derivations";

import { buildExpensesTicker } from "@/lib/finance/editorial-copy";
import { findCurrentPeriod, recurringPersonalBills } from "@/lib/contributions";
import { formatCurrency } from "@/lib/formatting";
import { pluralize, sumBy } from "@/lib/utils";
import type { Expense, ExpensePage } from "@/types/expense";
import type { ContributionPeriod } from "@/types/contributions";
import type { IncomeSource } from "@/types/income";

interface ExpensesClientProps {
  initialMonths: ContributionPeriod[];
  initialExpenses: ExpensePage;
  initialIncome: IncomeSource[];
  householdNamesById: Record<string, string>;
  monthName: string;
  /** Optional block rendered between the financial-summary lede and the bill
   *  lists — the merged Money page injects the cross-household net-positions
   *  table here so personal standing and group standing read as one page. */
  afterSummary?: React.ReactNode;
}

/** Long month name from a period's `periodStart` (YYYY-MM-DD), TZ-safe so a
 *  UTC-midnight date string never slips to the previous day. */
function monthNameFromPeriod(period: ContributionPeriod | undefined, fallback: string): string {
  if (!period) return fallback;
  const [y, m] = period.periodStart.slice(0, 7).split("-").map(Number);
  if (!y || !m) return fallback;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
}

export function ExpensesClient({
  initialMonths,
  initialExpenses,
  initialIncome,
  householdNamesById,
  monthName,
  afterSummary,
}: ExpensesClientProps) {
  const { data: liveMonths } = useOverview(initialMonths);
  const months = liveMonths ?? initialMonths;
  const { data: liveIncome } = useIncome({ items: initialIncome });
  const incomeSources: IncomeSource[] = liveIncome?.items ?? initialIncome;

  // Month selector — all periods are already loaded, so switching is a pure
  // client re-pick (no refetch). Default to the current month; newest first.
  const currentPeriod = findCurrentPeriod(months);
  const sortedPeriods = [...months].sort((a, b) => b.periodStart.localeCompare(a.periodStart));
  const [selectedKey, setSelectedKey] = useState<string>(
    currentPeriod?.periodStart ?? sortedPeriods[0]?.periodStart ?? "",
  );
  const selectedPeriod = months.find((m) => m.periodStart === selectedKey) ?? currentPeriod;
  const selectedMonthName = monthNameFromPeriod(selectedPeriod, monthName);

  // Every projection below is derived from the *selected* period.
  const personalRecurringBills = recurringPersonalBills(selectedPeriod);
  const sharedSplitGroups = groupSharedSplitsByBill(selectedPeriod?.contributions ?? []);

  // One-time slice comes from the full personal-expenses list (not the period
  // projection) because the row component needs the full `Expense` shape for
  // its inline edit form. Filter to the selected period so the dept-head count
  // and the list contents are computed from the same source.
  const { data: livePersonalExpenses } = useExpenses(initialExpenses);
  const personalMonthKey = selectedPeriod?.periodStart.slice(0, 7);
  const oneTimePersonalExpenses: Expense[] = (livePersonalExpenses?.items ?? []).filter(
    (e) => !e.recurrenceFrequency && e.dueDate.slice(0, 7) === personalMonthKey,
  );

  // Ticker = the page's "coming up" strip (upcoming bills only). The money
  // figures live in the FinancialSummary lede below, so the ticker doesn't
  // restate them — it adds what the lede doesn't show: what's due, and when.
  const tickerItems = buildExpensesTicker({
    upcoming: buildUpcomingFromPeriod(selectedPeriod),
    monthName: selectedMonthName,
  });

  // Department head counts/totals for each section header.
  const personalRecurringCount = personalRecurringBills.length;
  const personalRecurringTotal = sumBy(personalRecurringBills, (b) => b.amount);
  const sharedTotal = sumBy(sharedSplitGroups, (g) => g.monthlyAmount);
  const oneTimeCount = oneTimePersonalExpenses.length;
  const oneTimeTotal = sumBy(oneTimePersonalExpenses, (e) => e.amount);

  return (
    <div className="flex flex-col gap-10">
      {months.length > 1 && (
        <div className="flex items-center justify-end gap-2">
          <label htmlFor="money-period" className="ed-label-muted">
            Viewing
          </label>
          <select
            id="money-period"
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="border border-rule-soft bg-paper px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] text-ink"
          >
            {sortedPeriods.map((p) => (
              <option key={p.periodStart} value={p.periodStart}>
                {p.periodLabel}
              </option>
            ))}
          </select>
        </div>
      )}

      <Ticker items={tickerItems} ariaLabel="Upcoming bills" />

      <FinancialSummary
        period={selectedPeriod}
        incomeSources={incomeSources}
        monthName={selectedMonthName}
      />

      {afterSummary}

      <CollapsibleSection
        head={
          <DepartmentHead
            kicker="Recurring · Personal"
            count={`${personalRecurringCount} ${pluralize("bill", personalRecurringCount)} · ${formatCurrency(personalRecurringTotal, "USD", { precision: 0 })}/mo`}
            title="Personal <em>recurring</em>"
            deck="Bills you owe on a schedule. Edit cadence and category from the row."
          />
        }
      >
        <ExpenseList initialData={initialExpenses} />
      </CollapsibleSection>

      <CollapsibleSection
        head={
          <DepartmentHead
            kicker="Shared · Households"
            count={`${sharedSplitGroups.length} ${pluralize("bill", sharedSplitGroups.length)} · ${formatCurrency(sharedTotal, "USD", { precision: 0 })}/mo`}
            title="Shared <em>household splits</em>"
            deck="Your share of recurring bills across every household you contribute to."
          />
        }
      >
        {sharedSplitGroups.length > 0 ? (
          <SharedSplitsTable groups={sharedSplitGroups} householdNamesById={householdNamesById} />
        ) : (
          <EmptyDispatch>
            No shared household bills <em>due</em> this month
          </EmptyDispatch>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        head={
          <DepartmentHead
            kicker={`One-time · ${selectedMonthName}`}
            count={
              oneTimeCount > 0
                ? `${oneTimeCount} ${pluralize("expense", oneTimeCount)} · ${formatCurrency(oneTimeTotal, "USD", { precision: 0 })}`
                : "—"
            }
            title="One time <em>this month</em>"
            deck="Non-recurring outlays posted to the selected period. Edit or remove from the row."
          />
        }
      >
        <PersonalOneTimeList expenses={oneTimePersonalExpenses} />
      </CollapsibleSection>
    </div>
  );
}

/** A bill section whose body collapses under its DepartmentHead. Default open;
 *  a discreet Hide/Show toggle keeps the editorial header intact (rather than
 *  swapping it for a plainer accordion trigger). */
function CollapsibleSection({ head, children }: { head: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const contentId = useId();
  return (
    <section className="flex flex-col gap-5">
      {head}
      <div className="-mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={contentId}
          className="ed-label-muted inline-flex items-center gap-1 hover:text-red"
        >
          {open ? "Hide" : "Show"}
          <Icon name={open ? "chevDown" : "chevRight"} size={12} strokeWidth={2} />
        </button>
      </div>
      <div id={contentId} hidden={!open}>
        {children}
      </div>
    </section>
  );
}
