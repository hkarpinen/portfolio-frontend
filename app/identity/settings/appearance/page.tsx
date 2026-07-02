"use client";

import { cardClassName } from "../settings-ui";

const THEME_OPTIONS = [
  { id: "editorial", label: "Editorial", description: "Cream paper, dark ink. The default." },
  { id: "dark", label: "Dark", description: "Coming soon." },
  { id: "high-contrast", label: "High contrast", description: "Coming soon." },
];

const DENSITY_OPTIONS = [
  { id: "comfortable", label: "Comfortable", description: "More breathing room." },
  { id: "compact", label: "Compact", description: "Denser tables and lists." },
];

export default function AppearancePage() {
  return (
    <div className="page-enter flex flex-col gap-8">
      {/* Theme */}
      <section aria-labelledby="appearance-theme-heading">
        <div className={`border-ink ${cardClassName}`}>
          <h2 id="appearance-theme-heading" className="ed-label-muted mb-1">
            Theme
          </h2>
          <p className="mb-6 text-base text-ink-3">
            Choose how the app looks to you.
          </p>
          <fieldset className="m-0 flex flex-col gap-3 border-none p-0">
            <legend className="sr-only">Theme</legend>
            {THEME_OPTIONS.map((opt) => {
              const isActive = opt.id === "editorial";
              const isDisabled = opt.id !== "editorial";
              return (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-5 border-ink p-[14px_18px] transition-colors ${
                    isActive
                      ? "bg-ink text-paper"
                      : isDisabled
                        ? "cursor-not-allowed bg-paper-2 opacity-50"
                        : "bg-paper-2 hover:bg-paper-3"
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={opt.id}
                    defaultChecked={isActive}
                    disabled={isDisabled}
                    className="h-4 w-4 shrink-0 accent-[var(--red)]"
                    aria-describedby={`theme-desc-${opt.id}`}
                  />
                  <span className="flex min-w-0 flex-col gap-1">
                    <span
                      className={`text-base font-semibold ${isActive ? "text-paper" : "text-ink"}`}
                    >
                      {opt.label}
                    </span>
                    <span
                      id={`theme-desc-${opt.id}`}
                      className={`text-sm ${isActive ? "text-paper opacity-75" : "text-ink-3"}`}
                    >
                      {opt.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>
        </div>
      </section>

      {/* Density */}
      <section aria-labelledby="appearance-density-heading">
        <div className={`border-ink ${cardClassName}`}>
          <h2 id="appearance-density-heading" className="ed-label-muted mb-1">
            Density
          </h2>
          <p className="mb-6 text-base text-ink-3">
            Control how much information is visible at once.
          </p>
          <fieldset className="m-0 flex flex-col gap-3 border-none p-0">
            <legend className="sr-only">Density</legend>
            {DENSITY_OPTIONS.map((opt) => {
              const isActive = opt.id === "comfortable";
              return (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-5 border-ink p-[14px_18px] transition-colors ${
                    isActive ? "bg-ink text-paper" : "bg-paper-2 hover:bg-paper-3"
                  }`}
                >
                  <input
                    type="radio"
                    name="density"
                    value={opt.id}
                    defaultChecked={isActive}
                    className="h-4 w-4 shrink-0 accent-[var(--red)]"
                    aria-describedby={`density-desc-${opt.id}`}
                  />
                  <span className="flex min-w-0 flex-col gap-1">
                    <span
                      className={`text-base font-semibold ${isActive ? "text-paper" : "text-ink"}`}
                    >
                      {opt.label}
                    </span>
                    <span
                      id={`density-desc-${opt.id}`}
                      className={`text-sm ${isActive ? "text-paper opacity-75" : "text-ink-3"}`}
                    >
                      {opt.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>
        </div>
      </section>

      {/* Coming-soon note */}
      <p className="ed-meta text-ink-3">
        Additional appearance options — typeface size, reduced motion — are on the roadmap.
      </p>
    </div>
  );
}
