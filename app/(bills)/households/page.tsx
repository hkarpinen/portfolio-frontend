import Link from "next/link";
import { getCookieHeader } from "@/lib/server-cookies";
import { JoinHouseholdButton } from "./join-button";
import { listHouseholdsServer } from "@/lib/api/households";
import type { HouseholdSummaryDto } from "@/lib/api/households";
import styles from "./households.module.css";

export const dynamic = 'force-dynamic';

export default async function HouseholdsPage() {
  const now = new Date();
  const households: HouseholdSummaryDto[] = await listHouseholdsServer(await getCookieHeader()) ?? [];

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* ── Header row ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "var(--ts-h2)", lineHeight: "var(--lh-display)", letterSpacing: "-0.02em", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
            Households
          </h1>
          <p style={{ color: "var(--text-3)", fontSize: "var(--ts-body-sm)" }}>
            {new Date(now).toLocaleString("default", { month: "long", year: "numeric" })}
            {households.length > 0 && ` · ${households.length} household${households.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <JoinHouseholdButton />
          <Link
            href="/households/new"
            style={{
              background: "var(--accent)", color: "#fff",
              padding: "8px 16px", borderRadius: "12px",
              fontSize: "var(--ts-body-sm)", fontWeight: "600", textDecoration: "none",
            }}
          >
            + New household
          </Link>
        </div>
      </div>

      {/* ── Households grid ────────────────────────────────────────────────── */}
      {households.length === 0 ? (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "48px 24px", textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
        }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "var(--ts-body)", color: "var(--text)" }}>No households yet</p>
          <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)" }}>Create your first household to start tracking shared expenses</p>
          <Link
            href="/households/new"
            style={{
              background: "var(--accent)", color: "#fff",
              padding: "10px 24px", borderRadius: "12px",
              fontWeight: "600", fontSize: "var(--ts-body-sm)", textDecoration: "none", marginTop: "4px",
            }}
          >
            Create a household
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
          {households.map((h, i) => {
            const HOUSEHOLD_COLORS = ["var(--accent)", "var(--accent-v)", "var(--success)", "var(--warning)"];
            const cardColor = HOUSEHOLD_COLORS[i % HOUSEHOLD_COLORS.length];
            return (
              <Link
                key={h.id}
                href={`/households/${h.id}`}
                style={{ textDecoration: "none" }}
              >
                <div className={styles.cardHover} style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "16px", overflow: "hidden",
                  boxShadow: "var(--shadow-sm)", cursor: "pointer",
                  display: "flex", flexDirection: "column",
                }}>
                  {/* Accent bar */}
                  <div style={{ height: "4px", background: cardColor, flexShrink: 0 }} />

                  <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "var(--ts-lead)", color: "var(--text)", margin: 0, lineHeight: 1.2 }}>{h.name}</p>
                        {h.description && (
                          <p style={{ fontSize: "var(--ts-label)", color: "var(--text-3)", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.description}</p>
                        )}
                      </div>
                      <span style={{
                        fontSize: "var(--ts-meta)", fontWeight: "600", color: cardColor,
                        background: "color-mix(in oklch, " + cardColor + " 15%, transparent)",
                        borderRadius: "var(--r-full)", padding: "3px 10px",
                        flexShrink: 0, whiteSpace: "nowrap", textTransform: "capitalize",
                      }}>
                        {h.role}
                      </span>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: "flex", gap: "0", borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
                      {([
                        { label: "Members", value: String(h.memberCount) },
                        { label: "Currency", value: h.currencyCode },
                        { label: "Since", value: new Date(h.createdAt).toLocaleDateString("default", { month: "short", year: "2-digit" }).replace("/", " '") },
                      ] as { label: string; value: string }[]).map((stat, si) => (
                        <div key={stat.label} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "3px",
                          paddingLeft: si > 0 ? "12px" : "0", marginLeft: si > 0 ? "12px" : "0",
                          borderLeft: si > 0 ? "1px solid var(--border)" : "none", overflow: "hidden" }}>
                          <span style={{ fontSize: "clamp(10px, 0.45vw + 8.5px, 12px)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.14em", whiteSpace: "nowrap" }}>{stat.label}</span>
                          <span style={{ fontSize: "clamp(15px, 0.8vw + 12px, 20px)", fontWeight: 800, fontFamily: "var(--ff-display)", color: "var(--text)", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
