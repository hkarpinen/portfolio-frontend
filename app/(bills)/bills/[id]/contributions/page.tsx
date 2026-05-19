import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchHouseholdServer,
  fetchHouseholdContributionsServer,
} from "@/lib/api/households";
import { getCookieHeader } from "@/lib/server-cookies";
import { getInitials } from "@/lib/utils";
import type {
  Household,
  HouseholdMonthlyContributions,
  MemberContribution,
  HouseholdContributionItem,
} from "@/types/finance";

export const dynamic = "force-dynamic";

const AVATAR_COLORS = [
  "var(--red)",
  "var(--accent-v)",
  "var(--success)",
  "var(--warning)",
  "var(--danger)",
  "#f59e0b",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}


export default async function HouseholdContributionsPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieHeader = await getCookieHeader();

  const [household, months] = await Promise.all([
    fetchHouseholdServer(params.id, cookieHeader),
    fetchHouseholdContributionsServer(params.id, cookieHeader).then((r) => r ?? []),
  ]);

  if (!household) notFound();

  return (
    <div className="page-enter flex flex-col gap-[28px]" >
      {/* Header */}
      <div>
        <Link href={`/bills/${params.id}`} className="text-ink-3 text-base no-underline">
          ← {household.name}
        </Link>
        <h1 className="font-serif font-extrabold text-4xl leading-none tracking-snug tracking-[-0.025em] text-ink mt-2">
          Contributions
        </h1>
        <p className="text-ink-3 mt-2 text-base">
          Per-member expense splits by month
        </p>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: "1.5px solid var(--ink)" }}>
        {[
          { label: "Expenses", href: `/bills/${params.id}` },
          { label: "Contributions", href: `/bills/${params.id}/contributions` },
          { label: "Income", href: `/bills/${params.id}/income` },
          { label: "Settings", href: `/bills/${params.id}/settings` },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className="py-5 px-8 text-base mb-[-1px] no-underline" style={{ fontWeight: tab.label === "Contributions" ? 600 : 400, color: tab.label === "Contributions" ? "var(--text)" : "var(--text-3)", borderBottom: tab.label === "Contributions" ? "3px solid var(--red)" : "2px solid transparent", transition: "color 110ms" }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Content */}
      {months.length === 0 ? (
        <div className="bg-paper py-24 px-12 text-center flex flex-col items-center gap-6 shadow-stamp border-ink">
          <div className="w-[56px] h-[56px] bg-red-soft flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <p className="font-serif font-bold text-md text-ink">
            No contributions yet
          </p>
          <p className="text-base text-ink-3 max-w-[320px]">
            Add expenses with member splits to see monthly contributions here.
          </p>
          <Link
            href={`/bills/${params.id}/expenses/new`}
            className="bg-red text-white py-4 px-10 text-base font-semibold no-underline"
          >
            Add an Expense
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {months.map((month) => (
            <div
              key={month.periodStart}
              className="bg-paper p-10 shadow-stamp border-ink"
            >
              {/* Month header */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif font-bold text-md text-ink m-0">
                  {month.periodLabel}
                </h3>
                <span className="font-serif font-bold text-md text-ink">
                  {month.currency ?? household.currencyCode} {month.total?.toFixed(2)}
                </span>
              </div>

              {/* Per-member rows */}
              <div className="flex flex-col gap-6">
                {(month.members ?? []).map((member) => {
                  const paidRatio = member.totalDue > 0 ? Math.min(member.totalPaid / member.totalDue, 1) : 1;
                  const color = avatarColor(member.displayName ?? member.userId);
                  return (
                    <div key={member.userId}>
                      <div className="flex items-center gap-5 mb-3">
                        {/* Avatar */}
                        <div className="w-[28px] h-[28px] shrink-0 flex items-center justify-center text-sm font-bold text-white" style={{ background: color, border: "2px solid var(--ink)" }}>
                          {getInitials(member.displayName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-2">
                            <span className="text-base font-semibold text-ink">
                              {member.displayName ?? `User ${member.userId.slice(0, 6)}`}
                            </span>
                            <span className="text-base font-bold text-ink font-serif">
                              {household.currencyCode} {member.totalDue?.toFixed(2)}
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div
                            className="bg-paper-3 rounded-full h-[5px] overflow-hidden"
                            role="progressbar"
                            aria-valuenow={Math.round(paidRatio * 100)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${member.displayName ?? "Member"} payment progress`}
                          >
                            <div className="rounded-full h-[5px]" style={{ background: paidRatio >= 1 ? "var(--success)" : "var(--red)", width: `${paidRatio * 100}%`, transition: "width 500ms ease" }} />
                          </div>
                          <div className="flex justify-between mt-[3px]">
                            <span className="text-sm text-ink-3">
                              {household.currencyCode} {member.totalPaid?.toFixed(2)} paid
                            </span>
                            <span className="text-sm" style={{ color: paidRatio >= 1 ? "var(--success)" : "var(--text-3)" }}>
                              {(paidRatio * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
