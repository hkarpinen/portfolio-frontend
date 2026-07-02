import { Btn, EmptyState, Icon } from "@/components/editorial";
import Link from "next/link";
import { getCookieHeader } from "@/lib/server-cookies";
import { JoinHouseholdButton } from "./join-button";
import { listHouseholdsServer } from "@/lib/api/households";
import type { HouseholdSummaryDto } from "@/lib/api/households";
import { fetchAllBalancesServer } from "@/lib/api/household-expenses";

import { HouseholdBalanceBadge } from "@/components/finance/household-balance-badge";
import { householdsHeadline, householdsDeck } from "@/lib/household/editorial-copy";
import { formatShortDate } from "@/lib/formatting";
import { pluralize } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ORIENT = [
  { title: "About the project", desc: "What this is and why", href: "/about" },
  { title: "Try the forum", desc: "Threaded discussions", href: "/forum" },
  { title: "Round out your profile", desc: "Avatar, bio, prefs", href: "/identity/settings/profile" },
];

export default async function HouseholdsPage() {
  const cookieHeader = await getCookieHeader();
  const households: HouseholdSummaryDto[] = (await listHouseholdsServer(cookieHeader)) ?? [];
  const count = households.length;
  // Audit §3.4: prefetch every household's balance in one parallel sweep
  // server-side, hand each badge its own initialData, and the page no
  // longer fires N client fetches on mount.
  const balancesById =
    count > 0
      ? await fetchAllBalancesServer(
          households.map((h) => h.id),
          cookieHeader,
        )
      : {};

  const totalMembers = households.reduce((sum, h) => sum + (h.memberCount ?? 1), 0);
  const currencyCount = new Set(households.map((h) => h.currencyCode)).size;

  return (
    <div className="page-enter">
      {/* .page-head — kicker + headline + Join/New actions (Terminus household list) */}
      <header className="page-head">
        <div className="titles">
          <div className="kicker" style={{ marginBottom: 8 }}>
            // WORKSPACE · LEDGER
          </div>
          {/* headline may carry inline <em>; page-code only, never user input */}
          <h1 dangerouslySetInnerHTML={{ __html: householdsHeadline({ count }) }} />
          {count > 0 && <p className="deck">{householdsDeck({ count })}</p>}
        </div>
        {count > 0 && (
          <div className="actions">
            <JoinHouseholdButton size="sm" />
            <Btn
              href="/household/new"
              variant="primary"
              size="sm"
              iconLeft={<Icon name="plus" size={12} strokeWidth={2.5} />}
            >
              New
            </Btn>
          </div>
        )}
      </header>

      {count === 0 ? (
        <div className="flex flex-col gap-8">
          <EmptyState
            glyph={<Icon name="household" size={24} strokeWidth={1.5} />}
            kicker="// HOUSEHOLDS_EMPTY"
            title="No households on file <em>yet</em>"
            body="Households are where shared bills, calendars, and chores live. Spin one up, or join an existing one with an invite code."
            cta={{ label: "$ new-household →", href: "/household/new" }}
          />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <JoinHouseholdButton size="lg" />
          </div>

          <section className="flex flex-col gap-5">
            <p className="ed-kicker">// GET_ORIENTED</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {ORIENT.map((o) => (
                <Link
                  key={o.href}
                  href={o.href}
                  className="ed-card ed-card-muted flex flex-col gap-2 no-underline"
                >
                  <h3 className="ed-h4">{o.title}</h3>
                  <p className="ed-hint">{o.desc}</p>
                  <span className="ed-about-card-link">
                    Open <Icon name="arrowRight" size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <>
          {/* .stats — 4-up strip. Prototype's open-splits/last-settled/active-chores
              figures aren't available at the list level (they're per-household), so
              this wires the real cross-household figures the loader does have. */}
          <div className="stats">
            <div className="stat">
              <div className="label">Total households</div>
              <div className="val">{count}</div>
              <div className="delta">{pluralize("workspace", count)}</div>
            </div>
            <div className="stat">
              <div className="label">Members</div>
              <div className="val">{totalMembers}</div>
              <div className="delta">across all</div>
            </div>
            <div className="stat">
              <div className="label">Currencies</div>
              <div className="val">{currencyCount}</div>
              <div className="delta">in use</div>
            </div>
            <div className="stat">
              <div className="label">Your role</div>
              <div className="val">{households[0]?.role ?? "Member"}</div>
              <div className="delta">primary</div>
            </div>
          </div>

          {/* .table-wrap > .table — clickable rows to detail, .row-title titles,
              balance via real <HouseholdBalanceBadge>, .right.muted "when" column. */}
          <div className="table-wrap" style={{ marginTop: 18 }}>
            <table className="table" aria-label="Your households">
              <thead>
                <tr>
                  <th>Household</th>
                  <th>Members</th>
                  <th>Balance</th>
                  <th>Currency</th>
                  <th className="right">Joined</th>
                </tr>
              </thead>
              <tbody>
                {households.map((h) => {
                  const memberCount = h.memberCount ?? 1;
                  const memberLabel = `${memberCount} ${pluralize("member", memberCount)}`;
                  return (
                    <tr key={h.id}>
                      <td>
                        <Link
                          href={`/household/${h.id}`}
                          className="row-title no-underline"
                          aria-label={`Open ${h.name} — ${memberLabel}, ${h.currencyCode}`}
                        >
                          {h.name}
                        </Link>
                        {h.description && (
                          <p className="ed-hint mt-0.5 max-w-[40ch] truncate">{h.description}</p>
                        )}
                      </td>
                      <td className="muted">{memberLabel}</td>
                      <td>
                        <HouseholdBalanceBadge
                          householdId={h.id}
                          variant="card"
                          initialData={balancesById[h.id] ?? null}
                        />
                      </td>
                      <td className="muted">{h.currencyCode}</td>
                      <td className="right muted">{formatShortDate(h.joinedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
