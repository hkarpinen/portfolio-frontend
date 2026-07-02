"use client";

import {
  Alert,
  ArrowLink,
  Btn,
  Icon,
  Input,
  SectionHeader,
  SelectField,
  Textarea,
} from "@/components/editorial";
import { useRouter } from "next/navigation";
import { memberDisplayName } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useCreateHouseholdExpense } from "@/hooks/use-expenses";
import { useHouseholdMembers } from "@/hooks/use-household";
import { useMe } from "@/hooks/use-identity";
import { getErrorMessage } from "@/lib/error-messages";

type FundingSource = "PayerMember" | "GroupCash";

const CATEGORIES = [
  "Rent",
  "Utilities",
  "Groceries",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Insurance",
  "Subscriptions",
  "Internet",
  "Phone",
  "Other",
] as const;

const FREQUENCIES = ["Monthly", "Weekly", "BiWeekly", "Annually"] as const;

const schema = z.object({
  title: z.string().min(1, "Name is required").max(100),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Amount must be positive"),
  currency: z.string(),
  category: z.enum(CATEGORIES),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().max(500).optional(),
  isRecurring: z.boolean(),
  recurrenceFrequency: z.enum(FREQUENCIES).optional(),
});

type FormData = z.infer<typeof schema>;

interface SplitEntry {
  userId: string;
  displayName: string;
  checked: boolean;
  percent: string;
}

