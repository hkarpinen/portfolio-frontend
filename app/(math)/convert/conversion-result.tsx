"use client";

import { StatCard } from "@/components/editorial/stat-card";

function formatNumber(n: number): string {
  const s = n.toFixed(10).replace(/\.?0+$/, "");
  const [int, dec] = s.split(".");
  const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${intFmt}.${dec}` : intFmt;
}

const rule = "1.5px solid var(--ink)";

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

export function ConversionResult({ result, isLoading, isFetching, isError }: ConversionResultProps) {
  return (
    <>
      {isLoading && isFetching && (
        <p className="font-mono uppercase text-ink-3" style={{ fontSize: "0.625rem", letterSpacing: "0.2em" }}>
          Computing…
        </p>
      )}
      {isError && (
        <p className="font-mono uppercase" style={{ fontSize: "0.625rem", letterSpacing: "0.2em", color: "var(--red)" }}>
          Incompatible units — both must belong to the same category.
        </p>
      )}

      {result && (
        <div className="bg-paper shadow-stamp" style={{ border: rule }}>
          <div style={{ padding: "16px 24px 0" }}>
            <p className="font-mono uppercase text-red" style={{ fontSize: "0.525rem", letterSpacing: "0.3em" }}>
              {result.category} · result
            </p>
          </div>

          <div
            className="flex items-end justify-between gap-6 flex-wrap"
            style={{ padding: "8px 24px 20px", borderBottom: rule }}
          >
            <div className="flex items-baseline gap-3 flex-wrap">
              <span
                className="font-serif italic text-red"
                style={{ fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 0.9 }}
              >
                {formatNumber(result.outputValue)}
              </span>
              <span
                className="font-serif text-ink-2"
                style={{ fontSize: "clamp(1.25rem, 2.5vw, 2rem)", letterSpacing: "-0.01em", lineHeight: 1 }}
              >
                {result.to}
              </span>
            </div>
            <p
              className="font-mono text-ink-3"
              style={{ fontSize: "0.75rem", letterSpacing: "0.08em", lineHeight: 1.5, textAlign: "right" }}
            >
              {formatNumber(result.inputValue)} {result.from}
              <br />
              <span style={{ color: "var(--ink-4)" }}>converted to {result.to}</span>
            </p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {[
              { label: "Input",  value: formatNumber(result.inputValue) },
              { label: "Output", value: formatNumber(result.outputValue), italic: true },
              { label: "From",   value: result.from },
              { label: "To",     value: result.to, italic: true },
            ].map((s, i, arr) => (
              <div key={s.label} style={{ borderRight: i < arr.length - 1 ? rule : undefined }}>
                <StatCard label={s.label} value={s.value} italic={s.italic} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
