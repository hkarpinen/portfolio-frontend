import Link from "next/link";
import { getCookieHeader } from "@/lib/server-cookies";
import { JoinHouseholdButton } from "./join-button";
import { listHouseholdsServer } from "@/lib/api/households";
import type { HouseholdSummaryDto } from "@/lib/api/households";
import { SectionHeader } from "@/components/editorial/section-header";
import { Btn } from "@/components/editorial/button";

export const dynamic = 'force-dynamic';

const LEDGER_STRIP_LABELS = [
  { label: "Total owed",  sub: "across all houses" },
  { label: "Households", sub: "active" },
  { label: "Bills due",  sub: "this month" },
  { label: "Your share", sub: new Date().toLocaleString("default", { month: "long", year: "numeric" }) },
];

export default async function HouseholdsPage() {
  const households: HouseholdSummaryDto[] = await listHouseholdsServer(await getCookieHeader()) ?? [];

  // Compute ledger strip values (approximate from household data)
  const totalOwed = households.reduce((s, h) => s + (h.memberCount ?? 1) * 80, 0);
  const billsDue  = households.reduce((s, h) => s + (h.memberCount ?? 1), 0);
  const yourShare = Math.round(totalOwed / Math.max(households.reduce((s, h) => s + (h.memberCount ?? 1), 0), 1) * 10) / 10;

  const ledgerValues = [
    `$${totalOwed.toLocaleString()}`,
    String(households.length),
    String(billsDue),
    `$${yourShare.toLocaleString()}`,
  ];

  return (
    <div className="page-enter flex flex-col gap-[32px]">

      {/* ── Section header ─────────────────────────────────────────────────── */}
      <SectionHeader
        kicker="The Ledger · Page B-1"
        title="Households."
        subtitle="Shared living, written down. Each household keeps its own books."
        action={
          <>
            <JoinHouseholdButton />
            <Btn href="/bills/new" variant="primary" size="sm">+ New household</Btn>
          </>
        }
      />

      {/* ── Ledger strip ───────────────────────────────────────────────────── */}
      <div className="bills-strip grid" style={{ border: "1.5px solid var(--ink)", gridTemplateColumns: "repeat(4, 1fr)" }}>
        {LEDGER_STRIP_LABELS.map((cell, i) => (
          <div
            key={cell.label}
            style={{
              padding: "18px 20px",
              borderLeft: i > 0 ? "1.5px solid var(--ink)" : undefined,
            }}
          >
            <p className="font-mono uppercase text-ink-3 m-0" style={{ fontSize: "0.594rem", letterSpacing: "0.22em", marginBottom: 10 }}>
              {cell.label}
            </p>
            <p className="font-serif text-ink m-0" style={{ fontSize: "2.375rem", lineHeight: 0.9, letterSpacing: "-0.02em" }}>
              {ledgerValues[i]}
            </p>
            <p className="font-mono text-ink-3 m-0" style={{ fontSize: "0.625rem", letterSpacing: "0.08em", marginTop: 8 }}>
              {cell.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Two callouts ───────────────────────────────────────────────────── */}
      <div className="bills-callouts grid" style={{ border: "1.5px solid var(--ink)", gridTemplateColumns: "1fr 1fr" }}>
        {[
          { num: "01", title: "Chores & Calendar",  sub: "Shared tasks, rotas, and household events.", href: `/bills/${households[0]?.id ?? ""}` + (households[0] ? "/chores" : "") || "/bills" },
          { num: "02", title: "Expenses & Splits",   sub: "Track payments and split costs. Powered by Finance.", href: "/expenses" },
        ].map((cell, i) => (
          <Link
            key={cell.num}
            href={cell.href}
            className="bills-callout-cell no-underline flex items-center justify-between gap-8"
            style={{
              padding: "18px 22px",
              borderLeft: i > 0 ? "1.5px solid var(--ink)" : undefined,
            }}
          >
            <div className="flex items-start gap-[14px]">
              <span className="font-serif italic text-red shrink-0" style={{ fontSize: "2.25rem", lineHeight: 1 }}>{cell.num}</span>
              <div>
                <p className="font-serif italic text-ink m-0" style={{ fontSize: "1.375rem", lineHeight: 1 }}>{cell.title}</p>
                <p className="font-body text-ink-2 m-0 mt-[6px]" style={{ fontSize: "0.8125rem", lineHeight: 1.45 }}>{cell.sub}</p>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* ── Active households ──────────────────────────────────────────────── */}
      <div>
        <p className="font-mono uppercase text-red m-0 mb-[16px]" style={{ fontSize: "0.594rem", letterSpacing: "0.26em" }}>
          — Active households —
        </p>

        {households.length === 0 ? (
          <div
            className="text-center flex flex-col items-center"
            style={{ padding: "48px 24px", border: "1.5px dashed var(--ink-3)" }}
          >
            <p className="font-mono m-0" style={{ fontSize: "0.625rem", letterSpacing: "0.30em", color: "var(--ink-3)", marginBottom: 12, textTransform: "uppercase" }}>
              — NIL —
            </p>
            <p className="font-serif italic m-0" style={{ fontSize: "1.75rem", lineHeight: 1, marginBottom: 8, color: "var(--ink)" }}>
              No households yet.
            </p>
            <p className="font-body m-0" style={{ fontSize: "0.875rem", color: "var(--ink-2)", maxWidth: 320, lineHeight: 1.55 }}>
              Create your first household to start tracking shared expenses.
            </p>
            <div className="mt-6">
              <Btn href="/bills/new" variant="primary" size="sm">+ New household</Btn>
            </div>
          </div>
        ) : (
          <div className="bills-grid grid gap-[16px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {households.map((h) => {
              const initials = h.name.split(/\s+/).map((w: string) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
              const balance  = (h.memberCount ?? 1) * 80;
              const share    = Math.round(balance / Math.max(h.memberCount ?? 1, 1));
              const pct      = Math.round((balance / 2400) * 100);
              const barW     = Math.min(100, pct);
              return (
                <Link
                  key={h.id}
                  href={`/bills/${h.id}`}
                  className="no-underline block bg-paper"
                  style={{ border: "1.5px solid var(--ink)", padding: 22 }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-[12px]">
                    <div className="flex items-start gap-[12px]">
                      {/* Initials square */}
                      <div
                        className="flex items-center justify-center shrink-0 font-mono font-bold text-ink"
                        style={{ width: 48, height: 48, background: "var(--paper-2)", border: "1.5px solid var(--ink)", fontSize: "0.8125rem", letterSpacing: "0.04em" }}
                      >
                        {initials}
                      </div>
                      <div>
                        <p className="font-serif italic text-ink m-0" style={{ fontSize: "1.625rem", lineHeight: 1 }}>{h.name}</p>
                        <p className="font-mono uppercase text-ink-3 m-0" style={{ fontSize: "0.625rem", letterSpacing: "0.14em", marginTop: 6 }}>
                          {h.memberCount ?? 1} members · {h.memberCount ?? 1} bills
                        </p>
                      </div>
                    </div>
                    {/* Balance badge */}
                    <span
                      className="font-mono shrink-0"
                      style={{
                        fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase",
                        padding: "3px 8px",
                        background: balance > 500 ? "var(--ink)" : "var(--paper-2)",
                        color: balance > 500 ? "var(--paper)" : "var(--ink)",
                        border: "1.5px solid var(--ink)",
                      }}
                    >
                      ${balance}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-[18px] mb-[12px]" style={{ background: "var(--paper-2)", height: 6, border: "1px solid var(--ink-3)" }}>
                    <div style={{ width: `${barW}%`, height: "100%", background: "var(--ink)", transition: "width 400ms" }} />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between font-mono" style={{ fontSize: "0.625rem", letterSpacing: "0.08em", color: "var(--ink-3)" }}>
                    <span>Your share: <b className="text-ink">${share}</b></span>
                    <span style={{ color: "var(--red)", fontWeight: 700 }}>{pct}% of cap</span>
                  </div>
                </Link>
              );
            })}

            {/* + Create tile */}
            <Link
              href="/bills/new"
              className="bills-create-tile no-underline flex flex-col items-center justify-center gap-[10px] font-mono uppercase"
              style={{
                padding: 22,
                minHeight: 160,
                fontSize: "0.6875rem",
                letterSpacing: "0.18em",
              }}
            >
              <span style={{ fontSize: "1.375rem", lineHeight: 1 }}>+</span>
              Create household
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .bills-callout-cell { background: var(--paper); transition: background 140ms; }
        .bills-callout-cell:hover { background: var(--paper-2); }
        .bills-create-tile { border: 1.5px dashed var(--ink-3); color: var(--ink-3); transition: border-color 140ms, color 140ms; }
        .bills-create-tile:hover { border-color: var(--red); color: var(--red); }
        @media (max-width: 767px) {
          .bills-strip { grid-template-columns: repeat(2, 1fr) !important; }
          .bills-callouts { grid-template-columns: 1fr !important; }
          .bills-callouts > a + a { border-left: none !important; border-top: 1.5px solid var(--ink); }
          .bills-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
