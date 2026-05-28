"use client";

import { Btn, Input, SelectField } from "@/components/editorial";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateIncomeSource } from "@/hooks/use-income";
import type { IncomeSource } from "@/types/income";
import { FREQUENCY_LABELS, Frequency } from "@/types/schedule";
import { incomeSchema, INCOME_FREQUENCY_OPTIONS, type IncomeFormData } from "./_income-form-shared";
import { parseEnum } from "@/lib/parse-enum";

/**
 * The inline "edit income source" form that expands inside an IncomeCard.
 * Owned its own file so the row + the form don't grow as one ~300-line
 * monolith.
 */
export function IncomeCardEditForm({
  source,
  onClose,
}: {
  source: IncomeSource;
  onClose: () => void;
}) {
  const updateIncome = useUpdateIncomeSource();

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    values: {
      source: source.source,
      amount: String(source.amount),
      currency: source.currency ?? "USD",
      // parseEnum (audit §1.2): narrow at the seam, with a safe default if
      // the backend ever ships an unrecognised cadence (instead of the
      // form mounting with a corrupt enum and exploding on submit).
      quotedAs: parseEnum(Frequency, source.quotedAs, Frequency.Annually),
      paidEvery: parseEnum(Frequency, source.paidEvery, Frequency.BiWeekly),
      startDate: source.startDate ? source.startDate.slice(0, 10) : "",
      lastPaycheckDate: source.lastPaycheckDate
        ? source.lastPaycheckDate.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = (data: IncomeFormData) => {
    updateIncome.mutate(
      { incomeId: source.incomeId, body: { ...data, amount: Number(data.amount) } },
      { onSuccess: onClose },
    );
  };

  return (
    <form
      id={`income-edit-${source.incomeId}`}
      onSubmit={handleSubmit(onSubmit)}
      className="mt-7 flex flex-col gap-5 border-t border-ink pt-7"
      aria-label={`Edit ${source.source}`}
      noValidate
    >
      <p className="m-0 text-sm font-bold uppercase tracking-[0.08em] text-ink-3">
        Edit income source
      </p>

      <div className="grid grid-cols-2 gap-5">
        <Input label="Source name" error={errors.source?.message} {...register("source")} />
        <SelectField label="Currency" error={errors.currency?.message} {...register("currency")}>
          <option value="USD">USD — US Dollar</option>
          <option value="EUR">EUR — Euro</option>
          <option value="GBP">GBP — British Pound</option>
          <option value="CAD">CAD — Canadian Dollar</option>
        </SelectField>
        <Input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          label="Amount"
          error={errors.amount?.message}
          {...register("amount")}
        />
        <SelectField
          label="Amount quoted as"
          error={errors.quotedAs?.message}
          {...register("quotedAs")}
        >
          {INCOME_FREQUENCY_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {FREQUENCY_LABELS[f]}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Paid every"
          error={errors.paidEvery?.message}
          {...register("paidEvery")}
        >
          {INCOME_FREQUENCY_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {FREQUENCY_LABELS[f]}
            </option>
          ))}
        </SelectField>
        <Input
          type="date"
          label="Start date"
          error={errors.startDate?.message}
          {...register("startDate")}
        />
        <Input
          type="date"
          label="Last paycheck date"
          error={errors.lastPaycheckDate?.message}
          {...register("lastPaycheckDate")}
        />
      </div>

      {updateIncome.isError && (
        <p className="m-0 text-base text-red" role="alert">
          Failed to save. Please try again.
        </p>
      )}
      <div className="flex justify-end gap-4">
        <Btn
          type="button"
          variant="secondary"
          size="xs"
          onClick={() => {
            onClose();
            resetForm();
          }}
        >
          Cancel
        </Btn>
        <Btn type="submit" variant="primary" size="xs" loading={updateIncome.isPending}>
          {updateIncome.isPending ? "Saving…" : "Save changes"}
        </Btn>
      </div>
    </form>
  );
}
