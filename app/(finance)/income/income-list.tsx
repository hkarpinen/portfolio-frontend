"use client";

import { EmptyState, Icon } from "@/components/editorial";
import { useDeleteIncomeSource, useIncome } from "@/hooks/use-income";
import type { IncomeListResponse, IncomeSource } from "@/types/income";

import { IncomeCard } from "./income-card";

/**
 * The income page's primary list. Manages the delete mutation and the
 * empty-state branch; each row's interaction live in `<IncomeCard>`.
 */
export function IncomeList({ initialData }: { initialData: IncomeListResponse }) {
  const { data } = useIncome(initialData);
  const sources: IncomeSource[] = data?.items ?? [];
  const deleteIncome = useDeleteIncomeSource();

  if (sources.length === 0) {
    return (
      <EmptyState
        glyph={<Icon name="dollar" size={24} strokeWidth={2} />}
        title="No income sources yet"
        body="Add a salary, freelance contract, or any other income stream to start tracking your take-home pay."
        cta={{ label: "+ Add income source", href: "/income/new" }}
      />
    );
  }

  return (
    <section aria-label="Income sources">
      <h2 className="ed-h3 mb-6">
        Income <em>sources</em>
      </h2>
      <div aria-live="polite" aria-atomic="false" className="sr-only" role="status">
        {deleteIncome.isPending ? "Removing income source…" : ""}
      </div>
      <div className="mb-12 flex flex-col gap-4">
        {sources.map((source) => (
          <IncomeCard
            key={source.incomeId}
            source={source}
            onDelete={(id) => deleteIncome.mutate(id)}
            deleteDisabled={deleteIncome.isPending}
          />
        ))}
      </div>
    </section>
  );
}
