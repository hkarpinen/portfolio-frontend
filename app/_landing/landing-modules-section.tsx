import { Btn, Icon } from "@/components/editorial";
import Link from "next/link";

import { MODULES } from "./landing-config";

/**
 * MODULES[5] — the prototype's "Five modules" proof-points section.
 *
 * Mirrors the Terminus landing `.public-section` block: a `.head` row
 * (kicker + headline + ghost CTA), a `.sub` deck, then a `.module-grid`
 * of `.module` cards. Each card carries its real stack tags and a
 * public/auth `.badge`.
 */
export function LandingModulesSection() {
  return (
    <section className="public-section" aria-labelledby="modules-heading">
      <div className="head">
        <div>
          <div className="kicker" style={{ marginBottom: 8 }}>
            // EXPLORE
          </div>
          <h2 id="modules-heading">Real, working features — click any of them.</h2>
        </div>
        <Btn href="/about" variant="secondary" iconRight={<Icon name="arrowRight" size={13} strokeWidth={2} />}>
          More about me
        </Btn>
      </div>
      <p className="sub">
        These aren&apos;t screenshots. Every one is a live feature you can use right now. A couple
        are open to everyone; the rest open instantly with the one-click demo — no signup, no email.
      </p>
      <div className="module-grid" role="list">
        {MODULES.map((m) => (
          <Link key={m.num} href={m.href} className="module" role="listitem">
            <span className="num">// MODULE_{m.num}</span>
            <h3>{m.name}</h3>
            <p>{m.desc}</p>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {m.tech.map((t) => (
                <span
                  key={t}
                  style={{
                    font: "500 0.57rem/1.5 var(--ff-mono)",
                    border: "1px solid var(--border)",
                    padding: "1px 5px",
                    color: "var(--text-4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="foot">
              <span className={`badge ${m.public ? "green" : ""}`}>
                <span className="dot" />
                {m.public ? "OPEN" : "LOGIN"}
              </span>
              <span className="arrow">
                {m.public ? "Open" : "Sign in"}{" "}
                <Icon name="arrowRight" size={11} strokeWidth={2} className="inline align-[-1px]" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
