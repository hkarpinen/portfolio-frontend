import Link from "next/link";
import { getSession } from "@/lib/auth/session";

/* ── Inline SVG icon helper ──────────────────────────────────────────────────*/
function Icon({ path, size = 16 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", flexShrink: 0 }}>
      <path d={path} />
    </svg>
  );
}
const arrowRight = "M5 12h14M12 5l7 7-7 7";

/* ── Button helper ───────────────────────────────────────────────────────────*/
function Btn({
  href, children, variant = "primary", size = "lg",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "lg";
}) {
  const isPrimary = variant === "primary";
  return (
    <Link
      href={href}
      className={isPrimary ? "lp-btn-primary" : "lp-btn-secondary"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 22px",
        height: 44,
        background: isPrimary ? "var(--ink)" : "transparent",
        color: isPrimary ? "var(--paper)" : "var(--ink)",
        border: "1.5px solid var(--ink)",
        fontFamily: "var(--ff-mono)",
        fontSize: "var(--bs-micro)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.18em",
        textDecoration: "none",
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
      }}
    >
      {children}
    </Link>
  );
}

/* ── Ticker ──────────────────────────────────────────────────────────────────*/
const TICKER_PHRASES = [
  "Now hiring me", "Five services standing", "30+ screens shipped",
  "RabbitMQ humming", "Zero downtime since last Tuesday", "Coffee consumed: 1,284 cups",
  "Open to relocate", "References available",
];

function Ticker() {
  const items = [...TICKER_PHRASES, ...TICKER_PHRASES].map((p, i) => (
    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      {p}
      <span style={{ color: "var(--red)", fontSize: "8px" }}>▪</span>
    </span>
  ));

  return (
    <div style={{
      borderBottom: "1.5px solid var(--ink)",
      padding: "7px 0",
      display: "flex",
      alignItems: "center",
      gap: 14,
      overflow: "hidden",
      whiteSpace: "nowrap",
      fontFamily: "var(--ff-mono)",
      fontSize: "var(--bs-eyebrow)",
      textTransform: "uppercase",
      letterSpacing: "0.18em",
      color: "var(--ink-2)",
    }}>
      <span className="pulse-dot" style={{ marginLeft: 32 }} aria-hidden="true" />
      <div style={{
        flex: 1,
        overflow: "hidden",
        maskImage: "linear-gradient(90deg, transparent, #000 40px, #000 calc(100% - 40px), transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 40px, #000 calc(100% - 40px), transparent)",
      }}>
        <div className="ticker-track">
          {items}
        </div>
      </div>
    </div>
  );
}

/* ── Masthead ─────────────────────────────────────────────────────────────────*/
function Masthead() {
  return (
    <div style={{
      padding: "32px 5% 22px",
      borderBottom: "3px solid var(--ink)",
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      gap: 28,
      alignItems: "end",
    }}
    className="landing-masthead"
    >
      {/* Left */}
      <div style={{
        fontFamily: "var(--ff-mono)",
        fontSize: "var(--bs-meta)",
        color: "var(--ink-2)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        lineHeight: 1.55,
        textAlign: "left",
      }}>
        <div><b style={{ color: "var(--ink)" }}>Vol. I · No. 04</b></div>
        <div>Thursday, 15 May 2026</div>
        <div>The portfolio edition</div>
      </div>

      {/* Center — Nameplate */}
      <div style={{ textAlign: "center" }}>
        <Link href="/" style={{ textDecoration: "none", display: "block" }}>
          <span style={{
            fontFamily: "var(--ff-serif)",
            fontStyle: "italic",
            fontSize: "var(--bs-nameplate)",
            letterSpacing: "-0.035em",
            lineHeight: 0.9,
            whiteSpace: "nowrap",
            color: "var(--ink)",
            display: "block",
          }}>
            The Stack<span style={{ color: "var(--red)" }}>.</span>
          </span>
        </Link>
        <p style={{
          fontFamily: "var(--ff-serif)",
          fontStyle: "italic",
          fontSize: "0.95rem",
          color: "var(--ink-2)",
          marginTop: 16,
        }}>&ldquo;All the code that&rsquo;s fit to ship.&rdquo;</p>
      </div>

      {/* Right */}
      <div style={{
        fontFamily: "var(--ff-mono)",
        fontSize: "var(--bs-meta)",
        color: "var(--ink-2)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        lineHeight: 1.55,
        textAlign: "right",
      }}>
        <div><b style={{ color: "var(--ink)" }}>Issue Price</b> · Free<span style={{ color: "var(--red)" }}>*</span></div>
        <div>Circulation: One reader</div>
        <div><span style={{ color: "var(--red)" }}>*</span>Hiring me costs more</div>
      </div>
    </div>
  );
}

