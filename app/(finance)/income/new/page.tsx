import Link from "next/link";
import { AddIncomeForm } from "../add-income-form";

export default function AddIncomeSourcePage() {
  return (
    <div className="page-enter flex flex-col gap-12 max-w-[640px]">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="ed-breadcrumb">
        <Link href="/income" className="ed-breadcrumb-link">
          Income
        </Link>
        <span className="ed-breadcrumb-sep" aria-hidden="true">/</span>
        <span className="ed-breadcrumb-current" aria-current="page">Add source</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink m-0">
          Add Income Source
        </h1>
        <p className="text-ink-3 mt-2 text-base">
          Add a salary, freelance contract, or any other income stream. You can attach payroll deductions — health insurance, 401(k), taxes — to model your real take-home pay.
        </p>
      </div>

      <AddIncomeForm />
    </div>
  );
}
