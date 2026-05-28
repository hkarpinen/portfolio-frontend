import { Btn, EditorialPageHead, Icon, PullQuote } from "@/components/editorial";
import type { Metadata } from "next";
import Link from "next/link";

import { LifecycleRibbon } from "@/components/architecture/lifecycle-ribbon";
import { BoundedContextsMap } from "@/components/architecture/bounded-contexts-map";

/**
 * <ArchitecturePage> — the long-form "how this site is built" article.
 *
 * Linked from the landing-page LifecycleTeaser and from a card on /about.
 * Carries the two anchor diagrams (LifecycleRibbon, BoundedContextsMap)
 * plus the DDD/IDesign narrative that the landing intentionally omits.
 *
 * Real event names, real aggregates — everything you see here matches
 * what's wired up in the backend services.
 */

export const metadata: Metadata = {
  // Title template will append " — The Stack & Gazette" automatically
  title: "Architecture",
  description:
    "Six .NET 8 microservices on a RabbitMQ spine. Volatility-based decomposition (IDesign × DDD), transactional outbox, idempotent consumers, hand-rolled identity. The architecture behind The Stack & Gazette, illustrated.",
  alternates: { canonical: "/about/architecture" },
  openGraph: {
    title: "Architecture — The Stack & Gazette",
    description:
      "Six .NET 8 microservices on one RabbitMQ spine. IDesign × DDD, transactional outbox, idempotent consumers — illustrated.",
    url: "/about/architecture",
    type: "article",
  },
  twitter: {
    title: "Architecture — The Stack & Gazette",
    description:
      "Six .NET 8 microservices on one RabbitMQ spine. IDesign × DDD, transactional outbox, idempotent consumers — illustrated.",
  },
  keywords: [
    "microservices architecture",
    "DDD",
    "IDesign",
    "Juval Löwy",
    "transactional outbox",
    "RabbitMQ",
    "MassTransit",
    ".NET microservices portfolio",
    "bounded contexts",
    "domain-driven design",
  ],
};

const STACK: { label: string; items: string[] }[] = [
  {
    label: "Services",
    items: [".NET 8", "ASP.NET Core", "MediatR", "EF Core", "Postgres 16"],
  },
  {
    label: "Messaging",
    items: ["RabbitMQ", "MassTransit", "Transactional outbox", "Idempotency table"],
  },
  {
    label: "Frontend",
    items: ["Next.js 14", "TypeScript", "React Query", "Tailwind", "Radix"],
  },
  {
    label: "Edge & infra",
    items: ["Nginx gateway", "Docker Compose", "AWS", "GitHub Actions"],
  },
];

