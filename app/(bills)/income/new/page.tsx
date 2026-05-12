import Link from "next/link";
import { AddIncomeForm } from "../add-income-form";

export default function AddIncomeSourcePage() {
  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "640px" }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Link href="/income" style={{ fontSize: "13px", color: "var(--text-3)", textDecoration: "none" }}>
          Income
        </Link>
        <span style={{ color: "var(--text-3)", fontSize: "13px" }}>/</span>
        <span style={{ fontSize: "13px", color: "var(--text-2)" }}>Add source</span>
      </nav>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", margin: 0 }}>
          Add Income Source
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
          Add a salary, freelance contract, or any other income stream.
        </p>
      </div>

      <AddIncomeForm />
    </div>
  );
}
