"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useJoinHousehold } from "@/hooks/use-household";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

const joinSchema = z.object({
  invitationCode: z.string().min(1, "Invitation code is required").trim(),
});

type JoinForm = z.infer<typeof joinSchema>;

export default function JoinHouseholdPage() {
  const router = useRouter();
  const joinHousehold = useJoinHousehold();
  const { register, handleSubmit, formState: { errors } } = useForm<JoinForm>({
    resolver: zodResolver(joinSchema),
  });

  const onSubmit = (data: JoinForm) => {
    joinHousehold.mutate(data.invitationCode, {
      onSuccess: (result) => {
        router.push(`/households/${result.householdId}`);
        router.refresh();
      },
    });
  };

  return (
    <div className="page-enter" style={{ maxWidth: "440px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <Link href="/households" style={{ color: "var(--text-3)", fontSize: "var(--ts-label)", textDecoration: "none" }}>
          ← Households
        </Link>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "var(--ts-card-h)", letterSpacing: "-0.025em", color: "var(--text)", marginTop: "6px" }}>
          Join a Household
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: "var(--ts-body-sm)", marginTop: "4px" }}>
          Enter the invite code you received from a household owner or admin.
        </p>
      </div>

      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "var(--shadow-sm)",
      }}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {joinHousehold.isError && (
            <div style={{
              background: "var(--danger-s)",
              border: "1px solid var(--danger)",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "var(--ts-body-sm)",
              color: "var(--danger)",
            }}>
              {joinHousehold.error instanceof ApiError ? joinHousehold.error.message : "Invalid invitation code. Make sure you typed it correctly."}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "var(--ts-label)", fontWeight: "500", color: "var(--text-2)", letterSpacing: "0.02em" }}>
              Invitation Code
            </label>
            <input
              {...register("invitationCode")}
              placeholder="e.g. ABCdef1234"
              autoComplete="off"
              style={{
                height: "38px",
                padding: "0 12px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                color: "var(--text)",
                fontSize: "var(--ts-body)",
                fontFamily: "monospace",
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
            {errors.invitationCode && (
              <p style={{ color: "var(--danger)", fontSize: "var(--ts-label)" }}>{errors.invitationCode.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={joinHousehold.isPending}
            variant="primary"
            fullWidth
          >
            {joinHousehold.isPending ? "Joining…" : "Join Household"}
          </Button>
        </form>
      </div>
    </div>
  );
}
