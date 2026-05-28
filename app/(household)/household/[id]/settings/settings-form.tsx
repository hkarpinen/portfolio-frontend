"use client";

import { Alert, Btn, Input, SelectField, Textarea } from "@/components/editorial";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useUpdateHousehold } from "@/hooks/use-household";
import { getErrorMessage } from "@/lib/error-messages";
import { useRouter } from "next/navigation";
import type { Household } from "@/types/household";

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
  const updateHouseholdMutation = useUpdateHousehold(household.householdId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: household.name,
      description: household.description ?? "",
      currencyCode: household.currencyCode ?? "USD",
    },
  });

  const onSave = (data: SettingsForm) => {
    updateHouseholdMutation.mutate(
      {
        name: data.name,
        description: data.description || undefined,
        currencyCode: data.currencyCode,
      },
      { onSuccess: () => router.refresh() },
    );
  };

  return (
    <section className="flex flex-col gap-[16px] border-ink bg-paper-2 p-[24px] shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.1em] text-ink-3">Household Details</p>
      <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-[14px]">
        {updateHouseholdMutation.isError && (
          <Alert variant="danger">{getErrorMessage(updateHouseholdMutation.error)}</Alert>
        )}
        {updateHouseholdMutation.isSuccess && <Alert variant="success">Changes saved!</Alert>}
        <Input label="Name" {...register("name")} error={errors.name?.message} />
        <Textarea
          label="Description"
          {...register("description")}
          rows={3}
          error={errors.description?.message}
        />
        <div className="form-grid-2">
          <SelectField
            label="Currency"
            {...register("currencyCode")}
            error={errors.currencyCode?.message}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>
          <SelectField label="Default Split" {...register("defaultSplitMethod")}>
            {SPLIT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </SelectField>
        </div>
        <Btn type="submit" disabled={updateHouseholdMutation.isPending} variant="primary">
          {updateHouseholdMutation.isPending ? "Saving…" : "Save Changes"}
        </Btn>
      </form>
    </section>
  );
}
