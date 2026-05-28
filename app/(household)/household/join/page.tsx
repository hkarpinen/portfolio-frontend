import { SectionHeader } from "@/components/editorial";
import Link from "next/link";
import { JoinHouseholdForm } from "./join-household-form";

/**
 * Server component (audit §3.3): only the form needs hooks; the surrounding
 * shell stays off the JS bundle.
 */
export default function JoinHouseholdPage() {
  return (
    <div className="page-enter flex max-w-[560px] flex-col gap-8">
      <Link href="/household" className="ed-label-muted no-underline hover:text-red">
        ← All households
      </Link>

      <SectionHeader
        kicker="Household · Join"
        title="Join with an <em>invite code</em>"
        subtitle="Ask a current member to share the household's invite link."
      />

      <JoinHouseholdForm />
    </div>
  );
}
