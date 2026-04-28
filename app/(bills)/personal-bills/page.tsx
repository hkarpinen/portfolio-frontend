import { getCookieHeader } from "@/lib/server-cookies";
import { AddPersonalBillForm } from "./add-personal-bill-form";
import { PersonalBillList } from "./personal-bill-list";
import { fetchPersonalBillsServer } from "@/lib/api/bills";
import type { PersonalBill } from "@/types/api";

export const dynamic = "force-dynamic";

export default async function PersonalBillsPage() {
  const page = await fetchPersonalBillsServer(await getCookieHeader()) ?? { items: [] as PersonalBill[], totalCount: 0 };
  const bills: PersonalBill[] = page.items ?? [];

  // Monthly total — recurring bills counted per their frequency
  const monthlyTotal = bills.reduce((sum, b) => {
    const freq = b.recurrenceFrequency?.toUpperCase();
    if (freq === "WEEKLY") return sum + b.amount * 52 / 12;
    if (freq === "BIWEEKLY") return sum + b.amount * 26 / 12;
    if (freq === "QUARTERLY") return sum + b.amount / 3;
    if (freq === "SEMIANNUALLY") return sum + b.amount / 6;
    if (freq === "ANNUALLY") return sum + b.amount / 12;
    if (freq === "MONTHLY") return sum + b.amount;
    return sum; // one-time bills don't count toward monthly
  }, 0);

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)" }}>
          Personal Bills
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
          Track your individual recurring and one-time expenses
        </p>
      </div>

      {/* Monthly total stat card */}
      {bills.some((b) => b.recurrenceFrequency) && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "0",
          maxWidth: "320px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Monthly Obligations
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 9V7a5 5 0 0 0-10 0v2M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
            ${monthlyTotal.toFixed(2)}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>
            {bills.filter((b) => b.recurrenceFrequency).length} recurring bill{bills.filter((b) => b.recurrenceFrequency).length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Two-column layout on wider screens */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "24px",
      }}
        className="personal-bills-grid"
      >
        <PersonalBillList initialData={page} />
        <AddPersonalBillForm />
      </div>

      <style>{`
        @media (min-width: 768px) {
          .personal-bills-grid {
            grid-template-columns: 1fr 380px !important;
            align-items: start;
          }
        }
      `}</style>
    </div>
  );
}
