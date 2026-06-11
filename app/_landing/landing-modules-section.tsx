import { Badge, Icon } from "@/components/editorial";
import Link from "next/link";

import { MODULES } from "./landing-config";

/** "What's inside" — grid of module cards, two public + three behind login. */
export function LandingModulesSection() {
  return (
    <section className="ed-landing-section" aria-labelledby="modules-heading">
      <div className="ed-section-row">
        <h2 id="modules-heading" className="ed-h3">
          What&apos;s <em>inside</em>
        </h2>
      </div>
      <p className="ed-section-row-deck">
        Five modules. Two are public — no account required. Three need a login, or just use the
        demo.
      </p>
      <ul className="ed-modules-grid" aria-label="App modules">
        {MODULES.map((m) => (
          <li key={m.num} className="contents">
            <Link href={m.href} className="ed-module-card">
              <span className="ed-module-card-num" aria-hidden="true">
                No. {m.num}
              </span>
              <h3 className="ed-h3">{m.name}</h3>
              <p className="ed-module-card-body">{m.desc}</p>
              {m.tech.length > 0 && (
                <div className="flex flex-wrap gap-1.5" aria-label={`Stack: ${m.tech.join(", ")}`}>
                  {m.tech.map((t) => (
                    <span
                      key={t}
                      className="font-700 border border-ink-3 px-1.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-[0.10em]"
                      style={{ color: "var(--ink-2)" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="ed-module-card-foot">
                <Badge variant={m.public ? "success" : "default"} dot size="md">
                  {m.public ? "Public" : "Account"}
                </Badge>
                <span className="ed-module-card-arrow" aria-hidden="true">
                  {m.cta}{" "}
                  <Icon name="arrowRight" size={12} strokeWidth={2} className="inline align-[-1px]" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
