"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ApiError } from "@/lib/api-client";
import { ERROR } from "@/lib/error-messages";
import { getInitials } from "@/lib/utils";
import { useAddExpenseSplit, useRemoveExpenseSplit } from "@/hooks/use-expenses";
import { Btn, Alert, Input, SelectField } from "@/components/editorial";
import type { HouseholdExpenseDetailResponse } from "@/types/finance";
import { formatCurrency, formatAmount } from "@/lib/formatting";

const splitSchema = z.object({
  membershipId: z.string().optional(),
  amount: z.string().min(1).refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be positive"),
});

type FormData = z.infer<typeof splitSchema>;

function TintedStatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    // background/border/color are runtime CSS-relative-color expressions — kept as dynamic style
    <div className="p-[16px_20px]" style={{
      background: color ? `oklch(from ${color} l c h / 0.06)` : "var(--paper-2)",
      border: `1px solid ${color ? `oklch(from ${color} l c h / 0.3)` : "var(--ink-3)"}`,
    } as React.CSSProperties}>
      <p className="text-sm text-ink-3 uppercase tracking-[0.06em] font-medium">{label}</p>
      <p className="font-serif font-extrabold text-2xl tracking-[-0.025em] mt-2" style={{ color: color ?? "var(--text)" }}>{value}</p>
    </div>
  );
}

type Member = { membershipId: string; userId: string; displayName?: string; role: string };
type Split = HouseholdExpenseDetailResponse["splits"][number];

interface ExpenseSplitsProps {
  expense: HouseholdExpenseDetailResponse["expense"];
  splits: Split[];
  members: Member[];
  isPrivileged: boolean;
  currentMembership: Member | null;
  householdId: string;
  expenseId: string;
}

export function ExpenseSplits({ expense, splits, members, isPrivileged, currentMembership, householdId, expenseId }: ExpenseSplitsProps) {
  const addExpenseSplitMutation = useAddExpenseSplit(householdId, expenseId);
  const removeSplitMutation = useRemoveExpenseSplit(householdId, expenseId);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(splitSchema),
  });

  const splitTotal = splits.reduce((sum, s) => sum + Number(s.amount), 0);
  const remaining = Number(expense.amount) - splitTotal;

  const onAddSplit = (data: FormData) => {
    const membershipId = isPrivileged ? data.membershipId : currentMembership?.membershipId;
    if (!membershipId) return;
    addExpenseSplitMutation.mutate(
      { membershipId, amount: Number(data.amount), currency: expense.currency },
      { onSuccess: () => reset() }
    );
  };

  return (
    <>
      {/* Stats */}
      <div className="stats-grid-3">
        <TintedStatCard label="Total" value={formatCurrency(Number(expense.amount), expense.currency)} />
        <TintedStatCard label="Allocated" value={formatCurrency(splitTotal, expense.currency)} color={splitTotal > 0 ? "var(--success)" : undefined} />
        <TintedStatCard label="Unallocated" value={formatCurrency(remaining, expense.currency)} color={remaining > 0.001 ? "var(--warning)" : "var(--success)"} />
      </div>

      {/* Progress bar */}
      {expense.amount > 0 && (
        <div className="bg-paper py-8 px-10 border-ink">
          <div className="flex justify-between mb-4">
            <span className="text-base text-ink-3">Allocation progress</span>
            <span className="text-base font-semibold text-ink">
              {((splitTotal / Number(expense.amount)) * 100).toFixed(0)}%
            </span>
          </div>
          <div
            className="h-3 bg-paper-3 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round((splitTotal / Number(expense.amount)) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Allocation progress"
          >
            {/* width and bg are runtime values — kept as dynamic style */}
            <div
              className="h-full rounded-full"
              style={{
                background: remaining > 0.001 ? "var(--warning)" : "var(--success)",
                width: `${Math.min((splitTotal / Number(expense.amount)) * 100, 100)}%`,
                transition: "width 500ms cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          </div>
        </div>
      )}

      {/* Splits list */}
      <div>
        <h2 className="font-serif font-bold text-lg text-ink mb-6">Splits</h2>

        {splits.length === 0 ? (
          <div className="bg-paper p-16 text-center mb-8 border-ink">
            <p className="text-base text-ink-3">No splits yet — the full amount is unallocated.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mb-8">
            {splits.map((split) => {
              const initials = getInitials(split.displayName);
              const isRemoving = removeSplitMutation.isPending && removeSplitMutation.variables === split.splitId;
              return (
                <div
                  key={split.splitId}
                  className={`bg-paper py-6 px-8 flex items-center justify-between border-ink transition-opacity duration-150${isRemoving ? " opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-5">
                    <span className="w-16 h-16 bg-red-soft text-red flex items-center justify-center text-sm font-bold font-serif">{initials}</span>
                    <div>
                      <p className="text-base font-medium text-ink">
                        {split.displayName || `${(split.splitId ?? split.userId ?? "").slice(0, 8)}…`}
                      </p>
                      <p className="text-sm text-ink-3">
                        {split.role}{split.isClaimed ? " · Claimed" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-serif font-bold text-md text-ink">{formatCurrency(Number(split.amount), split.currency)}</span>
                    {split.isClaimed ? (
                      <span className="py-1 px-4 bg-green-soft text-green text-sm font-mono">Claimed</span>
                    ) : (
                      <Btn
                        variant="outline"
                        size="xs"
                        disabled={isRemoving}
                        onClick={() => removeSplitMutation.mutate(split.splitId)}
                      >
                        {isRemoving ? "Removing…" : "Remove"}
                      </Btn>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add split form */}
        <div className="bg-paper p-10 border-ink">
          <h3 className="font-serif font-bold text-md text-ink mb-8">Add Split</h3>

          {!currentMembership ? (
            <p className="text-base text-ink-3">You are not a member of this household.</p>
          ) : (
            <form onSubmit={handleSubmit(onAddSplit)} className="flex flex-col gap-6">
              {addExpenseSplitMutation.isError && (
                <Alert variant="danger">
                  {addExpenseSplitMutation.error instanceof ApiError ? addExpenseSplitMutation.error.message : ERROR.DEFAULT}
                </Alert>
              )}

              {isPrivileged && (
                <SelectField label="Member" {...register("membershipId")} error={errors.membershipId?.message}>
                  <option value="">Select member</option>
                  {members.map((m) => (
                    <option key={m.membershipId} value={m.membershipId}>
                      {m.displayName || `${m.userId.slice(0, 8)}…`} ({m.role})
                    </option>
                  ))}
                </SelectField>
              )}

              {!isPrivileged && (
                <p className="text-base text-ink-3">
                  Split will be added for you ({currentMembership.role}).
                </p>
              )}

              <Input
                label={`Amount (${expense.currency})`}
                type="number"
                step="0.01"
                {...register("amount")}
                placeholder={remaining > 0 ? remaining.toFixed(2) : "0.00"}
                error={errors.amount?.message}
              />

              <Btn type="submit" disabled={addExpenseSplitMutation.isPending} variant="primary">
                {addExpenseSplitMutation.isPending ? "Adding…" : "Add Split"}
              </Btn>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
