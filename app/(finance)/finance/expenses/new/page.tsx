import Link from "next/link";
import { AddExpenseForm } from "../add-expense-form";

export default function AddExpensePage() {
  return (
    <div className="page-enter flex max-w-[640px] flex-col gap-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="ed-breadcrumb">
        <Link href="/finance/overview" className="ed-breadcrumb-link">
          Money
        </Link>
        <span className="ed-breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <span className="ed-breadcrumb-current" aria-current="page">
          Add expense
        </span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="m-0 font-serif text-2xl font-extrabold tracking-[-0.025em] text-ink">
          Add Expense
        </h1>
        <p className="mt-2 text-base text-ink-3">
          Track a recurring or one-time personal expense — phone, gym, streaming, insurance.
          Recurring expenses appear in your monthly summary automatically.
        </p>
      </div>

      <AddExpenseForm />
    </div>
  );
}
