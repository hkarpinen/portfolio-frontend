"use client";

import { Icon } from "@/components/editorial";
import { SectionHead } from "../../section-head";
import { useId, useState, type ReactNode } from "react";
import { useOverview } from "@/hooks/use-household";
import { useIncome } from "@/hooks/use-income";
import { useExpenses } from "@/hooks/use-expenses";
import { ExpenseList } from "./expense-list";
import { FinancialSummary } from "./financial-summary";
import { PersonalOneTimeList } from "./personal-one-time-list";
import { SharedSplitsTable, groupSharedSplitsByBill } from "./shared-splits-table";
import { buildRecentExpenses, spendByCategory } from "./expenses-derivations";

import { findCurrentPeriod, recurringPersonalBills } from "@/lib/contributions";
import { categoryIcon } from "@/lib/expense-category";
import { formatCurrency, formatShortDate } from "@/lib/formatting";
import { pluralize, sumBy, toMonthlyAmount } from "@/lib/utils";
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

  // Prototype overview blocks (`.grid-2`): the RECENT_EXPENSES `.tx-row` stack
  // and the BUDGET_OVERVIEW bars are both derived from the selected period.
  const recentExpenses = buildRecentExpenses(selectedPeriod);
  const budgetCategories = spendByCategory(selectedPeriod);

  // One-time slice comes from the full personal-expenses list (not the period
  // projection) because the row component needs the full `Expense` shape for
  // its inline edit form. Filter to the selected period so the dept-head count
  // and the list contents are computed from the same source.
  const { data: livePersonalExpenses } = useExpenses(initialExpenses);
  const personalMonthKey = selectedPeriod?.periodStart.slice(0, 7);
  const oneTimePersonalExpenses: Expense[] = (livePersonalExpenses?.items ?? []).filter(
    (e) => !e.recurrenceFrequency && e.dueDate.slice(0, 7) === personalMonthKey,
  );

  // Section head counts/totals for each section header.
  const personalRecurringCount = personalRecurringBills.length;
  const personalRecurringTotal = sumBy(personalRecurringBills, (b) => b.amount);
  const sharedTotal = sumBy(sharedSplitGroups, (g) => g.monthlyAmount);
  const oneTimeCount = oneTimePersonalExpenses.length;
  const oneTimeTotal = sumBy(oneTimePersonalExpenses, (e) => e.amount);

  return (
    <div className="flex flex-col gap-10">
      {months.length > 1 && (
        <div className="flex items-center justify-end gap-2">
          <label htmlFor="money-period" className="label">
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

      {/* Stats strip — prototype `.stats` 4-up (Net / Expenses / Income / Savings rate). */}
      <FinancialSummary
        period={selectedPeriod}
        incomeSources={incomeSources}
        monthName={selectedMonthName}
      />

      {afterSummary}

      {/* Prototype `.grid-2`: RECENT_EXPENSES tx-rows (left) · income cards + budget bars (right). */}
      <div className="grid-2" style={{ gap: "16px" }}>
        <div>
          <div className="section-h">
            <h2>// RECENT_EXPENSES</h2>
          </div>
          {recentExpenses.length > 0 ? (
            <div className="stack">
              {recentExpenses.map((tx) => (
                <div key={tx.key} className="tx-row">
                  <div className="tx-icon">
                    <Icon name={categoryIcon(tx.category)} size={15} strokeWidth={1.75} />
                  </div>
                  <div className="tx-body">
                    <div className="tx-name">{tx.name}</div>
                    <div className="tx-sub">
                      {(tx.category || "Other") + " · " + formatShortDate(tx.dueDate)}
                    </div>
                  </div>
                  <div className="tx-amount debit">
                    −{formatCurrency(tx.amount, tx.currency, { precision: 2 })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="label" style={{ color: "var(--text-3)" }}>
              No outgoings posted this month.
            </p>
          )}
        </div>

        <div>
          <div className="section-h">
            <h2>// INCOME_SOURCES</h2>
          </div>
          {incomeSources.length > 0 ? (
            incomeSources.slice(0, 3).map((src) => (
              <div key={src.incomeId} className="card" style={{ marginBottom: "10px" }}>
                <div className="label">{src.source}</div>
                <div
                  style={{
                    font: "700 1.375rem/1 var(--ff-mono)",
                    color: "var(--green)",
                    margin: "8px 0",
                  }}
                >
                  {formatCurrency(toMonthlyAmount(src.amount, src.quotedAs), src.currency ?? "USD", {
                    precision: 0,
                  })}
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-4)",
                      fontWeight: 500,
                    }}
                  >
                    /mo
                  </span>
                </div>
                <div className="label">
                  {(src.paidEvery ?? "Biweekly") + " · paid " + (src.paidEvery ?? "biweekly")}
                </div>
              </div>
            ))
          ) : (
            <p className="label" style={{ color: "var(--text-3)", marginBottom: "18px" }}>
              No income sources on file.
            </p>
          )}

          {/* BUDGET_OVERVIEW — no budget-target model exists yet, so these bars
              show real per-category spend as a share of the heaviest category
              (share-of-peak, not share-of-budget). Data gap noted in code. */}
          <div className="section-h" style={{ marginTop: "8px" }}>
            <h2>// SPEND_BY_CATEGORY</h2>
          </div>
          {budgetCategories.length > 0 ? (
            budgetCategories.map((cat) => (
              <div key={cat.category} style={{ marginBottom: "12px" }}>
                <div
                  className="row"
                  style={{ justifyContent: "space-between", marginBottom: "5px" }}
                >
                  <span style={{ font: "500 0.75rem/1 var(--ff-mono)", color: "var(--text)" }}>
                    {cat.category}
                  </span>
                  <span style={{ font: "400 0.68rem/1 var(--ff-mono)", color: "var(--text-4)" }}>
                    {formatCurrency(cat.spent, "USD", { precision: 0 })}
                  </span>
                </div>
                <div
                  style={{
                    height: "4px",
                    background: "var(--raised)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {/* dynamic fill — share of the heaviest category */}
                  <div style={{ width: `${cat.pct}%`, height: "100%", background: "var(--amber)" }} />
                </div>
              </div>
            ))
          ) : (
            <p className="label" style={{ color: "var(--text-3)" }}>
              No categorized spend this month.
            </p>
          )}
        </div>
      </div>

      <CollapsibleSection
        head={
          <SectionHead
            kicker="RECURRING · PERSONAL"
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
          <SectionHead
            kicker="SHARED · HOUSEHOLDS"
            count={`${sharedSplitGroups.length} ${pluralize("bill", sharedSplitGroups.length)} · ${formatCurrency(sharedTotal, "USD", { precision: 0 })}/mo`}
            title="Shared <em>household splits</em>"
            deck="Your share of recurring bills across every household you contribute to."
          />
        }
      >
        {sharedSplitGroups.length > 0 ? (
          <SharedSplitsTable groups={sharedSplitGroups} householdNamesById={householdNamesById} />
        ) : (
          <p className="label" style={{ color: "var(--text-3)" }}>
            No shared household bills due this month.
          </p>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        head={
          <SectionHead
            kicker={`ONE-TIME · ${selectedMonthName.toUpperCase()}`}
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

/** A bill section whose body collapses under its SectionHead. Default open;
 *  a discreet Hide/Show toggle keeps the section header intact (rather than
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
          className="label inline-flex items-center gap-1 hover:text-red"
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
