"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--text)",
  fontSize: "14px",
  outline: "none",
  width: "100%",
  fontFamily: "var(--ff-body)",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "500" as const,
  color: "var(--text-2)",
  letterSpacing: "0.02em",
};

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--accent)";
  e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
}

function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--border)";
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
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  return (
    <section style={cardStyle}>
      <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Household Details
      </p>
      <form onSubmit={handleSubmit(onSave)} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {saveError && (
          <div style={{ background: "var(--danger-s)", border: "1px solid var(--danger)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--danger)" }}>
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div style={{ background: "var(--success-s)", border: "1px solid var(--success)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--success)" }}>
            Changes saved!
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Name</label>
          <input {...register("name")} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          {errors.name && <p style={{ color: "var(--danger)", fontSize: "12px" }}>{errors.name.message}</p>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Description</label>
          <textarea
            {...register("description")}
            rows={3}
            style={{ padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--text)", fontSize: "14px", outline: "none", width: "100%", resize: "none", fontFamily: "var(--ff-body)" }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {errors.description && <p style={{ color: "var(--danger)", fontSize: "12px" }}>{errors.description.message}</p>}
        </div>
        <div className="form-grid-2">
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>Currency</label>
            <select {...register("currencyCode")} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }} onFocus={handleFocus} onBlur={handleBlur}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.currencyCode && <p style={{ color: "var(--danger)", fontSize: "12px" }}>{errors.currencyCode.message}</p>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>Default Split</label>
            <select {...register("defaultSplitMethod")} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }} onFocus={handleFocus} onBlur={handleBlur}>
              {SPLIT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting} variant="primary">
          {isSubmitting ? "Saving…" : "Save Changes"}
        </Button>
      </form>
    </section>
  );
}
