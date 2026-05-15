import Link from "next/link";
import { AddExpenseForm } from "../add-expense-form";

export default function AddExpensePage() {
  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "640px" }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Link href="/expenses" style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)", textDecoration: "none" }}>
          Expenses
        </Link>
        <span style={{ color: "var(--text-3)", fontSize: "var(--ts-body-sm)" }}>/</span>
        <span style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-2)" }}>Add expense</span>
      </nav>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "var(--ts-card-h)", letterSpacing: "-0.025em", color: "var(--text)", margin: 0 }}>
          Add Expense
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "var(--ts-body-sm)" }}>
          Add a recurring or one-time personal expense — phone, gym, streaming, insurance.
        </p>
      </div>

      <AddExpenseForm />
    </div>
  );
}
