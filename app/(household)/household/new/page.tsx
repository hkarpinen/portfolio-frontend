"use client";

import { Alert, Btn, Icon, Input, SectionHeader, SelectField, Textarea } from "@/components/editorial";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useCreateHousehold } from "@/hooks/use-household";
import { getErrorMessage } from "@/lib/error-messages";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  currencyCode: z.string().min(1),
  timezone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];

// Curated timezone list. Intl.supportedValuesOf('timeZone') is available in Node 18+
// and modern browsers but is not universally supported in all Next.js edge environments,
// so we use a static curated set here. Expand as needed.
const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "America/Honolulu",
  "America/Toronto",
  "America/Vancouver",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Rome",
  "Europe/Madrid",
  "Europe/Amsterdam",
  "Europe/Stockholm",
  "Europe/Helsinki",
  "Europe/Warsaw",
  "Europe/Istanbul",
  "Europe/Athens",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
];

export default function NewHouseholdPage() {
  const router = useRouter();
  const createHousehold = useCreateHousehold();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currencyCode: "USD", timezone: "America/New_York" },
  });

  const onSubmit = (data: FormData) => {
    // TODO(handoff8): pass timezone to createHousehold when the API accepts it
    createHousehold.mutate(
      { name: data.name, description: data.description, currencyCode: data.currencyCode },
      {
        onSuccess: (created) => {
          router.push(`/household/${created.id}`);
          router.refresh();
        },
      },
    );
  };

  return (
    <div className="page-enter flex max-w-[640px] flex-col gap-8">
      <Link href="/household" className="ed-label-muted no-underline hover:text-red">
        ← All households
      </Link>

      <SectionHeader
        kicker="Household · New"
        title="New <em>household</em>"
        subtitle="Bills, chores, and calendar live inside a household. You can be in many."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {createHousehold.isError && (
          <Alert variant="danger">
            {getErrorMessage(createHousehold.error)}
          </Alert>
        )}

        <Input
          label="Name"
          type="text"
          placeholder="e.g. Cedar Place"
          error={errors.name?.message}
          {...register("name")}
        />

        <Textarea
          label="Description"
          placeholder="What's this household for?"
          rows={4}
          {...register("description")}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <SelectField label="Currency" {...register("currencyCode")}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>
          <SelectField label="Timezone" {...register("timezone")}>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="flex gap-3">
          <Btn
            type="submit"
            disabled={isSubmitting || createHousehold.isPending}
            variant="primary"
            size="lg"
            iconRight={<Icon name="arrowRight" size={16} />}
          >
            {createHousehold.isPending ? "Creating…" : "Create household"}
          </Btn>
          <Btn type="button" variant="secondary" size="lg" onClick={() => router.back()}>
            Cancel
          </Btn>
        </div>
      </form>
    </div>
  );
}
