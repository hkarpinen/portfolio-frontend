import Link from "next/link";
import { Icon } from "@/components/editorial";

/**
 * <ArchitecturePitch> — landing-page section that pitches the system,
 * not just the mechanism.
 *
 * Replaces the older <LifecycleTeaser>, which walked through a generic
 * event-driven flow ("you tap -> bus carries -> services react"). That
 * said nothing specific about this work. This component names the
 * actual patterns — IDesign volatility decomposition, transactional
 * outbox, idempotent consumers, no integration-event layer — so a
 * recruiter can see the substance at a glance and click through to
 * /about/architecture for the full diagrams.
 *
 * Sits between the modules grid and the "About the engineer" bio
 * section on the landing page. The narrative arc is: what's built ->
 * how it's built (this) -> who built it -> let's work together.
 *
 * Visual: editorial feature pitch. Kicker + claim headline + deck
 * paragraph + 2×2 grid of claim cards + CTA. No SVG diagrams here —
 * those live on /about/architecture where they earn their space.
 */

type Claim = {
  name: string;
  body: React.ReactNode;
};

const CLAIMS: Claim[] = [
  {
    name: "Volatility-based services",
    body: (
      <>
        Each service is drawn around what changes for the same reason — money, people, speech,
        identity. IDesign&apos;s rule of thumb, not a noun-per-service architecture.
      </>
    ),
  },
  {
    name: "One database per service",
    body: (
      <>
        Every service owns its own Postgres schema. Services keep projections of each other&apos;s
        data, populated by domain events on the bus — they never reach across into another
        service&apos;s tables.
      </>
    ),
  },
  {
    name: "Transactional outbox + idempotency",
    body: (
      <>
        Events are written in the same Postgres transaction as the aggregate, then dispatched by an
        outbox publisher. Consumers dedup on a <code>ProcessedEvents</code> table — at-least-once
        delivery becomes effectively-once.
      </>
    ),
  },
  {
    name: "Hand-rolled identity service",
    body: (
      <>
        One of the seven services is Identity — JWT auth, refresh tokens, RBAC, email verification,
        demo sessions, all in .NET. Every other service consumes its events for projections. No
        Auth0, no Clerk in the mesh.
      </>
    ),
  },
];

export function ArchitecturePitch() {
  return (
    <section className="ed-landing-section" aria-labelledby="architecture-pitch-heading">
      {/* Section row: kicker on left, ghost CTA on right */}
      <div className="ed-section-row">
        <div className="flex flex-col gap-1">
          <span
            className="font-700 font-mono text-xs uppercase tracking-[0.18em]"
            style={{ color: "var(--red)" }}
          >
            Feature · Seven services · One bus
          </span>
          <h2 id="architecture-pitch-heading" className="ed-h3 leading-tight">
            Built like <em>production</em>, not a tutorial.
          </h2>
        </div>
        <Link
          href="/about/architecture"
          className="font-700 shrink-0 font-mono text-xs uppercase tracking-[0.16em]"
          style={{ color: "var(--ink)" }}
        >
          Read the full architecture{" "}
          <Icon name="arrowRight" size={12} strokeWidth={2} className="inline align-[-1px]" />
        </Link>
      </div>

      {/* Deck paragraph — establishes the topology and credibility
          upfront. Three "each its own X" clauses make the microservice
          separation impossible to miss. */}
      <p className="ed-section-row-deck" style={{ maxWidth: "72ch" }}>
        Seven .NET 8 services, each independently deployable, each with its own Postgres schema and
        its own RabbitMQ queue. They cooperate only through domain events on a shared bus. Designed
        with IDesign volatility decomposition, modeled with DDD, hand-rolled end to end.
      </p>

      {/* 4 claim cards in 2×2 on md+, single column on mobile.
          Styling matches the .ed-module-card pattern (1.5px ink border,
          paper background, red mono "No. XX" kicker) so the section
          reads as part of the same editorial system, not a foreign
          insert. */}
      <ul
        className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2"
        aria-label="Architectural patterns"
      >
        {CLAIMS.map((claim, i) => (
          <li
            key={claim.name}
            className="flex flex-col gap-2.5 border-[1.5px] border-ink bg-paper p-6"
          >
            <span
              className="font-600 font-mono text-xs uppercase tracking-[0.16em]"
              style={{ color: "var(--red)" }}
              aria-hidden="true"
            >
              No. {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="ed-h4 leading-tight">{claim.name}</h3>
            <p
              style={{
                fontFamily: "var(--ff-body)",
                fontSize: "0.95rem",
                lineHeight: 1.55,
                color: "var(--ink-2)",
              }}
            >
              {claim.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
