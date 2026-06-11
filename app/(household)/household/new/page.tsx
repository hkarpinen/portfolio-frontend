import { ArrowLink, SectionHeader } from "@/components/editorial";
import { NewHouseholdForm } from "./new-household-form";

/**
 * Server component (audit §3.3): the page shell renders on the server;
 * only the form is hydrated client-side. Previously the entire route was
 * `"use client"` purely because RHF needs hooks — splitting the form out
 * keeps the back link, headline, and copy off the JS bundle.
 */
export default function NewHouseholdPage() {
  return (
    <div className="page-enter flex max-w-[640px] flex-col gap-8">
      <ArrowLink href="/household" direction="left" className="ed-label-muted">
        All households
      </ArrowLink>

      <SectionHeader
        kicker="Household · New"
        title="New <em>household</em>"
        subtitle="Bills, chores, and calendar live inside a household. You can be in many."
      />

      <NewHouseholdForm />
    </div>
  );
}
