import Link from "next/link";
import { AddExpenseForm } from "../add-expense-form";

export default function AddExpensePage() {
  return (
    <div className="page-enter flex flex-col gap-12 max-w-[640px]" >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-4">
        <Link href="/expenses" className="text-base text-ink-3 no-underline">
          Expenses
        </Link>
        <span className="text-ink-3 text-base">/</span>
        <span className="text-base text-ink-2">Add expense</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink m-0">
          Add Expense
        </h1>
        <p className="text-ink-3 mt-2 text-base">
          Add a recurring or one-time personal expense — phone, gym, streaming, insurance.
        </p>
      </div>

      <AddExpenseForm />
    </div>
  );
}
