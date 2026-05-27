import Link from "next/link";
import { getCookieHeader } from "@/lib/server-cookies";
import { JoinHouseholdButton } from "./join-button";
import { listHouseholdsServer } from "@/lib/api/households";
import type { HouseholdSummaryDto } from "@/lib/api/households";
import { EditorialPageHead } from "@/components/editorial/editorial-page-head";
import { DepartmentHead } from "@/components/editorial/department-head";
import { EmptyDispatch } from "@/components/editorial/empty-dispatch";
import { Btn } from "@/components/editorial/button";
import { Icon } from "@/components/editorial/icon";
import { HouseholdBalanceBadge } from "@/components/finance/household-balance-badge";
import { householdsHeadline, householdsDeck } from "@/lib/household/editorial-copy";
import s from "./page.module.css";

export const dynamic = 'force-dynamic';

const ORIENT = [
  { title: "About the project", desc: "What this is and why", href: "/about" },
  { title: "Try the forum", desc: "Threaded discussions", href: "/forum" },
  { title: "Round out your profile", desc: "Avatar, bio, prefs", href: "/settings/profile" },
];

export default async function HouseholdsPage() {
  const households: HouseholdSummaryDto[] = await listHouseholdsServer(await getCookieHeader()) ?? [];
  const count = households.length;

  return (
    <div className="page-enter flex flex-col gap-8">
      <EditorialPageHead
        kicker="Ledger desk"
        title={householdsHeadline({ count })}
        deck={householdsDeck({ count })}
      />

      {count === 0 ? (
        <div className="flex flex-col items-center text-center gap-6 py-10 px-6">
          <span className="w-14 h-14 flex items-center justify-center border-[1.5px] border-ink">
            <Icon name="household" size={24} strokeWidth={1.5} />
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Btn href="/household/new" variant="primary" size="lg">+ New household</Btn>
            <JoinHouseholdButton size="lg" />
          </div>

          <div className="w-full max-w-[760px] mt-8 text-left">
            <DepartmentHead
              kicker="Get oriented"
              title="Or <em>poke around</em> first"
              deck="Three small surfaces to read while you decide whether to spin one up."
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              {ORIENT.map(o => (
                <Link key={o.href} href={o.href} className="ed-card ed-card-muted flex flex-col gap-2 no-underline">
                  <h3 className="ed-h4">{o.title}</h3>
                  <p className="ed-hint">{o.desc}</p>
                  <span className="ed-about-card-link">Open <Icon name="arrowRight" size={14} /></span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-end gap-3 -mt-2">
            <Btn href="/household/new" variant="primary" size="sm">+ New household</Btn>
            <JoinHouseholdButton size="sm" />
          </div>

          <section className="flex flex-col gap-5">
            <DepartmentHead
              kicker="On file"
              count={`${count} household${count === 1 ? "" : "s"}`}
              title="Your <em>ledger</em>"
              deck="Each tile opens the household's expenses, contributions, calendar, and chores."
            />
            <div className={`${s.grid} grid gap-4`} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
              {households.map((h) => {
                const memberCount = h.memberCount ?? 1;
                const memberLabel = `${memberCount} member${memberCount !== 1 ? "s" : ""}`;
                return (
                  <Link
                    key={h.id}
                    href={`/household/${h.id}`}
                    className="ed-module"
                    aria-label={`Open ${h.name} — ${memberLabel}, ${h.currencyCode}`}
                  >
                    <span className="ed-module-kicker" aria-hidden>Household</span>
                    <h3 className="ed-module-title">{h.name}</h3>
                    {h.description && (
                      <p className="ed-module-desc">{h.description}</p>
                    )}
                    <p className="ed-module-meta">
                      {memberLabel} · {h.currencyCode}
                    </p>
                    <div className="ed-module-foot">
                      <HouseholdBalanceBadge householdId={h.id} variant="card" />
                      <span className="ed-module-arrow" aria-hidden>Open →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* TODO(handoff8): wire to activity API — fetch /api/households/activity */}
          <section className="flex flex-col gap-5">
            <DepartmentHead
              kicker="Activity"
              title="Recent <em>activity</em>"
              deck="Posts, splits, settlements, and chore completions across your households."
            />
            <EmptyDispatch>No recent activity <em>filed</em> yet</EmptyDispatch>
          </section>
        </>
      )}
    </div>
  );
}
