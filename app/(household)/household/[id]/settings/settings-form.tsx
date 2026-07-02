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
  const updateHouseholdMutation = useUpdateHousehold(household.id);

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
    // .card // GENERAL — Terminus settings general panel
    <div className="card">
      <h3 className="card-h" style={{ marginBottom: 14 }}>
        // GENERAL
      </h3>
      <form onSubmit={handleSubmit(onSave)} className="form full">
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
        <div className="field-row">
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
        <div className="form-actions">
          <Btn type="submit" disabled={updateHouseholdMutation.isPending} variant="primary">
            {updateHouseholdMutation.isPending ? "Saving…" : "Save Changes"}
          </Btn>
        </div>
      </form>
    </div>
  );
}
