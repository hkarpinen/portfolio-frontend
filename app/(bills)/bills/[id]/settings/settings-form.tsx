"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Btn } from "@/components/editorial";
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

const inputStyle: React.CSSProperties = {
  height: "38px",
  padding: "0 12px",
  background: "var(--paper-2)",
  border: "1.5px solid var(--ink)",
  
  color: "var(--text)",
  fontSize: "var(--ts-body)",
  outline: "none",
  width: "100%",
  fontFamily: "var(--ff-body)",
};

const labelStyle: React.CSSProperties = {
  fontSize: "var(--ts-label)",
  fontWeight: "500" as const,
  color: "var(--text-2)",
  letterSpacing: "0.02em",
};

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--ink)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(178,42,26,0.08)";
}

function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--ink-3)";
  e.currentTarget.style.boxShadow = "none";
}

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
    border: "1.5px solid var(--ink)",
    
    padding: "24px",
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  return (
    <section style={cardStyle}>
      <p className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em]">
        Household Details
      </p>
      <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-[14px]">
        {saveError && (
          <div className="bg-[rgba(178,42,26,0.10)] py-[10px] px-[14px] text-base text-red" style={{ border: "1px solid var(--danger)" }}>
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="bg-[rgba(61,107,43,0.10)] py-[10px] px-[14px] text-base text-green" style={{ border: "1px solid var(--success)" }}>
            Changes saved!
          </div>
        )}
        <div className="flex flex-col gap-3">
          <label style={labelStyle}>Name</label>
          <input {...register("name")} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          {errors.name && <p className="text-red text-base">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-3">
          <label style={labelStyle}>Description</label>
          <textarea
            {...register("description")}
            rows={3}
            className="py-5 px-6 bg-paper-2 text-ink text-md outline-none w-full resize-none font-body" style={{ border: "1.5px solid var(--ink)" }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {errors.description && <p className="text-red text-base">{errors.description.message}</p>}
        </div>
        <div className="form-grid-2">
          <div className="flex flex-col gap-3">
            <label style={labelStyle}>Currency</label>
            <select {...register("currencyCode")} className="appearance-none cursor-pointer" style={{ ...inputStyle }} onFocus={handleFocus} onBlur={handleBlur}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.currencyCode && <p className="text-red text-base">{errors.currencyCode.message}</p>}
          </div>
          <div className="flex flex-col gap-3">
            <label style={labelStyle}>Default Split</label>
            <select {...register("defaultSplitMethod")} className="appearance-none cursor-pointer" style={{ ...inputStyle }} onFocus={handleFocus} onBlur={handleBlur}>
              {SPLIT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <Btn type="submit" disabled={isSubmitting} variant="primary">
          {isSubmitting ? "Saving…" : "Save Changes"}
        </Btn>
      </form>
    </section>
  );
}
