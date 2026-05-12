import Link from "next/link";
import { AddExpenseForm } from "../add-expense-form";

export default function AddExpensePage() {
  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "640px" }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Link href="/expenses" style={{ fontSize: "13px", color: "var(--text-3)", textDecoration: "none" }}>
          Expenses
        </Link>
        <span style={{ color: "var(--text-3)", fontSize: "13px" }}>/</span>
        <span style={{ fontSize: "13px", color: "var(--text-2)" }}>Add expense</span>
      </nav>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", margin: 0 }}>
          Add Expense
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
          Add a recurring or one-time personal expense — phone, gym, streaming, insurance.
        </p>
      </div>

      <AddExpenseForm />
    </div>
  );
}
