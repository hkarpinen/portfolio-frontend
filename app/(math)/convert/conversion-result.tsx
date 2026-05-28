"use client";

import { StatCard } from "@/components/editorial/stat-card";

function formatNumber(n: number): string {
  const s = n.toFixed(10).replace(/\.?0+$/, "");
  const [int, dec] = s.split(".");
  const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${intFmt}.${dec}` : intFmt;
}

interface ConversionResultData {
  category: string;
  inputValue: number;
  outputValue: number;
  from: string;
  to: string;
}

interface ConversionResultProps {
  result: ConversionResultData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
}

export function ConversionResult({
  result,
  isLoading,
  isFetching,
  isError,
}: ConversionResultProps) {
  return (
    <>
      {isLoading && isFetching && (
        <p className="ed-label-muted uppercase" style={{ letterSpacing: "0.2em" }}>
          Computing…
        </p>
      )}
      {isError && (
        <p className="ed-label-muted uppercase text-red" style={{ letterSpacing: "0.2em" }}>
          Incompatible units — both must belong to the same category.
        </p>
      )}

      {result && (
        <div className="border-ink bg-paper shadow-stamp">
          <div className="p-[16px_24px_0]">
            <p className="ed-kicker" style={{ letterSpacing: "0.3em" }}>
              {result.category} · result
            </p>
          </div>

          <div className="border-ink-b flex flex-wrap items-end justify-between gap-6 p-[8px_24px_20px]">
            <div className="flex flex-wrap items-baseline gap-3">
              <span
                className="font-serif italic text-red"
                style={{
                  fontSize: "clamp(3rem, 6vw, 5rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 0.9,
                }}
                /* fontSize is clamp() — responsive runtime value, no Tailwind equivalent */
              >
                {formatNumber(result.outputValue)}
              </span>
              <span
                className="font-serif text-ink-2"
                style={{
                  fontSize: "clamp(1.25rem, 2.5vw, 2rem)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                }}
                /* fontSize is clamp() — responsive runtime value, no Tailwind equivalent */
              >
                {result.to}
              </span>
            </div>
            <p className="text-right font-mono text-xs leading-[1.5] tracking-[0.08em] text-ink-3">
              {formatNumber(result.inputValue)} {result.from}
              <br />
              <span className="text-ink-4">converted to {result.to}</span>
            </p>
          </div>

          <div className="grid grid-cols-4">
            {[
              { label: "Input", value: formatNumber(result.inputValue) },
              { label: "Output", value: formatNumber(result.outputValue), italic: true },
              { label: "From", value: result.from },
              { label: "To", value: result.to, italic: true },
            ].map((s, i, arr) => (
              <div key={s.label} className={i < arr.length - 1 ? "border-ink-r" : ""}>
                <StatCard label={s.label} value={s.value} italic={s.italic} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
