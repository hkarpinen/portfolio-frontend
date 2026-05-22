"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Btn, Alert, Input, Textarea, SelectField } from "@/components/editorial";
import { useUpdateHousehold } from "@/hooks/use-household";
import { useRouter } from "next/navigation";
import type { Household } from "@/types/finance";

const SPLIT_METHODS = ["Equal", "ByIncome", "Custom", "Percentage"] as const;
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "SEK", "NOK", "DKK"] as const;

const settingsSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  currencyCode: z.string().min(1, "Currency is required"),
  defaultSplitMethod: z.string().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export function SettingsForm({ household }: { household: Household }) {
  const router = useRouter();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const updateHouseholdMutation = useUpdateHousehold(household.householdId);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: household.name,
      description: household.description ?? "",
      currencyCode: household.currencyCode ?? "USD",
    },
  });

  const onSave = async (data: SettingsForm) => {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateHouseholdMutation.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        currencyCode: data.currencyCode,
      });
      setSaveSuccess(true);
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--paper-2)",
    padding: "24px",
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  return (
    <section className="border-ink" style={cardStyle}>
      <p className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em]">
        Household Details
      </p>
      <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-[14px]">
        {saveError && <Alert variant="danger">{saveError}</Alert>}
        {saveSuccess && <Alert variant="success">Changes saved!</Alert>}
        <Input label="Name" {...register("name")} error={errors.name?.message} />
        <Textarea
          label="Description"
          {...register("description")}
          rows={3}
          error={errors.description?.message}
        />
        <div className="form-grid-2">
          <SelectField label="Currency" {...register("currencyCode")} error={errors.currencyCode?.message}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </SelectField>
          <SelectField label="Default Split" {...register("defaultSplitMethod")}>
            {SPLIT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </SelectField>
        </div>
        <Btn type="submit" disabled={isSubmitting} variant="primary">
          {isSubmitting ? "Saving…" : "Save Changes"}
        </Btn>
      </form>
    </section>
  );
}