/* ── Edition nav ──────────────────────────────────────────────────────────────*/
function EditionNav() {
  return (
    <div style={{
      padding: "10px 5%",
      borderBottom: "1.5px solid var(--ink)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 16,
      flexWrap: "wrap",
      fontFamily: "var(--ff-mono)",
      fontSize: "var(--bs-meta)",
      textTransform: "uppercase",
      letterSpacing: "0.20em",
      color: "var(--ink-2)",
    }}>
      <span>Sections within →</span>
      <div className="edition-nav-center" style={{ display: "flex", gap: 24 }}>
        {[
          { label: "Front Page", href: "#lede" },
          { label: "Architecture", href: "#dispatches" },
          { label: "Modules", href: "#modules" },
          { label: "Stack", href: "#stack" },
          { label: "Want Ads", href: "#wanted" },
        ].map(item => (
          <a
            key={item.href}
            href={item.href}
            className="lp-nav-link"
            style={{
              color: "var(--ink)",
              textDecoration: "none",
              borderBottom: "1px solid transparent",
              paddingBottom: 1,
            }}
          >{item.label}</a>
        ))}
      </div>
      <span style={{ color: "var(--red)", fontWeight: 700 }}>Filed: 15·V·2026</span>
    </div>
  );
}

/* ── Lede ─────────────────────────────────────────────────────────────────────*/
function Lede() {
  return (
    <section style={{
      padding: "52px 0 40px",
      borderBottom: "3px double var(--ink)",
    }}>
      {/* Kicker */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span style={{ width: 28, height: 1, background: "var(--red)", display: "inline-block" }} />
        <span style={{
          fontFamily: "var(--ff-mono)",
          fontSize: "var(--bs-meta)",
          color: "var(--red)",
          textTransform: "uppercase",
          letterSpacing: "0.32em",
        }}>Lead Story · Engineering desk · 4 min read</span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "8fr 4fr",
        gap: 56,
        alignItems: "end",
      }} className="lede-grid">
        {/* Headline */}
        <div>
          <h1 style={{
            fontFamily: "var(--ff-serif)",
            fontWeight: 400,
            fontSize: "var(--bs-headline)",
            lineHeight: 0.86,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
          }}>
            A full-stack app,<br />
            <span style={{ display: "block", fontStyle: "italic", color: "var(--red)", textIndent: "1.6em" }}>built</span>
            <span style={{ display: "block", fontStyle: "italic" }}>from scratch.</span>
          </h1>
          <p style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--bs-meta)",
            color: "var(--ink-3)",
            textTransform: "uppercase",
            letterSpacing: "0.24em",
            marginTop: 22,
          }}>By Hank Karpinen · Filed from localhost</p>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            <Btn href="/about" variant="primary">View the work <Icon path={arrowRight} size={14} /></Btn>
            <Btn href="/bills" variant="secondary">Explore the modules</Btn>
          </div>
        </div>

        {/* Aside — dropcap column */}
        <div style={{
          borderLeft: "1.5px solid var(--ink)",
          paddingLeft: 28,
          fontFamily: "var(--ff-body)",
          fontSize: "var(--bs-col)",
          lineHeight: 1.55,
          color: "var(--ink-2)",
        }} className="lede-aside">
          {/* Dropcap paragraph */}
          <p style={{ marginBottom: 14 }}>
            <span style={{
              fontFamily: "var(--ff-serif)",
              fontStyle: "italic",
              fontSize: "var(--bs-dropcap)",
              color: "var(--red)",
              float: "left",
              lineHeight: 0.85,
              padding: "6px 10px 0 0",
            }}>I</span>
            t started because microservices articles always handwave the boundaries. Six services, six Postgres databases, one Compose file. Within a week you find out which of your choices were lazy. Some were mine. I rewrote the Household service twice.
          </p>

          {/* Pull quote */}
          <blockquote style={{
            borderTop: "1px solid var(--ink)",
            borderBottom: "1px solid var(--ink)",
            padding: "14px 0",
            margin: "16px 0",
            fontFamily: "var(--ff-serif)",
            fontStyle: "italic",
            fontSize: "var(--bs-card-h)",
            color: "var(--ink)",
            lineHeight: 1.25,
          }}>
            &ldquo;Identity, Household, Finance, Forum, Notifications. Six services. One frontend that ties them together.&rdquo;
          </blockquote>

          <p>
            <b>.NET 8</b> on the back, <b>Next.js</b> on the front, <b>Postgres</b> for storage, <b>RabbitMQ</b> for the bus, <b>Nginx</b> in front. No Auth0 — I wanted to know what JWT rotation actually looked like.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Ledger strip ─────────────────────────────────────────────────────────────*/
