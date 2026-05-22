"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useJoinHousehold } from "@/hooks/use-household";
import { ApiError } from "@/lib/api-client";
import { Btn, Alert } from "@/components/editorial";

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
        router.push(`/household/${result.householdId}`);
        router.refresh();
      },
    });
  };

  return (
    <div className="page-enter max-w-[440px] mx-auto flex flex-col gap-10" >
      <div>
        <Link href="/household" className="text-ink-3 text-base no-underline">
          ← Households
        </Link>
        <h1 className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink mt-3">
          Join a Household
        </h1>
        <p className="text-ink-3 text-base mt-2">
          Enter the invite code you received from a household owner or admin.
        </p>
      </div>

      <div className="bg-paper p-12 shadow-stamp border-ink">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          {joinHousehold.isError && (
            <Alert variant="danger">
              {joinHousehold.error instanceof ApiError ? joinHousehold.error.message : "Invalid invitation code. Make sure you typed it correctly."}
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            <label className="text-base font-medium text-ink-2 tracking-[0.02em]">
              Invitation Code
            </label>
            <input
              {...register("invitationCode")}
              placeholder="e.g. ABCdef1234"
              autoComplete="off"
              className="h-[38px] p-[0_12px] bg-paper-2 text-ink text-md font-mono outline-none w-full border-ink"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--ink)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(178,42,26,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--ink-3)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {errors.invitationCode && (
              <p className="text-red text-base">{errors.invitationCode.message}</p>
            )}
          </div>

          <Btn
            type="submit"
            disabled={joinHousehold.isPending}
            variant="primary"
            fullWidth
          >
            {joinHousehold.isPending ? "Joining…" : "Join Household"}
          </Btn>
        </form>
      </div>
    </div>
  );
}