export default function NewExpensePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const createExpense = useCreateHouseholdExpense(params.id);
  const { data: membersRaw } = useHouseholdMembers(params.id);
  const { data: me } = useMe();
  const members = membersRaw ?? [];

  // Who paid the vendor: a member fronted it (PayerMember, default) or it came from the shared pot
  // (GroupCash). For PayerMember the payer defaults to the current user.
  const [fundingSource, setFundingSource] = useState<FundingSource>("PayerMember");
  const [payerUserId, setPayerUserId] = useState<string>("");

  useEffect(() => {
    if (!payerUserId && me?.id) setPayerUserId(me.id);
  }, [me?.id, payerUserId]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "USD", isRecurring: false },
  });

  const isRecurring = watch("isRecurring");

  // Split state: initialised once members load
  const [splits, setSplits] = useState<SplitEntry[]>([]);

  useEffect(() => {
    if (members.length > 0 && splits.length === 0) {
      const evenPct = members.length > 0 ? (100 / members.length).toFixed(2) : "0.00";
      setSplits(
        members.map((m: any) => ({
          userId: m.userId as string,
          displayName: memberDisplayName(m),
          checked: true,
          percent: evenPct,
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members.length]);

  const checkedSplits = splits.filter((s) => s.checked);
  const totalPct = checkedSplits.reduce((sum, s) => sum + (parseFloat(s.percent) || 0), 0);
  const pctValid = Math.abs(totalPct - 100) < 0.01 || checkedSplits.length === 0;

  function toggleSplit(idx: number) {
    setSplits((prev) => prev.map((s, i) => (i === idx ? { ...s, checked: !s.checked } : s)));
  }

  function updatePercent(idx: number, val: string) {
    setSplits((prev) => prev.map((s, i) => (i === idx ? { ...s, percent: val } : s)));
  }

  const onSubmit = (data: FormData) => {
    const total = Number(data.amount);
    // Percent splits -> per-member amounts. The finance API absorbs any rounding
    // remainder into the funding account, so exact-to-the-cent isn't required.
    const allocations = checkedSplits.map((s) => ({
      userId: s.userId,
      amount: Math.round(total * (parseFloat(s.percent) || 0)) / 100,
      currency: data.currency,
    }));

    createExpense.mutate(
      {
        title: data.title,
        amount: total,
        currency: data.currency,
        category: data.category,
        dueDate: new Date(data.dueDate).toISOString(),
        description: data.description,
        recurrenceFrequency: data.isRecurring ? data.recurrenceFrequency : undefined,
        fundingSource,
        payerUserId: fundingSource === "PayerMember" ? payerUserId || undefined : undefined,
        allocations: allocations.length > 0 ? allocations : undefined,
      },
      {
        onSuccess: () => router.push(`/household/${params.id}`),
      },
    );
  };

  return (
    <div className="page-enter flex max-w-[640px] flex-col gap-8">
      <ArrowLink href={`/household/${params.id}`} direction="left" className="ed-label-muted">
        Back to household
      </ArrowLink>

      <SectionHeader kicker="// EXPENSES · NEW" title="Add an <em>expense</em>" />

      <form onSubmit={handleSubmit(onSubmit)} className="form wide">
        {createExpense.isError && (
          <Alert variant="danger">{getErrorMessage(createExpense.error)}</Alert>
        )}

        <Input
          label="Name"
          type="text"
          placeholder="e.g. Groceries · Berkeley Bowl"
          error={errors.title?.message}
          {...register("title")}
        />

        <div className="field-row">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register("amount")}
          />
          <SelectField label="Currency" {...register("currency")}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </SelectField>
        </div>

        <div className="field-row">
          <Input
            label="Date"
            type="date"
            error={errors.dueDate?.message}
            {...register("dueDate")}
          />
          <SelectField label="Category" error={errors.category?.message} {...register("category")}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>
        </div>


        <Textarea
          label="Notes"
          rows={3}
          placeholder="Any additional notes"
          {...register("description")}
        />

        {/* Who paid the vendor */}
        <fieldset className="m-0 flex flex-col gap-3 border-none p-0">
          <legend className="ed-kicker mb-1">Who paid?</legend>
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="fundingSource"
                value="PayerMember"
                checked={fundingSource === "PayerMember"}
                onChange={() => setFundingSource("PayerMember")}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--red)]"
              />
              <span className="flex flex-col">
                <span className="font-serif text-base italic text-ink">A member paid</span>
                <span className="font-mono text-xs text-ink-3">
                  Someone fronted the bill — others pay them back.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="fundingSource"
                value="GroupCash"
                checked={fundingSource === "GroupCash"}
                onChange={() => setFundingSource("GroupCash")}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--red)]"
              />
              <span className="flex flex-col">
                <span className="font-serif text-base italic text-ink">From the pot</span>
                <span className="font-mono text-xs text-ink-3">
                  Paid from the shared household account — everyone pays into the pot.
                </span>
              </span>
            </label>
          </div>

          {fundingSource === "PayerMember" && members.length > 0 && (
            <SelectField
              label="Paid by"
              value={payerUserId}
              onChange={(e) => setPayerUserId(e.target.value)}
            >
              {members.map((m: any) => (
                <option key={m.userId} value={m.userId}>
                  {memberDisplayName(m)}
                </option>
              ))}
            </SelectField>
          )}
        </fieldset>

        {/* Split between section */}
        {splits.length > 0 && (
          <fieldset className="m-0 flex flex-col gap-4 border-none p-0">
            <legend className="ed-kicker mb-1">Split between</legend>
            <div className="flex flex-col gap-3">
              {splits.map((s, idx) => (
                <div key={s.userId} className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id={`split-${idx}`}
                    checked={s.checked}
                    onChange={() => toggleSplit(idx)}
                    className="h-5 w-5 shrink-0 cursor-pointer accent-[var(--red)]"
                  />
                  <label
                    htmlFor={`split-${idx}`}
                    className="flex-1 cursor-pointer font-serif text-base italic text-ink"
                  >
                    {s.displayName}
                  </label>
                  <div className="flex shrink-0 items-center gap-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      disabled={!s.checked}
                      value={s.percent}
                      onChange={(e) => updatePercent(idx, e.target.value)}
                      className="h-9 w-[72px] border border-border bg-paper px-2 text-right font-mono text-sm text-ink disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`${s.displayName} share percentage`}
                    />
                    <span className="font-mono text-sm text-ink-3" aria-hidden>
                      %
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div
              className={`flex justify-end font-mono text-sm tracking-[0.06em] ${pctValid ? "text-ink-3" : "text-red"}`}
              role={pctValid ? undefined : "alert"}
              aria-live="polite"
            >
              Total: {totalPct.toFixed(2)}%{!pctValid && " — must equal 100%"}
            </div>
          </fieldset>
        )}

        {/* Recurring expense */}
        <div className="flex flex-col gap-3 border-t border-rule-soft pt-2">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              id="isRecurring"
              type="checkbox"
              {...register("isRecurring")}
              className="h-4 w-4 accent-[var(--red)]"
            />
            <span className="font-mono text-xs uppercase tracking-[0.08em] text-ink-3">
              Recurring expense
            </span>
          </label>
          {isRecurring && (
            <SelectField label="Frequency" {...register("recurrenceFrequency")}>
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </SelectField>
          )}
        </div>

        <div className="form-actions">
          <Btn
            type="submit"
            disabled={createExpense.isPending || !pctValid}
            variant="primary"
            size="lg"
            iconRight={<Icon name="arrowRight" size={16} />}
          >
            {createExpense.isPending ? "Saving…" : "Save expense"}
          </Btn>
          <Btn
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => router.push(`/household/${params.id}`)}
          >
            Cancel
          </Btn>
        </div>
      </form>
    </div>
  );
}
