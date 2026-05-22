import Link from "next/link";
import { Star } from "lucide-react";
import { SectionHead } from "./section-head";

const MODULES = [
  {
    ad: "Ad  № 001",
    title: <>Household <em style={{ color: "var(--red)" }}>&amp; Chores</em></>,
    body: "Shared household management. Members, chores roster, calendar events, contribution tracking. The glue between housemates that isn't a group chat.",
    sub: "4 sub-pages",
    href: "/household",
  },
  {
    ad: "Ad  № 002",
    title: <>Finance <em style={{ color: "var(--red)" }}>&amp; Expenses</em></>,
    body: "Personal finance engine. Log expenses, split costs, track income, connect bank accounts. Budgets that don't require a spreadsheet.",
    sub: "5 sub-pages",
    href: "/expenses",
  },
  {
    ad: "Ad  № 003",
    title: <>Community <em style={{ color: "var(--red)" }}>Forum</em></>,
    body: "Threaded discussions, nested comments, upvotes, communities with mod queues and full mod-log auditing. Reddit, but smaller and angrier.",
    sub: "8 sub-pages",
    href: "/forum",
  },
  {
    ad: "Ad  № 004",
    title: <>Portfolio <em style={{ color: "var(--red)" }}>Pages</em></>,
    body: "The personal corner. Project showcase, skill cards, social links, and a contact form that actually delivers — to a real address, not the void.",
    sub: "3 sub-pages",
    href: "/about",
  },
  {
    ad: "Ad  № 005",
    title: <>Account <em style={{ color: "var(--red)" }}>&amp; Auth</em></>,
    body: "Sign-up, sign-in, password reset, email confirm, 2FA toggle, session list, avatar upload, notification preferences. The boring bits, done.",
    sub: "6 sub-pages",
    href: "/settings/profile",
  },
  {
    ad: "Ad  № 006",
    title: <>Geography <em style={{ color: "var(--red)" }}>&amp; Weather</em></>,
    body: "Live weather conditions via OpenWeatherMap. Search any city, toggle °F/°C, and overlay cloud, precipitation, wind, pressure, and temperature layers on an interactive Leaflet map.",
    sub: "1 sub-page",
    href: "/weather",
  },
  {
    ad: "Ad  № 007",
    title: <>Math <em style={{ color: "var(--red)" }}>&amp; Conversion</em></>,
    body: "Unit conversion across length, weight, temperature, volume, speed, area, and data — all computed by a pure domain engine in the Math microservice. No rounding surprises.",
    sub: "1 sub-page",
    href: "/convert",
  },
];

export function Modules() {
  return (
    <section id="modules" style={{ padding: "32px 0", borderBottom: "1.5px solid var(--ink)" }}>
      <SectionHead
        numeral="№ 02"
        title={<>The <span style={{ color: "var(--red)" }}>modules,</span> in brief.</>}
        meta="Tap to open the live screens"
      />
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        alignItems: "stretch",
        borderTop: "1.5px solid var(--ink)",
        borderLeft: "1.5px solid var(--ink)",
        marginTop: 24,
      }} className="modules-grid">
        {MODULES.map((m, i) => (
          <Link
            key={i}
            href={m.href}
            className="lp-module-card"
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "22px 22px 22px",
              borderRight: "1.5px solid var(--ink)",
              borderBottom: "1.5px solid var(--ink)",
              background: "var(--paper)",
              textDecoration: "none",
            }}
          >
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{
                fontFamily: "var(--ff-mono)",
                fontSize: "var(--bs-eyebrow)",
                color: "var(--ink-3)",
                textTransform: "uppercase",
                letterSpacing: "0.22em",
              }}>{m.ad}</span>
              <span style={{ color: "var(--red)", fontSize: "var(--bs-meta)" }}><Star size={12} fill="currentColor" strokeWidth={0} style={{ color: "var(--red)" }} /></span>
            </div>
            {/* Title */}
            <h4 style={{
              fontFamily: "var(--ff-serif)",
              fontWeight: 400,
              fontSize: "var(--bs-card-h)",
              lineHeight: 1,
              letterSpacing: "-0.015em",
              color: "var(--ink)",
              marginBottom: 12,
            }}>{m.title}</h4>
            {/* Body — grows to fill remaining space */}
            <p style={{
              fontFamily: "var(--ff-body)",
              fontSize: "var(--bs-small-p)",
              color: "var(--ink-2)",
              lineHeight: 1.5,
              flex: 1,
            }}>{m.body}</p>
            {/* Footer — pinned to bottom */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px dashed var(--ink-3)",
              paddingTop: 10,
              marginTop: 14,
              fontFamily: "var(--ff-mono)",
              fontSize: "0.5rem",
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}>
              <span>{m.sub}</span>
              <span style={{ color: "var(--ink)", transition: "color var(--dur-fast)" }}>Open →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── Stack specimen ───────────────────────────────────────────────────────────*/