function LedgerStrip() {
  const cells = [
    { n: "05",   italic: false, desc: "Modules shipped" },
    { n: "30+",  italic: true,  desc: "Screens designed" },
    { n: "06",   italic: false, desc: "Services standing" },
    { n: "100%", italic: true,  desc: "TypeScript" },
  ];

  return (
    <div style={{
      padding: "24px 0",
      borderBottom: "1.5px solid var(--ink)",
      display: "grid",
      gridTemplateColumns: "auto repeat(4, 1fr)",
      alignItems: "stretch",
    }} className="ledger-strip">
      {/* Label cell — desktop only */}
      <div className="ledger-label" style={{
        fontFamily: "var(--ff-mono)",
        fontSize: "var(--bs-eyebrow)",
        color: "var(--ink-3)",
        textTransform: "uppercase",
        letterSpacing: "0.22em",
        alignSelf: "end",
        paddingRight: 28,
        borderRight: "1.5px solid var(--ink)",
        maxWidth: 200,
      }}>The figures, at a glance →</div>

      {cells.map((cell, i) => (
        <div key={i} style={{
          padding: "6px 22px",
          borderRight: i < cells.length - 1 ? "1.5px solid var(--ink)" : undefined,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}>
          <span style={{
            fontFamily: "var(--ff-serif)",
            fontStyle: cell.italic ? "italic" : "normal",
            fontSize: "var(--bs-lede-num)",
            lineHeight: 0.9,
            letterSpacing: "-0.025em",
            color: cell.italic ? "var(--red)" : "var(--ink)",
          }}>{cell.n}</span>
          <span style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--bs-eyebrow)",
            color: "var(--ink-3)",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            marginTop: 8,
          }}>{cell.desc}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Section header shared ────────────────────────────────────────────────────*/
function SectionHead({
  numeral, title, accentWord, meta,
}: {
  numeral: string;
  title: React.ReactNode;
  accentWord?: string;
  meta: string;
}) {
  return (
    <div style={{
      padding: "28px 0 16px",
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 24,
      borderBottom: "1.5px solid var(--ink)",
      flexWrap: "wrap",
    }}>
      <span style={{
        fontFamily: "var(--ff-serif)",
        fontStyle: "italic",
        fontSize: "2.4rem",
        color: "var(--red)",
        lineHeight: 1,
        flexShrink: 0,
      }}>{numeral}</span>
      <h2 style={{
        fontFamily: "var(--ff-serif)",
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: "var(--bs-sec-h)",
        lineHeight: 1,
        letterSpacing: "-0.02em",
        color: "var(--ink)",
        flex: 1,
        marginLeft: 18,
      }}>{title}</h2>
      <p style={{
        fontFamily: "var(--ff-mono)",
        fontSize: "var(--bs-eyebrow)",
        color: "var(--ink-3)",
        textTransform: "uppercase",
        letterSpacing: "0.20em",
        maxWidth: 280,
        lineHeight: 1.6,
        textAlign: "right",
      }}>{meta}</p>
    </div>
  );
}

/* ── Dispatches ───────────────────────────────────────────────────────────────*/
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

function Dispatches() {
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
const MODULES = [
  {
    ad: "Ad  № 001",
    title: <>Household <em style={{ color: "var(--red)" }}>&amp; Chores</em></>,
    body: "Shared household management. Members, chores roster, calendar events, contribution tracking. The glue between housemates that isn't a group chat.",
    sub: "4 sub-pages",
    href: "/bills",
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
];

function Modules() {
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
              <span style={{ color: "var(--red)", fontSize: "var(--bs-meta)" }}>★</span>
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

function StackSpecimen() {
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
function Wanted() {
  return (
    <section id="wanted" style={{
      padding: "60px 0 50px",
      borderBottom: "3px double var(--ink)",
      display: "grid",
      gridTemplateColumns: "5fr 7fr",
      gap: 56,
      alignItems: "center",
    }} className="wanted-grid">
      {/* Stamp */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className="wanted-stamp">
          <p style={{
            fontFamily: "var(--ff-serif)",
            fontStyle: "italic",
            fontSize: "var(--bs-wanted-st)",
            color: "var(--red)",
            letterSpacing: "-0.02em",
            lineHeight: 0.9,
          }}>Wanted</p>
          <div style={{ width: "60%", height: 1, background: "var(--ink)", margin: "14px auto" }} />
          <p style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--bs-meta)",
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            color: "var(--ink)",
            marginBottom: 10,
          }}>Full-Stack Roles</p>
          <p style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "0.5rem",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "var(--ink-3)",
            lineHeight: 1.8,
          }}>Apply within<br />References on file<br />Reward: gainful employment</p>
        </div>
      </div>

      {/* Body */}
      <div>
        <h2 style={{
          fontFamily: "var(--ff-serif)",
          fontWeight: 400,
          fontSize: "var(--bs-wanted)",
          lineHeight: 0.95,
          letterSpacing: "-0.025em",
          marginBottom: 18,
          color: "var(--ink)",
        }}>Let&rsquo;s <em style={{ color: "var(--red)" }}>work</em> together.</h2>
        <p style={{
          fontFamily: "var(--ff-body)",
          fontSize: "var(--bs-note)",
          color: "var(--ink-2)",
          lineHeight: 1.5,
          maxWidth: 520,
          marginBottom: 22,
        }}>
          Currently open to full-stack engineering roles — remote, hybrid, or on-site for the right team. Senior or staff. I write the database migrations, the auth flows, <em>and</em> the marketing site.
        </p>

        {/* Contact lines */}
        <div style={{
          borderTop: "1px solid var(--ink)",
          paddingTop: 18,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          fontFamily: "var(--ff-mono)",
          fontSize: "var(--bs-micro)",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "var(--ink-2)",
          marginBottom: 24,
        }}>
          {[
            { label: "Email",    value: "hank@thestack.dev", href: "mailto:hank@thestack.dev" },
            { label: "Based",    value: "Pullman, WA · open to relocate", href: undefined },
            { label: "GitHub",   value: "github.com/hkarpinen", href: "https://github.com/hkarpinen" },
            { label: "LinkedIn", value: "/in/hank-karpinen", href: "https://linkedin.com/in/hank-karpinen" },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", gap: 16 }}>
              <span style={{ color: "var(--ink-3)", minWidth: 60 }}>{row.label}</span>
              {row.href ? (
                <a href={row.href} style={{ color: "var(--ink)", textDecoration: "underline" }}>{row.value}</a>
              ) : (
                <span style={{ color: "var(--ink)" }}>{row.value}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Btn href="mailto:hank@thestack.dev" variant="primary">Reply by post <Icon path={arrowRight} size={14} /></Btn>
          <Btn href="/about" variant="secondary">Tour the work</Btn>
        </div>
      </div>
    </section>
  );
}

/* ── Colophon ─────────────────────────────────────────────────────────────────*/
function Colophon() {
  return (
    <div style={{
      padding: "36px 0 50px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 32,
    }} className="colophon-grid">
      <div>
        <h5 style={{ fontFamily: "var(--ff-serif)", fontStyle: "italic", fontSize: "var(--bs-lede)", marginBottom: 10, color: "var(--ink)" }}>Colophon</h5>
        <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.7rem", color: "var(--ink-2)", lineHeight: 1.55 }}>
          Set in <em>Instrument Serif</em> for display and <em>JetBrains Mono</em> for body copy. Printed on the web at 96 DPI. No models were prompted in the making of this page.
        </p>
      </div>
      <div>
        <h5 style={{ fontFamily: "var(--ff-serif)", fontStyle: "italic", fontSize: "var(--bs-lede)", marginBottom: 10, color: "var(--ink)" }}>Departments</h5>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { label: "Front Page", href: "#lede" },
            { label: "Architecture Desk", href: "#dispatches" },
            { label: "Module Classifieds", href: "#modules" },
            { label: "The Stack", href: "#stack" },
            { label: "Want Ads", href: "#wanted" },
          ].map(item => (
            <a key={item.href} href={item.href} className="lp-colophon-link" style={{
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--bs-meta)",
              color: "var(--ink)",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              textDecoration: "none",
            }}>{item.label}</a>
          ))}
        </div>
      </div>
      <div>
        <h5 style={{ fontFamily: "var(--ff-serif)", fontStyle: "italic", fontSize: "var(--bs-lede)", marginBottom: 10, color: "var(--ink)" }}>Contact the editor</h5>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { label: "hank@thestack.dev", href: "mailto:hank@thestack.dev" },
            { label: "github.com/hkarpinen", href: "https://github.com/hkarpinen" },
            { label: "linkedin.com/in/hank-karpinen", href: "https://linkedin.com/in/hank-karpinen" },
          ].map(item => (
            <a key={item.href} href={item.href} className="lp-colophon-link" style={{
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--bs-meta)",
              color: "var(--ink)",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              textDecoration: "none",
            }}>{item.label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Endmark ──────────────────────────────────────────────────────────────────*/
function Endmark() {
  return (
    <div style={{
      textAlign: "center",
      padding: "24px 0 48px",
      fontFamily: "var(--ff-serif)",
      fontStyle: "italic",
      fontSize: "var(--bs-card-h)",
      color: "var(--ink-3)",
      letterSpacing: "0.40em",
    }}>
      — 30 —
    </div>
  );
}

/* ── Page root ────────────────────────────────────────────────────────────────*/
export async function LandingPage() {
  return (
    <div style={{
      minHeight: "100%",
      background: "var(--paper)",
      overflowX: "hidden",
      overflowY: "auto",
    }}>
      {/* 1. Ticker */}
      <Ticker />

      {/* 2. Masthead */}
      <Masthead />

      {/* 3. Edition nav */}
      <EditionNav />

      {/* Center column */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 5%" }} className="landing-col">

        {/* 4. Lede */}
        <Lede />

        {/* 5. Ledger */}
        <LedgerStrip />

        {/* 6. Dispatches */}
        <Dispatches />

        {/* 7. Modules */}
        <Modules />

        {/* 8. Stack */}
        <StackSpecimen />

        {/* 9. Wanted */}
        <Wanted />

        {/* 10. Colophon */}
        <Colophon />

        {/* 11. Endmark */}
        <Endmark />
      </div>

      {/* Responsive overrides via style tag */}
      <style>{`
        @media (max-width: 767px) {
          .landing-masthead { grid-template-columns: 1fr !important; text-align: center !important; gap: 12px !important; padding: 22px 18px 16px !important; }
          .landing-masthead > div { text-align: center !important; }
          .landing-col { padding: 0 18px !important; }
          .edition-nav-center { display: none !important; }
          .lede-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .lede-aside { border-left: none !important; border-top: 1.5px solid var(--ink) !important; padding-left: 0 !important; padding-top: 24px !important; }
          .ledger-strip { grid-template-columns: 1fr 1fr !important; }
          .ledger-label { display: none !important; }
          .dispatches-grid { grid-template-columns: 1fr !important; }
          .dispatch-cell { border-right: none !important; border-bottom: 1.5px solid var(--ink) !important; padding: 20px 0 !important; }
          .modules-grid { grid-template-columns: 1fr !important; }
          .stack-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .stack-columns { columns: 1 !important; }
          .wanted-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .colophon-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .modules-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .modules-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 1400px) {
          .landing-col { padding: 0 6% !important; }
          .dispatches-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .modules-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .wanted-grid { grid-template-columns: 1fr 1fr !important; gap: 80px !important; }
        }
        @media (min-width: 1800px) {
          .landing-col { max-width: 1680px !important; padding: 0 4% !important; }
        }
      `}</style>
    </div>
  );
}
