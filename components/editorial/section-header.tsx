import React from "react";
import { Icon, type IconName } from "./icon";

interface SectionHeaderProps {
  kicker?: string;
  breadcrumb?: { label: string; href?: string; onClick?: () => void }[];
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  kicker,
  breadcrumb,
  title,
  subtitle,
  action,
}: SectionHeaderProps) {
  return (
    <div
      className="flex flex-col gap-2 mb-[26px] pb-[16px]"
      style={{ borderBottom: "1.5px solid var(--ink)" }}
    >
      {/* Kicker */}
      {kicker && (
        <p
          className="font-mono uppercase text-red"
          style={{ fontSize: "0.6rem", letterSpacing: "0.26em" }}
        >
          {kicker}
        </p>
      )}

      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <div
          className="flex items-center gap-2 font-mono uppercase"
          style={{ fontSize: "0.656rem", letterSpacing: "0.2em" }}
        >
          {breadcrumb.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <span style={{ color: "var(--ink-3)" }}>/</span>
              )}
              {item.href || item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="bg-transparent border-none cursor-pointer p-0"
                  style={{
                    color: i === breadcrumb.length - 1 ? "var(--ink)" : "var(--ink-3)",
                    fontWeight: i === breadcrumb.length - 1 ? 700 : 400,
                    borderBottom: "1px solid transparent",
                    fontFamily: "var(--ff-mono)",
                    fontSize: "0.656rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </button>
              ) : (
                <span
                  style={{
                    color: i === breadcrumb.length - 1 ? "var(--ink)" : "var(--ink-3)",
                    fontWeight: i === breadcrumb.length - 1 ? 700 : 400,
                  }}
                >
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1
            className="font-serif italic font-normal text-ink"
            style={{
              fontSize: "clamp(2.125rem, 4.6vw, 3.375rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="font-body mt-[10px]"
              style={{
                fontSize: "0.938rem",
                color: "var(--ink-2)",
                lineHeight: 1.5,
                maxWidth: 640,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
