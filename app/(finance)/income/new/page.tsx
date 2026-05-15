import Link from "next/link";
import { AddIncomeForm } from "../add-income-form";

export default function AddIncomeSourcePage() {
  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "640px" }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Link href="/income" style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)", textDecoration: "none" }}>
          Income
        </Link>
        <span style={{ color: "var(--text-3)", fontSize: "var(--ts-body-sm)" }}>/</span>
        <span style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-2)" }}>Add source</span>
      </nav>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "var(--ts-card-h)", letterSpacing: "-0.025em", color: "var(--text)", margin: 0 }}>
          Add Income Source
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "var(--ts-body-sm)" }}>
          Add a salary, freelance contract, or any other income stream.
        </p>
      </div>

      <AddIncomeForm />
    </div>
  );
}
