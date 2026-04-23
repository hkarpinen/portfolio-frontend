import { cookies } from "next/headers";
import { AddIncomeForm } from "./add-income-form";
import { SERVER_API } from "@/lib/api-url";

export const dynamic = 'force-dynamic';

interface IncomeSource {
  incomeId: string;
  source: string;
  amount: number;
  frequency: string;
  currency?: string;
}

async function getData(cookieHeader: string) {
  const incomeRes = await fetch(`${SERVER_API}/api/bills/income`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  const sources: IncomeSource[] = incomeRes.ok
    ? ((await incomeRes.json()).items ?? [])
    : [];
  return { sources };
}

export default async function IncomePage() {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const { sources } = await getData(cookieHeader).catch(() => ({ sources: [] }));

  const monthlyTotal = sources.reduce((sum, s) => {
    const freq = s.frequency?.toUpperCase();
    if (freq === "WEEKLY") return sum + s.amount * 52 / 12;
    if (freq === "BIWEEKLY") return sum + s.amount * 26 / 12;
    if (freq === "ANNUALLY") return sum + s.amount / 12;
    return sum + s.amount;
  }, 0);

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)" }}>
          Income
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
          Manage your personal income sources
        </p>
      </div>

      {/* Monthly total stat card */}
      {sources.length > 0 && (
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
              Total Monthly Income
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
            ${monthlyTotal.toFixed(2)}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>
            {sources.length} active source{sources.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Income sources list */}
      <div>
        <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
          Income Sources
        </p>
        {sources.length === 0 ? (
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "48px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px",
            boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
            <p style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "15px", color: "var(--text)" }}>
              No income sources yet
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Add one below to start tracking coverage.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
            {sources.map((source) => (
              <div
                key={source.incomeId}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div>
                  <p style={{ fontWeight: "600", fontSize: "14px", color: "var(--text)" }}>{source.source}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px", textTransform: "capitalize" }}>
                    {source.frequency?.toLowerCase() ?? "monthly"}{source.currency ? ` · ${source.currency}` : ""}
                  </p>
                </div>
                <span style={{
                  fontFamily: "var(--ff-display)",
                  fontWeight: "700",
                  fontSize: "16px",
                  color: "var(--text)",
                }}>
                  {source.currency ?? "USD"} {source.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddIncomeForm />
    </div>
  );
}
