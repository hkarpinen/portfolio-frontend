import { ArrowLink, SectionHeader } from "@/components/editorial";
import { JoinHouseholdForm } from "./join-household-form";

/**
 * Server component (audit §3.3): only the form needs hooks; the surrounding
 * shell stays off the JS bundle.
 */
export default function JoinHouseholdPage() {
  return (
    <div className="page-enter flex max-w-[560px] flex-col gap-8">
      <ArrowLink href="/household" direction="left" className="ed-label-muted">
        All households
      </ArrowLink>

      <SectionHeader
        kicker="// HOUSEHOLD · JOIN"
        title="Join with an <em>invite code</em>"
        subtitle="Ask a current member to share the household's invite link."
      />

      <JoinHouseholdForm />
    </div>
  );
}
