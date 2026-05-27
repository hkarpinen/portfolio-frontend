"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useJoinHousehold } from "@/hooks/use-household";
import { ApiError } from "@/lib/api-client";
import { Btn, Alert, Input, Icon, SectionHeader } from "@/components/editorial";

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
    <div className="page-enter max-w-[560px] flex flex-col gap-8">
      <Link href="/household" className="ed-label-muted no-underline hover:text-red">← All households</Link>

      <SectionHeader
        kicker="Household · Join"
        title="Join with an <em>invite code</em>"
        subtitle="Ask a current member to share the household's invite link."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {joinHousehold.isError && (
          <Alert variant="danger">
            {joinHousehold.error instanceof ApiError ? joinHousehold.error.message : "Invalid invitation code. Make sure you typed it correctly."}
          </Alert>
        )}

        <Input
          label="Invite code"
          placeholder="6-character code, e.g. CEDAR-12"
          autoComplete="off"
          hint="Codes are case-insensitive and expire after 7 days."
          error={errors.invitationCode?.message}
          className="font-mono"
          {...register("invitationCode")}
        />

        <div className="flex gap-3">
          <Btn
            type="submit"
            disabled={joinHousehold.isPending}
            variant="primary"
            size="lg"
            iconRight={<Icon name="arrowRight" size={16} />}
          >
            {joinHousehold.isPending ? "Joining…" : "Join"}
          </Btn>
          <Btn type="button" variant="secondary" size="lg" onClick={() => router.back()}>
            Cancel
          </Btn>
        </div>
      </form>
    </div>
  );
}
