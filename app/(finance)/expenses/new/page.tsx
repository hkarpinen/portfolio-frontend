import Link from "next/link";
import { AddExpenseForm } from "../add-expense-form";

export default function AddExpensePage() {
  return (
    <div className="page-enter flex flex-col gap-12 max-w-[640px]">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="ed-breadcrumb">
        <Link href="/expenses" className="ed-breadcrumb-link">
          Expenses
        </Link>
        <span className="ed-breadcrumb-sep" aria-hidden="true">/</span>
        <span className="ed-breadcrumb-current" aria-current="page">Add expense</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink m-0">
          Add Expense
        </h1>
        <p className="text-ink-3 mt-2 text-base">
          Track a recurring or one-time personal expense — phone, gym, streaming, insurance. Recurring expenses appear in your monthly summary automatically.
        </p>
      </div>

      <AddExpenseForm />
    </div>
  );
}
