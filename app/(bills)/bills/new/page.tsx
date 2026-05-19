"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateHousehold } from "@/hooks/use-household";
import { ApiError } from "@/lib/api-client";
import { Btn, Alert, Input, Textarea, Icon } from "@/components/editorial";

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

      <div className="bg-paper p-12 shadow-stamp border-ink">
        {/* Info alert */}
        <div className="flex gap-6 bg-red-soft py-[12px] px-[14px] mb-10" style={{ border: "1px solid var(--accent-border)" }}>
          <span className="shrink-0 mt-[1px]" style={{ color: "var(--ink)" }}><Icon name="info" size={16} strokeWidth={2} /></span>
          <p className="text-base text-red leading-[1.5] m-0">You can invite members after creating the household using a shareable invite code.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          {createHousehold.isError && (
            <Alert variant="danger">
              {createHousehold.error instanceof ApiError ? createHousehold.error.message : "Something went wrong. Please try again."}
            </Alert>
          )}

          <Input
            label="Name"
            type="text"
            {...register("name")}
            placeholder="My Household"
            error={errors.name?.message}
          />

          <Textarea
            label="Description (optional)"
            {...register("description")}
            placeholder="Describe this household"
            rows={3}
          />

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
