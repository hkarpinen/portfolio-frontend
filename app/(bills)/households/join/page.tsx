"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useJoinHousehold } from "@/hooks/use-bills";
import { ApiError } from "@/lib/api-client";

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
      },
    });
  };

  return (
    <div className="page-enter" style={{ maxWidth: "440px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <Link href="/households" style={{ color: "var(--text-3)", fontSize: "12px", textDecoration: "none" }}>
          ← Households
        </Link>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", marginTop: "6px" }}>
          Join a Household
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: "13px", marginTop: "4px" }}>
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
              fontSize: "13px",
              color: "var(--danger)",
            }}>
              {joinHousehold.error instanceof ApiError ? joinHousehold.error.message : "Invalid invitation code. Make sure you typed it correctly."}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)", letterSpacing: "0.02em" }}>
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
                fontSize: "14px",
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
              <p style={{ color: "var(--danger)", fontSize: "12px" }}>{errors.invitationCode.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={joinHousehold.isPending}
            style={{
              background: "var(--accent)",
              color: "#fff",
              height: "40px",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "14px",
              border: "none",
              cursor: joinHousehold.isPending ? "not-allowed" : "pointer",
              opacity: joinHousehold.isPending ? 0.6 : 1,
              width: "100%",
              fontFamily: "var(--ff-body)",
            }}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            onMouseEnter={(e) => { if (!joinHousehold.isPending) (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-hi)"; }}
          >
            {joinHousehold.isPending ? "Joining…" : "Join Household"}
          </button>
        </form>
      </div>
    </div>
  );
}
