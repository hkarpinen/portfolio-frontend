import Link from "next/link";
import { SectionHead } from "./section-head";

const DISPATCHES = [
  {
    kicker: "Dispatch 01 — Topology",
    h3: <>Five services, <em style={{ color: "var(--red)" }}>five Postgres databases,</em> one Compose file.</>,
    body: "Each service can deploy without touching the others. The cost is repetition. Every service has its own auth middleware to wire up, and I wired up every one of them. The win shows up on the third week, when one team can break their service and the rest stay green.",
    tags: ["ASP.NET Core", "Docker", "Nginx"],
  },
  {
    kicker: "Dispatch 02 — Messaging",
    h3: <>Services <em style={{ color: "var(--red)" }}>publish events.</em> They don&rsquo;t call each other.</>,
    body: "Domain events on RabbitMQ via MassTransit. Bills emits bill.split.created and walks away. Notifications picks it up and pushes an SSE down to whoever's looking. The first version retried forever on bad payloads and ate a weekend. The second has a poison queue.",
    tags: ["RabbitMQ", "MassTransit", "SSE"],
  },
  {
    kicker: "Dispatch 03 — Security",
    h3: <>Auth, <em style={{ color: "var(--red)" }}>written by hand.</em> On purpose.</>,
    body: "JWT with refresh-token rotation, TOTP 2FA, RBAC, mod permissions per community. No Auth0, no Clerk, no IdentityServer. I wanted to know what every header meant. It took longer than buying would have. I learned more than I would have, too.",
    tags: ["JWT", "TOTP 2FA", "RBAC"],
  },
];

export function Dispatches() {
  return (
    <section id="dispatches" style={{ padding: "0 0 0" }}>
      <SectionHead
        numeral="№ 01"
        title={<>Dispatches from the <span style={{ color: "var(--red)" }}>architecture</span></>}
        meta="Continued on this page · Filed by engineering"
      />
      <div style={{
        padding: "32px 0 40px",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        alignItems: "stretch",
        borderBottom: "3px double var(--ink)",
      }} className="dispatches-grid">
        {DISPATCHES.map((d, i) => (
          <div key={i} style={{
            padding: "4px 26px",
            borderRight: i < DISPATCHES.length - 1 ? "1.5px solid var(--ink)" : undefined,
            display: "flex",
            flexDirection: "column",
          }} className="dispatch-cell">
            <p style={{
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--bs-meta)",
              color: "var(--red)",
              textTransform: "uppercase",
              letterSpacing: "0.30em",
              marginBottom: 14,
            }}>{d.kicker}</p>
            <h3 style={{
              fontFamily: "var(--ff-serif)",
              fontWeight: 400,
              fontSize: "var(--bs-dispatch)",
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
              marginBottom: 14,
              color: "var(--ink)",
            }}>{d.h3}</h3>
            <p style={{ fontFamily: "var(--ff-body)", fontSize: "var(--bs-body)", lineHeight: 1.55, color: "var(--ink-2)", flex: 1 }}>{d.body}</p>
            <div style={{
              borderTop: "1px solid var(--ink)",
              marginTop: 18,
              paddingTop: 12,
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--bs-eyebrow)",
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
            }}>
              {d.tags.map(t => (
                <span key={t}><span style={{ color: "var(--red)" }}>▸</span> {t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Modules (Classifieds) ────────────────────────────────────────────────────*/
