import type React from "react";

const STACK_ITEMS = [
  { name: ".NET 8",       role: "Service runtime" },
  { name: "ASP.NET Core", role: "HTTP & APIs" },
  { name: "EF Core",      role: "ORM" },
  { name: "PostgreSQL",   role: "Source of truth" },
  { name: "RabbitMQ",     role: "Event bus" },
  { name: "MassTransit",  role: "Messaging layer" },
  { name: "Next.js 14",   role: "Frontend app" },
  { name: "TypeScript",   role: "Strict mode" },
  { name: "React Query",  role: "Server state" },
  { name: "Tailwind CSS", role: "Styling" },
  { name: "Docker Compose", role: "Orchestration" },
  { name: "Nginx",        role: "Reverse proxy" },
];

export function StackSpecimen() {
  return (
    <section id="stack" style={{
      padding: "40px 0",
      borderBottom: "1.5px solid var(--ink)",
      display: "grid",
      gridTemplateColumns: "1fr 2fr",
      gap: 48,
      alignItems: "start",
    }} className="stack-grid">
      {/* Left */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20 }}>
          <span style={{ fontFamily: "var(--ff-serif)", fontStyle: "italic", fontSize: "2.4rem", color: "var(--red)", lineHeight: 1 }}>№ 03</span>
          <h2 style={{
            fontFamily: "var(--ff-serif)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "var(--bs-sec-h)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
          }}>The <span style={{ color: "var(--red)" }}>stack,</span> set in type.</h2>
        </div>
        <p style={{
          fontFamily: "var(--ff-serif)",
          fontStyle: "italic",
          fontSize: "var(--bs-specimen)",
          lineHeight: 1.02,
          letterSpacing: "-0.02em",
          color: "var(--ink)",
          marginTop: 24,
        }}>
          Twelve tools. <span style={{ color: "var(--red)" }}>One app.</span> Each chosen for a reason — none for fashion.
        </p>
      </div>

      {/* Right — type specimen list */}
      <div style={{
        columns: 2,
        columnGap: 40,
        columnRule: "1px solid var(--ink)",
      }} className="stack-columns">
        {STACK_ITEMS.map((item, i) => (
          <div key={i} style={{
            breakInside: "avoid" as const,
            padding: "8px 0",
            borderBottom: "1px solid var(--ink)",
            borderTop: (i === 0 || i === 6) ? "1px solid var(--ink)" : undefined,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 16,
          }}>
            <span style={{ fontFamily: "var(--ff-serif)", fontSize: "var(--bs-lede)", letterSpacing: "-0.01em", color: "var(--ink)" }}>{item.name}</span>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "var(--bs-eyebrow)", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.18em", flexShrink: 0 }}>{item.role}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Wanted (CTA) ─────────────────────────────────────────────────────────────*/