export default function ArchitecturePage() {
  return (
    <div className="ed-about">
      <EditorialPageHead
        kicker="About · The architecture"
        title="Six services, <em>one spine.</em>"
        deck="The site is six independent .NET microservices behind one Nginx gateway. They share no database and no contracts library — they cooperate through domain events on a RabbitMQ bus. Here's why, and what one event looks like end to end."
      />

      {/* ── Why this shape — the long-form intro ─────────────────────────── */}
      <section aria-labelledby="why-heading" className="ed-about-grid" style={{ marginTop: 48 }}>
        <div className="flex flex-col gap-6">
          <h2 id="why-heading" className="ed-h3">
            Why <em>six</em>, not one?
          </h2>
          <p
            style={{
              fontFamily: "var(--ff-body)",
              color: "var(--ink-2)",
              lineHeight: 1.6,
              fontSize: "1.0625rem",
            }}
          >
            A portfolio app could be a single .NET project. This one isn&apos;t, for a specific
            reason: I wanted the seams to be visible. Each service is drawn around a{" "}
            <em>volatility</em> — a part of the system likely to change for its own reasons — rather
            than around a noun like &quot;User&quot; or a verb like &quot;Manage&quot;. That&apos;s
            Juval Löwy&apos;s IDesign rule of thumb, and it&apos;s the only decomposition I&apos;ve
            found that survives feature growth.
          </p>
          <p
            style={{
              fontFamily: "var(--ff-body)",
              color: "var(--ink-2)",
              lineHeight: 1.6,
              fontSize: "1.0625rem",
            }}
          >
            Finance owns the rules of money. Household owns the people who share it. Forum owns
            public speech. Identity owns who you are. None of them reach into another&apos;s
            database. The only way they cooperate is by publishing domain events to a RabbitMQ spine
            — and the consumers bind to the publisher&apos;s real event type, not a sanitized
            integration contract. Less indirection, less drift.
          </p>
        </div>

        <aside aria-label="At a glance">
          <div className="ed-card-dark" role="complementary">
            <p className="ed-kicker">At a glance</p>
            <dl className="mt-2 flex flex-col gap-3">
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.16em] text-paper opacity-60">
                  Services
                </dt>
                <dd className="ed-h4 ed-card-dark-lead">Six on the bus, two off</dd>
              </div>
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.16em] text-paper opacity-60">
                  Bus
                </dt>
                <dd className="ed-h4 ed-card-dark-lead">RabbitMQ · MassTransit</dd>
              </div>
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.16em] text-paper opacity-60">
                  Reliability
                </dt>
                <dd className="ed-h4 ed-card-dark-lead">Outbox + idempotency</dd>
              </div>
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.16em] text-paper opacity-60">
                  Edge
                </dt>
                <dd className="ed-h4 ed-card-dark-lead">Nginx · Docker · AWS</dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>

      {/* ── Pull quote — the soul of the page ────────────────────────────── */}
      <div style={{ marginTop: 72, marginBottom: 72 }}>
        <PullQuote attribution="Design philosophy · IDesign × DDD">
          Each service is drawn around <em>what&apos;s likely to change together</em> — not around a
          noun. They never touch each other&apos;s tables. The bus is the only crossing.
        </PullQuote>
      </div>

      {/* ── Lifecycle ribbon ─────────────────────────────────────────────── */}
      <section aria-labelledby="lifecycle-heading" style={{ marginBottom: 96 }}>
        <div className="ed-section-row">
          <h2 id="lifecycle-heading" className="ed-h3">
            One event, <em>end to end</em>
          </h2>
          <p
            className="font-mono text-xs uppercase tracking-[0.16em]"
            style={{ color: "var(--ink-3)" }}
          >
            Diagram · the request thread &amp; the background dispatch
          </p>
        </div>
        <p className="ed-section-row-deck">
          A single tap on the &quot;Add expense&quot; button travels through six stages. The
          user&apos;s HTTP request returns before the bus even hears about it — the publish is
          decoupled by the transactional outbox.
        </p>
        <LifecycleRibbon />
      </section>

      {/* ── Bounded contexts map ─────────────────────────────────────────── */}
      <section aria-labelledby="contexts-heading" style={{ marginBottom: 96 }}>
        <div className="ed-section-row">
          <h2 id="contexts-heading" className="ed-h3">
            Bounded contexts, <em>one bus</em>
          </h2>
          <p
            className="font-mono text-xs uppercase tracking-[0.16em]"
            style={{ color: "var(--ink-3)" }}
          >
            Diagram · who owns what, what they publish
          </p>
        </div>
        <p className="ed-section-row-deck">
          Five services participate in the messaging story. Geography (weather) and Math (unit
          conversion) are pure utility services and live off-bus — they don&apos;t publish or
          consume events.
        </p>
        <BoundedContextsMap />
      </section>

      {/* ── The stack — relocated badges from the landing strip ──────────── */}
      <section aria-labelledby="stack-heading" style={{ marginBottom: 96 }}>
        <div className="ed-section-row">
          <h2 id="stack-heading" className="ed-h3">
            The <em>stack</em>
          </h2>
        </div>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          {STACK.map((group) => (
            <div key={group.label}>
              <dt
                className="font-700 mb-2 font-mono text-xs uppercase tracking-[0.16em]"
                style={{ color: "var(--red)" }}
              >
                {group.label}
              </dt>
              <dd className="flex flex-wrap gap-2">
                {group.items.map((t) => (
                  <span
                    key={t}
                    className="font-600 border border-ink-3 px-2 py-1 font-mono text-xs uppercase tracking-[0.12em]"
                    style={{ color: "var(--ink-2)" }}
                  >
                    {t}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── CTA back to /about and /contact ──────────────────────────────── */}
      <section className="ed-banner-dark" aria-label="Next steps">
        <div className="min-w-[240px] flex-1">
          <p className="ed-kicker">Read the rest</p>
          <p className="ed-h3 ed-banner-dark-title">
            The <em>code</em> behind these diagrams.
          </p>
          <p className="mt-2 font-mono text-sm uppercase tracking-[0.12em] text-[var(--paper)] opacity-80">
            Each service is its own .NET project · The full bio lives on the about page · Or just
            get in touch.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:shrink-0 sm:flex-row">
          <Btn href="/#about" variant="secondary" size="lg" className="ed-btn-on-dark">
            Back to bio
          </Btn>
          <Btn
            href="/contact"
            variant="primary"
            size="lg"
            iconRight={<Icon name="arrowRight" size={16} />}
          >
            Get in touch
          </Btn>
        </div>
      </section>

      <div className="mt-12 border-t border-rule py-6">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-2">
          Source on{" "}
          <a
            href="https://github.com/hkarpinen"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red underline"
          >
            GitHub
          </a>{" "}
          · Six .NET 8 services · One Next.js shell ·{" "}
          <Link href="/" className="text-red underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
