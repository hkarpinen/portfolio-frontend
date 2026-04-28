"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateHousehold } from "@/hooks/use-household";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewHouseholdPage() {
  const router = useRouter();
  const createHousehold = useCreateHousehold();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    createHousehold.mutate(data, {
      onSuccess: (created) => {
        router.push(`/households/${created.householdId}`);
      },
    });
  };

  return (
    <div className="page-enter" style={{ maxWidth: "560px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)" }}>
          Create Household
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "6px", fontSize: "13px" }}>
          Start managing a new household
        </p>
      </div>

      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "var(--shadow-sm)",
      }}>
        {/* Info alert */}
        <div style={{ display: "flex", gap: "12px", background: "var(--accent-subtle)", border: "1px solid var(--accent-border)", borderRadius: "var(--r-md)", padding: "12px 14px", marginBottom: "20px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p style={{ fontSize: "13px", color: "var(--accent)", lineHeight: "1.5", margin: 0 }}>You can invite members after creating the household using a shareable invite code.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {createHousehold.isError && (
            <div style={{
              background: "var(--danger-s)",
              border: "1px solid var(--danger)",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "var(--danger)",
            }}>
              {createHousehold.error instanceof ApiError ? createHousehold.error.message : "Something went wrong. Please try again."}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)", letterSpacing: "0.02em" }}>
              Name
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="My Household"
              style={{
                height: "38px",
                padding: "0 12px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                color: "var(--text)",
                fontSize: "14px",
                outline: "none",
                width: "100%",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {errors.name && (
              <p style={{ color: "var(--danger)", fontSize: "12px" }}>{errors.name.message}</p>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)", letterSpacing: "0.02em" }}>
              Description <span style={{ color: "var(--text-3)", fontWeight: "400" }}>(optional)</span>
            </label>
            <textarea
              {...register("description")}
              placeholder="Describe this household"
              rows={3}
              style={{
                padding: "10px 12px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                color: "var(--text)",
                fontSize: "14px",
                outline: "none",
                width: "100%",
                resize: "vertical",
                fontFamily: "var(--ff-body)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createHousehold.isPending}
              variant="primary"
              style={{ flex: 2 }}
            >
              {createHousehold.isPending ? "Creating..." : "Create Household"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
