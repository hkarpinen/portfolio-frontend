import { getCookieHeader } from "@/lib/server-cookies";
import { AddPersonalBillForm } from "./add-personal-bill-form";
import { PersonalBillList } from "./personal-bill-list";
import { fetchPersonalBillsServer } from "@/lib/api/personal-bills";
import { Alert } from "@/components/ui/alert";
import type { PersonalBill } from "@/types/bills";

export const dynamic = "force-dynamic";

export default async function PersonalBillsPage() {
  const page = await fetchPersonalBillsServer(await getCookieHeader()) ?? { items: [] as PersonalBill[], totalCount: 0 };
  const bills: PersonalBill[] = page.items ?? [];

  const now = new Date();

  // Monthly total — recurring bills counted per their frequency
  const monthlyTotal = bills.reduce((sum, b) => {
    const freq = b.recurrenceFrequency?.toUpperCase();
    if (freq === "WEEKLY") return sum + b.amount * 52 / 12;
    if (freq === "BIWEEKLY") return sum + b.amount * 26 / 12;
    if (freq === "QUARTERLY") return sum + b.amount / 3;
    if (freq === "SEMIANNUALLY") return sum + b.amount / 6;
    if (freq === "ANNUALLY") return sum + b.amount / 12;
    if (freq === "MONTHLY") return sum + b.amount;
    return sum;
  }, 0);

  const overdueBills = bills.filter((b) => new Date(b.dueDate) < now);
  const unpaidBills = bills.filter((b) => new Date(b.dueDate) >= now);
  const unpaidTotal = unpaidBills.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", margin: 0 }}>
            Personal Bills
          </h1>
          <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
            Your own subscriptions, insurance, and personal expenses — not shared with anyone
          </p>
        </div>
        <a
          href="#add-bill-form"
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "var(--accent)", color: "#fff",
            padding: "8px 16px", borderRadius: "var(--r-md)",
            fontSize: "13px", fontWeight: "600", textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Add bill
        </a>
      </div>

      {/* Info banner */}
      <Alert variant="info" title="Personal vs household bills">
        Personal bills are things only you pay — phone, gym, streaming, insurance. Rent, utilities, and internet belong in a household where costs are split with housemates.
      </Alert>

      {/* Stats grid — 3 cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px" }}>
        {/* Monthly total */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "16px", boxShadow: "var(--shadow-sm)" }}>
          <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Monthly total</span>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "24px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1, margin: "6px 0 4px" }}>
            ${monthlyTotal.toFixed(2)}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text-3)" }}>all personal bills</p>
        </div>
        {/* Unpaid */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "16px", boxShadow: "var(--shadow-sm)" }}>
          <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Unpaid</span>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "24px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1, margin: "6px 0 4px" }}>
            {unpaidBills.length}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text-3)" }}>${unpaidTotal.toFixed(2)} due</p>
        </div>
        {/* Overdue */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "16px", boxShadow: "var(--shadow-sm)" }}>
          <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Overdue</span>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "24px", letterSpacing: "-0.025em", color: overdueBills.length > 0 ? "var(--danger)" : "var(--text)", lineHeight: 1, margin: "6px 0 4px" }}>
            {overdueBills.length}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text-3)" }}>action needed</p>
        </div>
      </div>

      {/* Bills list */}
      <PersonalBillList initialData={page} />

      {/* Add bill form */}
      <div id="add-bill-form">
        <AddPersonalBillForm />
      </div>
    </div>
  );
}
