"use client";

import { Alert, Btn, Input, SelectField, UserInitials } from "@/components/editorial";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getErrorMessage } from "@/lib/error-messages";
import { useAddExpenseSplit, useRemoveExpenseSplit } from "@/hooks/use-expenses";

import type { HouseholdExpenseDetailResponse } from "@/types/household-expense";
import { formatCurrency } from "@/lib/formatting";

const splitSchema = z.object({
  membershipId: z.string().optional(),
  amount: z
    .string()
    .min(1)
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be positive"),
});

type FormData = z.infer<typeof splitSchema>;

function TintedStatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    // background/border/color are runtime CSS-relative-color expressions — kept as dynamic style
    <div
      className="p-[16px_20px]"
      style={
        {
          background: color ? `oklch(from ${color} l c h / 0.06)` : "var(--paper-2)",
          border: `1px solid ${color ? `oklch(from ${color} l c h / 0.3)` : "var(--ink-3)"}`,
        } as React.CSSProperties
      }
    >
      <p className="text-sm font-medium uppercase tracking-[0.06em] text-ink-3">{label}</p>
      <p
        className="mt-2 font-serif text-2xl font-extrabold tracking-[-0.025em]"
        style={{ color: color ?? "var(--text)" }}
      >
        {value}
      </p>
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

export function ExpenseSplits({
  expense,
  splits,
  members,
  isPrivileged,
  currentMembership,
  householdId,
  expenseId,
}: ExpenseSplitsProps) {
  const addExpenseSplitMutation = useAddExpenseSplit(householdId, expenseId);
  const removeSplitMutation = useRemoveExpenseSplit(householdId, expenseId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(splitSchema),
  });

  const splitTotal = splits.reduce((sum, s) => sum + Number(s.amount), 0);
  const remaining = Number(expense.amount) - splitTotal;

  const onAddSplit = (data: FormData) => {
    const membershipId = isPrivileged ? data.membershipId : currentMembership?.membershipId;
    if (!membershipId) return;
    addExpenseSplitMutation.mutate(
      { membershipId, amount: Number(data.amount), currency: expense.currency },
      { onSuccess: () => reset() },
    );
  };

  return (
    <>
      {/* Stats */}
      <div className="stats-grid-3">
        <TintedStatCard
          label="Total"
          value={formatCurrency(Number(expense.amount), expense.currency)}
        />
        <TintedStatCard
          label="Allocated"
          value={formatCurrency(splitTotal, expense.currency)}
          color={splitTotal > 0 ? "var(--success)" : undefined}
        />
        <TintedStatCard
          label="Unallocated"
          value={formatCurrency(remaining, expense.currency)}
          color={remaining > 0.001 ? "var(--warning)" : "var(--success)"}
        />
      </div>

      {/* Progress bar */}
      {expense.amount > 0 && (
        <div className="border-ink bg-paper px-10 py-8">
          <div className="mb-4 flex justify-between">
            <span className="text-base text-ink-3">Allocation progress</span>
            <span className="text-base font-semibold text-ink">
              {((splitTotal / Number(expense.amount)) * 100).toFixed(0)}%
            </span>
          </div>
          <div
            className="h-3 overflow-hidden rounded-full bg-paper-3"
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
        <h2 className="mb-6 font-serif text-lg font-bold text-ink">Splits</h2>

        {splits.length === 0 ? (
          <div className="mb-8 border-ink bg-paper p-16 text-center">
            <p className="text-base text-ink-3">No splits yet — the full amount is unallocated.</p>
          </div>
        ) : (
          <div className="mb-8 flex flex-col gap-4">
            {splits.map((split) => {
              const isRemoving =
                removeSplitMutation.isPending && removeSplitMutation.variables === split.splitId;
              return (
                <div
                  key={split.splitId}
                  className={`flex items-center justify-between border-ink bg-paper px-8 py-6 transition-opacity duration-150${isRemoving ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-5">
                    <UserInitials name={split.displayName} size="lg" />
                    <div>
                      <p className="text-base font-medium text-ink">
                        {split.displayName ||
                          `${(split.splitId ?? split.userId ?? "").slice(0, 8)}…`}
                      </p>
                      <p className="text-sm text-ink-3">
                        {split.role}
                        {split.isClaimed ? " · Claimed" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-serif text-md font-bold text-ink">
                      {formatCurrency(Number(split.amount), split.currency)}
                    </span>
                    {split.isClaimed ? (
                      <span className="bg-green-soft px-4 py-1 font-mono text-sm text-green">
                        Claimed
                      </span>
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
        <div className="border-ink bg-paper p-10">
          <h3 className="mb-8 font-serif text-md font-bold text-ink">Add Split</h3>

          {!currentMembership ? (
            <p className="text-base text-ink-3">You are not a member of this household.</p>
          ) : (
            <form onSubmit={handleSubmit(onAddSplit)} className="flex flex-col gap-6">
              {addExpenseSplitMutation.isError && (
                <Alert variant="danger">
                  {getErrorMessage(addExpenseSplitMutation.error)}
                </Alert>
              )}

              {isPrivileged && (
                <SelectField
                  label="Member"
                  {...register("membershipId")}
                  error={errors.membershipId?.message}
                >
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
