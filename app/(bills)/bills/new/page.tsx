"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateHousehold } from "@/hooks/use-household";
import { ApiError } from "@/lib/api-client";
import { Btn } from "@/components/editorial";

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
    createHousehold.mutate({ ...data, currencyCode: "USD" }, {
      onSuccess: (created) => {
        router.push(`/bills/${created.id}`);
        router.refresh();
      },
    });
  };

  return (
    <div className="page-enter max-w-[560px] mx-auto flex flex-col gap-12" >
      <div>
        <h1 className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink">
          Create Household
        </h1>
        <p className="text-ink-3 mt-3 text-base">
          Start managing a new household
        </p>
      </div>

      <div className="bg-paper p-12 shadow-stamp" style={{ border: "1.5px solid var(--ink)" }}>
        {/* Info alert */}
        <div className="flex gap-6 bg-[rgba(178,42,26,0.10)] py-[12px] px-[14px] mb-10" style={{ border: "1px solid var(--accent-border)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-[1px]"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p className="text-base text-red leading-[1.5] m-0">You can invite members after creating the household using a shareable invite code.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          {createHousehold.isError && (
            <div className="bg-[rgba(178,42,26,0.10)] py-[10px] px-[14px] text-base text-red" style={{ border: "1px solid var(--danger)" }}>
              {createHousehold.error instanceof ApiError ? createHousehold.error.message : "Something went wrong. Please try again."}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <label className="text-base font-medium text-ink-2 tracking-[0.02em]">
              Name
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="My Household"
              className="h-[38px] p-[0_12px] bg-paper-2 text-ink text-md outline-none w-full" style={{ border: "1.5px solid var(--ink)" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--ink)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(178,42,26,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--ink-3)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {errors.name && (
              <p className="text-red text-base">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-base font-medium text-ink-2 tracking-[0.02em]">
              Description <span className="text-ink-3 font-normal">(optional)</span>
            </label>
            <textarea
              {...register("description")}
              placeholder="Describe this household"
              rows={3}
              className="py-5 px-6 bg-paper-2 text-ink text-md outline-none w-full font-body" style={{ border: "1.5px solid var(--ink)", resize: "vertical" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--ink)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(178,42,26,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--ink-3)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div className="flex gap-5">
            <Btn
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Btn>
            <Btn
              type="submit"
              disabled={isSubmitting || createHousehold.isPending}
              variant="primary"
              style={{ flex: 2 }}
            >
              {createHousehold.isPending ? "Creating..." : "Create Household"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
