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
        fontSize: "var(--ts-label)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.20em",
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
  "Now hiring me", "Five services running", "Thirty-odd screens shipped",
  "Open to remote, hybrid, or on-site", "References on file", "Based in Pullman, WA", "Go Cougs",
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
      fontSize: "var(--ts-meta)",
      textTransform: "uppercase",
      letterSpacing: "0.20em",
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
        fontSize: "var(--ts-meta)",
        color: "var(--ink-2)",
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        lineHeight: "var(--lh-body)",
        textAlign: "left",
      }}>
        <div><b style={{ color: "var(--ink)" }}>Vol. I · No. 04</b></div>
        <div>Filed Thursday</div>
        <div>The portfolio edition</div>
      </div>

      {/* Center — Nameplate */}
      <div style={{ textAlign: "center" }}>
        <Link href="/" style={{ textDecoration: "none", display: "block" }}>
          <span style={{
            fontFamily: "var(--ff-serif)",
            fontStyle: "italic",
            fontSize: "var(--ts-nameplate)",
            letterSpacing: "-0.035em",
            lineHeight: "var(--lh-tight)",
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
          fontSize: "var(--ts-sub)",
          color: "var(--ink-2)",
          marginTop: 12,
        }}>&ldquo;All the code that&rsquo;s fit to ship.&rdquo;</p>
        <p style={{
          fontFamily: "var(--ff-mono)",
          fontSize: "var(--ts-meta)",
          color: "var(--ink-3)",
          textTransform: "uppercase",
          letterSpacing: "0.30em",
          marginTop: 8,
        }}>By Hank Karpinen · Full-Stack Engineer · Est. 2026</p>
      </div>

      {/* Right */}
      <div style={{
        fontFamily: "var(--ff-mono)",
        fontSize: "var(--ts-meta)",
        color: "var(--ink-2)",
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        lineHeight: "var(--lh-body)",
        textAlign: "right",
      }}>
        <div><b style={{ color: "var(--ink)" }}>Issue price · Free</b></div>
        <div>Hiring me costs more</div>
        <div>Pullman, WA · 99163</div>
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
      fontSize: "var(--ts-meta)",
      textTransform: "uppercase",
      letterSpacing: "0.20em",
      color: "var(--ink-2)",
    }}>
      <span>Sections within →</span>
      <div className="edition-nav-center" style={{ display: "flex", gap: 24 }}>
        {[
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
      <span style={{ color: "var(--red)", fontWeight: 700 }}>Filed today</span>
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
        <span style={{ width: 26, height: 1, background: "var(--red)", display: "inline-block" }} />
        <span style={{
          fontFamily: "var(--ff-mono)",
          fontSize: "var(--ts-meta)",
          color: "var(--red)",
          textTransform: "uppercase",
          letterSpacing: "0.30em",
        }}>Lead Story · Engineering desk</span>
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
            fontSize: "var(--ts-h1)",
            lineHeight: "var(--lh-tight)",
            letterSpacing: "-0.03em",
            color: "var(--ink)",
          }}>
            A full-stack app,<br />
            <span style={{ display: "inline-block", marginLeft: "clamp(0.3em, 1.2vw, 1.4em)" }}>
              <em style={{ color: "var(--red)" }}>built</em>
            </span><br />
            <em>from scratch.</em>
          </h1>
          <p style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--ts-meta)",
            color: "var(--ink-3)",
            textTransform: "uppercase",
            letterSpacing: "0.24em",
            marginTop: 22,
          }}>By Hank Karpinen · Filed from localhost</p>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            <Btn href="/about" variant="primary">View the work <Icon path={arrowRight} size={14} /></Btn>
            <Btn href="/households" variant="secondary">Explore the modules <Icon path={arrowRight} size={14} /></Btn>
          </div>
        </div>

        {/* Aside — dropcap column */}
        <div style={{
          borderLeft: "1.5px solid var(--ink)",
          paddingLeft: 26,
          fontFamily: "var(--ff-body)",
          fontSize: "var(--ts-lead)",
          lineHeight: "var(--lh-loose)",
          color: "var(--ink-2)",
        }} className="lede-aside">
          {/* Dropcap paragraph */}
          <p>
            <span style={{
              fontFamily: "var(--ff-serif)",
              fontStyle: "italic",
              fontSize: "clamp(52px, 6vw, 72px)",
              color: "var(--red)",
              float: "left",
              lineHeight: 0.78,
              padding: "4px 10px 0 0",
            }}>I</span>
            t started because microservices articles always handwave the boundaries. Five services, five Postgres databases, one Compose file. Within a week you find out which of your choices were lazy. Some were mine. I rewrote the Bills service twice.
          </p>

          {/* Pull quote */}
          <blockquote style={{
            borderTop: "1px solid var(--ink)",
            borderBottom: "1px solid var(--ink)",
            padding: "14px 0",
            margin: "16px 0",
            fontFamily: "var(--ff-serif)",
            fontStyle: "italic",
            fontSize: "var(--ts-card-h)",
            color: "var(--ink)",
            lineHeight: "var(--lh-snug)",
          }}>
            &ldquo;Identity, Bills, Forum, Notifications. Plus a Next.js frontend that sits on top of all four.&rdquo;
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
    { n: "04",   italic: false, desc: "Modules shipped" },
    { n: "30+",  italic: true,  desc: "Screens designed" },
    { n: "05",   italic: false, desc: "Services standing" },
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
        fontSize: "var(--ts-meta)",
        color: "var(--ink-3)",
        textTransform: "uppercase",
        letterSpacing: "0.22em",
        alignSelf: "end",
        paddingRight: 26,
        borderRight: "1.5px solid var(--ink)",
        maxWidth: 200,
      }}>The figures, at a glance →</div>

      {cells.map((cell, i) => (
        <div key={i} style={{
          padding: "6px 18px",
          borderRight: i < cells.length - 1 ? "1.5px solid var(--ink)" : undefined,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}>
          <span style={{
            fontFamily: "var(--ff-serif)",
            fontStyle: cell.italic ? "italic" : "normal",
            fontSize: "var(--ts-numeral)",
            lineHeight: "var(--lh-tight)",
            letterSpacing: "-0.02em",
            color: cell.italic ? "var(--red)" : "var(--ink)",
          }}>{cell.n}</span>
          <span style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--ts-meta)",
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
        fontSize: "var(--ts-h2)",
        color: "var(--red)",
        lineHeight: "var(--lh-display)",
        flexShrink: 0,
      }}>{numeral}</span>
      <h2 style={{
        fontFamily: "var(--ff-serif)",
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: "var(--ts-h2)",
        lineHeight: "var(--lh-display)",
        letterSpacing: "-0.02em",
        color: "var(--ink)",
        flex: 1,
        marginLeft: 16,
      }}>{title}</h2>
      <p style={{
        fontFamily: "var(--ff-mono)",
        fontSize: "var(--ts-meta)",
        color: "var(--ink-3)",
        textTransform: "uppercase",
        letterSpacing: "0.20em",
        maxWidth: 260,
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
              fontSize: "var(--ts-meta)",
              color: "var(--red)",
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              marginBottom: 12,
            }}>{d.kicker}</p>
            <h3 style={{
              fontFamily: "var(--ff-serif)",
              fontWeight: 400,
              fontSize: "var(--ts-h3)",
              lineHeight: "var(--lh-snug)",
              marginBottom: 14,
              color: "var(--ink)",
            }}>{d.h3}</h3>
            <p style={{ fontFamily: "var(--ff-body)", fontSize: "var(--ts-body)", lineHeight: "var(--lh-body)", color: "var(--ink-2)", flex: 1 }}>{d.body}</p>
            <div style={{
              borderTop: "1px solid var(--ink)",
              marginTop: 18,
              paddingTop: 12,
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-meta)",
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
    ad: "Ad № 001",
    title: <><em style={{ color: "var(--red)" }}>Households</em> & Planning</>,
    body: "Shared ledger, chore rotation, calendar planning, and contribution tracking — all under one roof. Because managing a household is more than splitting the Wi-Fi bill.",
    sub: "6 sub-pages",
    href: "/households",
  },
  {
    ad: "Ad № 002",
    title: <><em style={{ color: "var(--red)" }}>Finance</em> Tracker</>,
    body: "Personal income sources, recurring expenses, and a budget overview. Tracks what you owe yourself before you figure out what you owe everyone else.",
    sub: "3 sub-pages",
    href: "/expenses",
  },
  {
    ad: "Ad № 003",
    title: <>Community <em style={{ color: "var(--red)" }}>Forum</em></>,
    body: "Threaded discussions, nested comments, upvotes, mod queue, mod log. Smaller than Reddit. Quieter, too. Comments collapse at 5 levels deep, which I learned the hard way.",
    sub: "8 sub-pages",
    href: "/communities",
  },
  {
    ad: "Ad № 004",
    title: <><em style={{ color: "var(--red)" }}>Portfolio</em> Pages</>,
    body: "The personal corner. Projects, skills, links, and a contact form that sends real email, not the kind that gets eaten by SendGrid's free tier.",
    sub: "3 sub-pages",
    href: "/about",
  },
  {
    ad: "Ad № 005",
    title: <>Account & <em style={{ color: "var(--red)" }}>Auth</em></>,
    body: "Sign-up, sign-in, password reset, email confirm, 2FA toggle, sessions, avatar upload, notification prefs. Boring. Took longer than the forum.",
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
        gridTemplateColumns: "repeat(5, 1fr)",
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
                fontSize: "var(--ts-meta)",
                color: "var(--ink-3)",
                textTransform: "uppercase",
                letterSpacing: "0.22em",
              }}>{m.ad}</span>
              <span style={{ color: "var(--red)", fontSize: 14 }}>★</span>
            </div>
            {/* Title */}
            <h3 style={{
              fontFamily: "var(--ff-serif)",
              fontWeight: 400,
              fontSize: "var(--ts-card-h)",
              lineHeight: "var(--lh-display)",
              color: "var(--ink)",
              marginBottom: 10,
            }}>{m.title}</h3>
            {/* Body — grows to fill remaining space */}
            <p style={{
              fontFamily: "var(--ff-body)",
              fontSize: "var(--ts-body)",
              color: "var(--ink-2)",
              lineHeight: "var(--lh-body)",
              flex: 1,
            }}>{m.body}</p>
            {/* Footer — pinned to bottom */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px dashed var(--ink-3)",
              paddingTop: 10,
              marginTop: 16,
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-meta)",
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
          <span style={{ fontFamily: "var(--ff-serif)", fontStyle: "italic", fontSize: "var(--ts-h2)", color: "var(--red)", lineHeight: "var(--lh-display)" }}>№ 03</span>
          <h2 style={{
            fontFamily: "var(--ff-serif)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "var(--ts-h2)",
            lineHeight: "var(--lh-display)",
            letterSpacing: "-0.02em",
            color: "var(--ink)",
          }}>The <span style={{ color: "var(--red)" }}>stack,</span> set in type.</h2>
        </div>
        <p style={{
          fontFamily: "var(--ff-serif)",
          fontStyle: "italic",
          fontSize: "var(--ts-h3)",
          lineHeight: "var(--lh-snug)",
          letterSpacing: "-0.02em",
          color: "var(--ink)",
        }}>
          Twelve tools. <span style={{ color: "var(--red)" }}>One app.</span> A few I&rsquo;d swap if I started over today. The rest earned their place.
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
            <span style={{ fontFamily: "var(--ff-serif)", fontSize: "var(--ts-sub)", letterSpacing: "-0.01em", color: "var(--ink)" }}>{item.name}</span>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "var(--ts-meta)", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.18em", flexShrink: 0 }}>{item.role}</span>
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
            fontSize: "var(--ts-stamp)",
            color: "var(--red)",
            letterSpacing: "-0.02em",
            lineHeight: "var(--lh-tight)",
          }}>Wanted</p>
          <div style={{ width: "60%", height: 1, background: "var(--ink)", margin: "14px auto 10px" }} />
          <p style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--ts-label)",
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            color: "var(--ink)",
            marginBottom: 10,
          }}>Full-Stack Roles</p>
          <p style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--ts-meta)",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "var(--ink-3)",
            lineHeight: 1.8,
          }}>Apply within<br />References on file</p>
        </div>
      </div>

      {/* Body */}
      <div>
        <h2 style={{
          fontFamily: "var(--ff-serif)",
          fontWeight: 400,
          fontSize: "var(--ts-stamp)",
          lineHeight: "var(--lh-tight)",
          letterSpacing: "-0.025em",
          marginBottom: 24,
          color: "var(--ink)",
        }}><em style={{ color: "var(--red)" }}>Hire</em> me.</h2>
        <p style={{
          fontFamily: "var(--ff-body)",
          fontSize: "var(--ts-lead)",
          color: "var(--ink-2)",
          lineHeight: "var(--lh-loose)",
          maxWidth: 520,
          marginBottom: 24,
        }}>
          Open to senior or staff full-stack roles. Remote first. Pullman is a short flight from Seattle, Portland, or Boise. I&rsquo;m happy to come to you for a few days a quarter. Small companies where one person owns a feature end-to-end are my favorite, but I&rsquo;ve shipped at big ones too.
        </p>

        {/* Contact lines */}
        <div style={{
          borderTop: "1px solid var(--ink)",
          paddingTop: 18,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          fontFamily: "var(--ff-mono)",
          fontSize: "var(--ts-label)",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: "var(--ink-2)",
          marginBottom: 24,
        }}>
          {[
            { label: "Email",  value: "hank@thestack.dev", href: "mailto:hank@thestack.dev" },
            { label: "Based",  value: "Pullman, WA · Remote or relocating", href: undefined },
            { label: "GitHub", value: "github.com/hankk", href: "https://github.com/hankk" },
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
        <h5 style={{ fontFamily: "var(--ff-serif)", fontStyle: "italic", fontSize: "var(--ts-sub)", marginBottom: 10, color: "var(--ink)" }}>Colophon</h5>
        <p style={{ fontFamily: "var(--ff-body)", fontSize: "var(--ts-body)", color: "var(--ink-2)", lineHeight: "var(--lh-body)" }}>
          Set in Instrument Serif for display and JetBrains Mono for the supporting copy. Printed on the web at 96 DPI.
        </p>
      </div>
      <div>
        <h5 style={{ fontFamily: "var(--ff-serif)", fontStyle: "italic", fontSize: "var(--ts-sub)", marginBottom: 10, color: "var(--ink)" }}>Departments</h5>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { label: "Architecture", href: "#dispatches" },
            { label: "Modules", href: "#modules" },
            { label: "The Stack", href: "#stack" },
            { label: "Want Ads", href: "#wanted" },
          ].map(item => (
            <a key={item.href} href={item.href} className="lp-colophon-link" style={{
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-label)",
              color: "var(--ink)",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              textDecoration: "none",
            }}>{item.label}</a>
          ))}
        </div>
      </div>
      <div>
        <h5 style={{ fontFamily: "var(--ff-serif)", fontStyle: "italic", fontSize: "var(--ts-sub)", marginBottom: 10, color: "var(--ink)" }}>Contact</h5>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { label: "hank@thestack.dev", href: "mailto:hank@thestack.dev" },
            { label: "github.com/hankk", href: "https://github.com/hankk" },
            { label: "linkedin.com/in/hankkarpinen", href: "https://linkedin.com/in/hankkarpinen" },
          ].map(item => (
            <a key={item.href} href={item.href} className="lp-colophon-link" style={{
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-label)",
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
      fontSize: "var(--ts-card-h)",
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
        @media (min-width: 1400px) {
          .landing-col { padding: 0 6% !important; }
          .dispatches-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .modules-grid { grid-template-columns: repeat(5, 1fr) !important; }
          .wanted-grid { grid-template-columns: 1fr 1fr !important; gap: 80px !important; }
        }
        @media (min-width: 1800px) {
          .landing-col { max-width: 1680px !important; padding: 0 4% !important; }
        }
      `}</style>
    </div>
  );
}
