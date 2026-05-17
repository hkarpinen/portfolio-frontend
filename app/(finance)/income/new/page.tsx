import Link from "next/link";
import { AddIncomeForm } from "../add-income-form";

export default function AddIncomeSourcePage() {
  return (
    <div className="page-enter flex flex-col gap-12 max-w-[640px]" >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-4">
        <Link href="/income" className="text-base text-ink-3 no-underline">
          Income
        </Link>
        <span className="text-ink-3 text-base">/</span>
        <span className="text-base text-ink-2">Add source</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink m-0">
          Add Income Source
        </h1>
        <p className="text-ink-3 mt-2 text-base">
          Add a salary, freelance contract, or any other income stream.
        </p>
      </div>

      <AddIncomeForm />
    </div>
  );
}
