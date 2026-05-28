"use client";

import { Alert, Btn, Input, SelectField } from "@/components/editorial";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateIncomeSource } from "@/hooks/use-income";
import { getErrorMessage } from "@/lib/error-messages";
import { type IncomeFormData, INCOME_FREQUENCY_OPTIONS, incomeSchema } from "./_income-form-shared";
import { Frequency, FREQUENCY_LABELS } from "@/types/schedule";

import type { PayrollDeduction } from "@/types/deductions";
import { DeductionAccumulator } from "./deduction-accumulator";

export function AddIncomeForm() {
  const router = useRouter();
  const createIncome = useCreateIncomeSource();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      currency: "USD",
      quotedAs: Frequency.Annually,
      paidEvery: Frequency.BiWeekly,
      startDate: new Date().toISOString().slice(0, 10),
      lastPaycheckDate: new Date().toISOString().slice(0, 10),
    },
  });

  // Pending deductions accumulate in the child component but live up here
  // so they ride along on submit.
  const [deductions, setDeductions] = useState<PayrollDeduction[]>([]);

  const onSubmit = (data: IncomeFormData) => {
    createIncome.mutate(
      {
        source: data.source,
        amount: Number(data.amount),
        currency: data.currency,
        quotedAs: data.quotedAs,
        paidEvery: data.paidEvery,
        startDate: new Date(data.startDate).toISOString(),
        lastPaycheckDate: new Date(data.lastPaycheckDate).toISOString(),
        initialDeductions: deductions.length > 0 ? deductions : undefined,
      },
      {
        onSuccess: () => {
          reset();
          setDeductions([]);
          router.push("/income");
        },
      },
    );
  };

  return (
    <div className="border-ink bg-paper p-10 shadow-stamp">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-7"
        aria-label="Add income source"
        noValidate
      >
        {createIncome.isError && (
          <Alert variant="danger" role="alert">
            {getErrorMessage(createIncome.error)}
          </Alert>
        )}
        {createIncome.isSuccess && (
          <Alert variant="success" role="status">
            Income source saved — redirecting…
          </Alert>
        )}

        <Input
          type="text"
          label="Source name"
          placeholder="e.g. Acme Corp, Freelance Design…"
          error={errors.source?.message}
          autoFocus
          autoComplete="organization"
          {...register("source")}
        />

        <div className="form-grid-2">
          <div>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              label="Amount"
              placeholder="0.00"
              error={errors.amount?.message}
              aria-describedby="income-amount-hint"
              {...register("amount")}
            />
            <p id="income-amount-hint" className="sr-only">
              Enter the gross amount as it appears on your offer letter or contract. Select how it
              is quoted below.
            </p>
          </div>
          <SelectField label="Currency" {...register("currency")}>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="CAD">CAD — Canadian Dollar</option>
          </SelectField>
        </div>

        <div className="form-grid-2">
          <SelectField
            label="Amount quoted as"
            error={errors.quotedAs?.message}
            aria-describedby="quoted-as-hint"
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
            aria-describedby="paid-every-hint"
            {...register("paidEvery")}
          >
            {INCOME_FREQUENCY_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {FREQUENCY_LABELS[f]}
              </option>
            ))}
          </SelectField>
          <p id="quoted-as-hint" className="sr-only">
            How the amount is expressed — e.g. annually for a salary, weekly for hourly.
          </p>
          <p id="paid-every-hint" className="sr-only">
            How often you actually receive a paycheck — e.g. bi-weekly for most salaried jobs.
          </p>
        </div>

        <div className="form-grid-2">
          <Input
            type="date"
            label="Income start date"
            error={errors.startDate?.message}
            aria-describedby="start-date-hint"
            {...register("startDate")}
          />
          <Input
            type="date"
            label="Last paycheck date"
            error={errors.lastPaycheckDate?.message}
            aria-describedby="last-paycheck-hint"
            {...register("lastPaycheckDate")}
          />
          <p id="start-date-hint" className="sr-only">
            When you started receiving this income.
          </p>
          <p id="last-paycheck-hint" className="sr-only">
            Used to calculate the next expected paycheck date.
          </p>
        </div>

        <DeductionAccumulator value={deductions} onChange={setDeductions} />

        <div className="mt-2 flex gap-4">
          <Btn
            type="button"
            variant="secondary"
            onClick={() => router.push("/income")}
            className="flex-1"
          >
            Cancel
          </Btn>
          <Btn type="submit" disabled={createIncome.isPending} variant="primary" className="flex-1">
            {createIncome.isPending
              ? "Saving…"
              : deductions.length > 0
                ? `Add source with ${deductions.length} deduction${deductions.length > 1 ? "s" : ""}`
                : "Add Income Source"}
          </Btn>
        </div>
      </form>
    </div>
  );
}
