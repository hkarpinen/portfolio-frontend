"use client";

import { useState, useRef, useEffect } from "react";
import type { ContributionPeriod } from "@/types/contributions";
import {
  aggregateByYear,
  aggregateByQuarter,
  toMonthlyPeriods,
  sortPeriods,
} from "@/lib/contributions";
import { PeriodCard, GranularityButton } from "./period-card";

type GranularityTab = "monthly" | "quarterly" | "yearly";

export function BudgetView({ months: initialMonths }: { months: ContributionPeriod[] }) {
  const [granularity, setGranularity] = useState<GranularityTab>("monthly");
  const months = initialMonths;
  const currentRef = useRef<HTMLDivElement>(null);

  const rawPeriods =
    granularity === "yearly"
      ? aggregateByYear(months)
      : granularity === "quarterly"
        ? aggregateByQuarter(months)
        : toMonthlyPeriods(months);

  const periods = sortPeriods(rawPeriods);

  useEffect(() => {
    const el = currentRef.current;
    if (!el) return;
    const id = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granularity]);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center gap-3">
        {(["monthly", "quarterly", "yearly"] as GranularityTab[]).map((g) => (
          <GranularityButton
            key={g}
            label={g.charAt(0).toUpperCase() + g.slice(1)}
            active={granularity === g}
            onClick={() => setGranularity(g)}
          />
        ))}
      </div>

      <div key={granularity} className="flex flex-col gap-[14px]">
        {periods.map((p) => (
          <PeriodCard
            key={p.label}
            p={p}
            cardRef={p.isCurrent ? currentRef : undefined}
            granularity={granularity}
          />
        ))}
      </div>
    </div>
  );
}
