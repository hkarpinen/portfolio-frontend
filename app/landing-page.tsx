import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getSession } from "@/lib/auth/session";

function Icon({ path, size = 16 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  arrowRight:   "M5 12h14M12 5l7 7-7 7",
  check:        "M20 6L9 17l-5-5",
  forum:        "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  bills:        "M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 0 0-2-2zm-1 7H9m6 4H9",
  portfolio:    "M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zm0 7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-7zM4 14a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z",
  settings:     "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.16-2.4.34-1.02a1 1 0 0 0-.54-1.2l-1.2-.48a5.1 5.1 0 0 0-.52-.86l.22-1.26a1 1 0 0 0-.64-1.1l-1.06-.36a1 1 0 0 0-1.12.38l-.7 1.06a5 5 0 0 0-1 0l-.7-1.06a1 1 0 0 0-1.12-.38l-1.06.36a1 1 0 0 0-.64 1.1l.22 1.26a5.1 5.1 0 0 0-.52.86l-1.2.48a1 1 0 0 0-.54 1.2l.34 1.02a1 1 0 0 0 .96.68h.06a5 5 0 0 0 .7 1.2l-.2 1.26a1 1 0 0 0 .64 1.1l1.06.36a1 1 0 0 0 1.12-.38l.7-1.06a5 5 0 0 0 1 0l.7 1.06a1 1 0 0 0 1.12.38l1.06-.36a1 1 0 0 0 .64-1.1l-.2-1.26a5 5 0 0 0 .7-1.2h.06a1 1 0 0 0 .96-.68z",
  star:         "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  users:        "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm14 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  zap:          "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  menu:         "M3 12h18M3 6h18M3 18h18",
  x:            "M18 6L6 18M6 6l12 12",
};

const FEATURES = [
  {
    icon: "portfolio" as const,
    title: "Portfolio Pages",
    description: "Personal profile with project showcase, skills, social links, and a contact form — designed to impress recruiters.",
    accent: "var(--success)",
    href: "/about",
    tags: ["Next.js 14", "TypeScript", "Tailwind CSS"],
  },
  {
    icon: "bills" as const,
    title: "Bills & Splits",
    description: "Shared household expense tracking with equal/custom splits, contribution history, income logging, and per-bill payment status.",
    accent: "var(--accent)",
    href: "/households",
    tags: ["ASP.NET Core", "PostgreSQL", "React Query"],
  },
  {
    icon: "forum" as const,
    title: "Community Forum",
    description: "Threaded discussions with communities, upvoting, nested comments, mod queue, mod log, and full community settings.",
    accent: "var(--accent-v)",
    href: "/communities",
    tags: ["SSE", "MassTransit", "JWT"],
  },
  {
    icon: "settings" as const,
    title: "Account & Auth",
    description: "Auth flows, 2FA toggle, session management, avatar upload, notification preferences — the full account settings surface.",
    accent: "var(--warning)",
    href: "/settings/profile",
    tags: ["JWT", "2FA / TOTP", "RBAC"],
  },
];

const ARCH_PILLARS = [
  {
    accent: "var(--accent)",
    icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
    title: "Microservices architecture",
    body: "Five independent services — Identity, Bills, Forum, Notifications, and the Next.js frontend — each with its own database and deployment boundary.",
    tags: ["ASP.NET Core", "Docker Compose", "Nginx"],
  },
  {
    accent: "var(--accent-v)",
    icon: "M22 12h-4l-3 9L9 3l-3 9H2",
    title: "Event-driven messaging",
    body: "Services communicate through domain events published to RabbitMQ via MassTransit. The Notifications service fans out real-time alerts over SSE.",
    tags: ["RabbitMQ", "MassTransit", "SSE"],
  },
  {
    accent: "var(--success)",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    title: "Auth & security",
    body: "JWT-based authentication with refresh token rotation, TOTP two-factor support, role-based access control, and per-community moderator permissions.",
    tags: ["JWT", "2FA / TOTP", "RBAC"],
  },
];

const STACK = [
  ".NET 8 / C#", "ASP.NET Core", "EF Core", "PostgreSQL",
  "RabbitMQ", "MassTransit", "Next.js 14", "TypeScript",
  "React Query", "Tailwind CSS", "Docker", "Nginx",
];

export async function LandingPage() {
  const session = await getSession();
  const displayName = session?.displayName ?? null;
  const avatarUrl = session?.avatarUrl ?? null;
  const initials = displayName
    ? displayName.split(/\s+/).map((p: string) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
    : null;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "oklch(from var(--bg) l c h / 0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 5%", height: "60px", display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, var(--accent), var(--accent-v))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "15px", color: "var(--text)" }}>Portfolio</span>
          </Link>

          <div style={{ flex: 1 }} />

          {/* Desktop nav */}
          <nav className="hidden md:flex" style={{ gap: "4px" }}>
            {[
              { label: "About",   href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map(item => (
              <Link key={item.href} href={item.href} className="lp-nav-link" style={{
                padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "500",
                color: "var(--text-2)", textDecoration: "none", transition: "background 110ms, color 110ms",
              }}>{item.label}</Link>
            ))}
          </nav>

          <div className="hidden md:flex" style={{ gap: "8px", alignItems: "center" }}>
            {displayName ? (
              <Link href="/settings/profile" className="lp-profile-link" style={{
                display: "flex", alignItems: "center", gap: "8px",
                textDecoration: "none", borderRadius: "10px", padding: "4px 10px 4px 4px",
                transition: "background 110ms",
              }}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" style={{ width: "28px", height: "28px", borderRadius: "9999px", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <span style={{
                    width: "28px", height: "28px", borderRadius: "9999px",
                    background: "var(--accent-subtle)", color: "var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: "700", flexShrink: 0,
                  }}>{initials ?? "?"}</span>
                )}
                <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)" }}>{displayName}</span>
              </Link>
            ) : (
              <>  
                <Link href="/contact" style={{
                  padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600",
                  color: "var(--text-2)", textDecoration: "none", border: "1px solid var(--border)",
                  transition: "background 110ms, border-color 110ms",
                }}>Contact</Link>
                <Link href="/about" className="lp-btn-accent" style={{
                  padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600",
                  color: "#fff", textDecoration: "none", background: "var(--accent)",
                  transition: "background 110ms",
                }}>View my work</Link>
              </>
            )}
          </div>

          <MobileNav displayName={displayName} avatarUrl={avatarUrl} initials={initials} />
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "clamp(48px, 8vw, 80px) 5% clamp(64px, 8vw, 100px)", minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {/* Dot grid */}
        <div className="dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none" }} />

        {/* Gradient mesh */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: "-20%", left: "-10%",
            width: "700px", height: "700px", borderRadius: "9999px",
            background: "radial-gradient(circle, oklch(63% 0.22 252 / 0.18) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "meshMove1 14s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: "-10%", right: "-5%",
            width: "600px", height: "600px", borderRadius: "9999px",
            background: "radial-gradient(circle, oklch(63% 0.22 292 / 0.14) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "meshMove2 18s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", top: "40%", right: "25%",
            width: "400px", height: "400px", borderRadius: "9999px",
            background: "radial-gradient(circle, oklch(63% 0.22 252 / 0.10) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "meshMove3 22s ease-in-out infinite",
          }} />
        </div>

        <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "5px 14px", borderRadius: "9999px",
            background: "var(--accent-subtle)", border: "1px solid var(--border)",
            fontSize: "12px", fontWeight: "500", color: "var(--accent)",
            marginBottom: "24px", fontFamily: "var(--ff-display)",
            backdropFilter: "blur(8px)",
            animation: "fadeUp 600ms var(--ease-spring) both", animationDelay: "50ms",
          }}>
            ✶ Portfolio project · Next.js + TypeScript + Tailwind
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "var(--ff-display)",
            fontWeight: "900",
            fontSize: "clamp(40px, 7vw, 80px)",
            lineHeight: "1.05",
            letterSpacing: "-0.03em",
            marginBottom: "24px",
            maxWidth: "900px",
            margin: "0 auto 24px",
            textAlign: "center",
            animation: "fadeUp 700ms var(--ease-spring) both", animationDelay: "80ms",
          }}>
            A full-stack portfolio,{" "}
            <span className="grad-text">built from scratch.</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: "17px",
            color: "var(--text-2)",
            maxWidth: "560px",
            margin: "0 auto 40px",
            lineHeight: "1.7",
            textAlign: "center",
            animation: "fadeUp 700ms var(--ease-spring) both", animationDelay: "160ms",
          }}>
            Identity, Bills, Forum, and Notifications — each a standalone microservice, each with its own repo. The frontend is a separate Next.js app that ties it all together.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 700ms var(--ease-spring) both", animationDelay: "240ms" }}>
            <Link href="/about" className="lp-btn-accent" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 28px", borderRadius: "var(--r-lg)",
              background: "var(--accent)", color: "#fff",
              fontSize: "15px", fontWeight: "600", textDecoration: "none",
              boxShadow: "var(--shadow-glow)",
              transition: "background 110ms, box-shadow 110ms",
            }}>
              View my work
              <Icon path={ICONS.arrowRight} size={16} />
            </Link>
            <Link href="/households" className="lp-btn-ghost" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 28px", borderRadius: "var(--r-lg)",
              background: "var(--surface-2)", color: "var(--text)",
              fontSize: "15px", fontWeight: "600", textDecoration: "none",
              border: "1px solid var(--border)",
              transition: "background 110ms",
            }}>
              <Icon path={ICONS.zap} size={16} />
              Explore the app
            </Link>
          </div>

          {/* Stats */}
          <div
            className="lp-stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, auto)",
              gap: "40px",
              justifyContent: "center",
              marginTop: "56px",
              animation: "fadeIn 700ms both", animationDelay: "400ms",
            }}
          >
            {[
              { value: "4",    label: "Modules built" },
              { value: "30+",  label: "Screens designed" },
              { value: "100%", label: "TypeScript" },
              { value: "A11y", label: "WCAG compliant" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--ff-display)", fontWeight: "800",
                  fontSize: "26px", lineHeight: "1", color: "var(--text)",
                  letterSpacing: "-0.025em",
                }}>{stat.value}</div>
                <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* App Preview Card — hidden on very small screens */}
          <div className="lp-preview-card" style={{
            maxWidth: "960px", width: "100%", margin: "72px auto 0",
            border: "1px solid var(--border)", borderRadius: "var(--r-xl)",
            background: "var(--surface)", overflow: "hidden",
            boxShadow: "0 32px 80px oklch(0% 0 0 / 0.5), 0 0 0 1px var(--border)",
            animation: "fadeUp 900ms var(--ease-spring) both", animationDelay: "300ms",
          }}>
            {/* Window chrome */}
            <div style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--border)", padding: "12px 16px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ display: "flex", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "9999px", background: "#ef4444" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "9999px", background: "#f59e0b" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "9999px", background: "#22c55e" }} />
              </div>
              <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "9999px", padding: "4px 16px", fontSize: "11px", color: "var(--text-3)" }}>
                  app.portfolio.dev
                </div>
              </div>
              <div style={{ width: "80px" }} />
            </div>
            {/* Preview interior */}
            <div style={{ height: "420px", display: "flex", overflow: "hidden" }}>
              {/* Mini sidebar */}
              <div style={{ width: "52px", flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)", padding: "12px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} style={{ width: "32px", height: "32px", borderRadius: "8px", background: i === 2 ? "var(--accent-subtle)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "16px", height: "2px", borderRadius: "2px", background: i === 2 ? "var(--accent)" : "var(--border)", opacity: i === 2 ? 1 : 0.6 }} />
                  </div>
                ))}
              </div>
              {/* Main area */}
              <div style={{ flex: 1, background: "var(--bg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflow: "hidden" }}>
                {/* Stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  {[{ label: "Balance", value: "$1,240" }, { label: "Bills due", value: "3" }, { label: "Households", value: "2" }].map(card => (
                    <div key={card.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px 14px" }}>
                      <div style={{ fontSize: "10px", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{card.label}</div>
                      <div style={{ fontFamily: "var(--ff-display)", fontWeight: 800, fontSize: "18px", color: "var(--text)", marginTop: "4px" }}>{card.value}</div>
                    </div>
                  ))}
                </div>
                {/* Household rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[{ name: "Main Apartment", amount: "$480 / mo" }, { name: "Beach House", amount: "$240 / mo" }].map(h => (
                    <div key={h.name} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>{h.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-3)" }}>2 members</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>{h.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 5%", background: "var(--bg-2)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{
              fontSize: "11px", fontWeight: "700", color: "var(--accent)",
              textTransform: "uppercase", letterSpacing: "0.1em",
              fontFamily: "var(--ff-display)", marginBottom: "12px",
            }}>Features</p>
            <h2 style={{
              fontFamily: "var(--ff-display)", fontWeight: "800",
              fontSize: "clamp(28px, 4vw, 42px)", letterSpacing: "-0.025em",
              color: "var(--text)", marginBottom: "16px",
            }}>
              Microservices, done properly.
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-2)", maxWidth: "500px", margin: "0 auto", lineHeight: "1.7" }}>
              Each service owns its domain — its own repo, schema, and API surface. The Next.js frontend consumes them as independent services.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}>
            {FEATURES.map(feature => (
              <Link
                key={feature.title}
                href={feature.href}
                className="lp-feature-card"
                style={{
                  display: "block",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "var(--shadow-sm)",
                  transition: "transform 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms, border-color 110ms",
                  textDecoration: "none",
                }}
              >
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: `oklch(from ${feature.accent} l c h / 0.12)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: feature.accent, marginBottom: "16px",
                }}>
                  <Icon path={ICONS[feature.icon]} size={20} />
                </div>
                <h3 style={{
                  fontFamily: "var(--ff-display)", fontWeight: "700",
                  fontSize: "16px", color: "var(--text)", marginBottom: "8px",
                }}>{feature.title}</h3>
                <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: "1.6", marginBottom: "16px" }}>
                  {feature.description}
                </p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {feature.tags.map(tag => (
                    <span key={tag} style={{
                      padding: "2px 8px", borderRadius: "9999px",
                      background: `oklch(from ${feature.accent} l c h / 0.1)`,
                      color: feature.accent,
                      fontSize: "11px", fontWeight: "500",
                      border: `1px solid oklch(from ${feature.accent} l c h / 0.25)`,
                    }}>{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture ───────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 5%", background: "var(--bg)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{
              fontSize: "11px", fontWeight: "700", color: "var(--accent)",
              textTransform: "uppercase", letterSpacing: "0.1em",
              fontFamily: "var(--ff-display)", marginBottom: "12px",
            }}>Under the hood</p>
            <h2 style={{
              fontFamily: "var(--ff-display)", fontWeight: "800",
              fontSize: "clamp(28px, 4vw, 42px)", letterSpacing: "-0.025em",
              color: "var(--text)", marginBottom: "16px",
            }}>
              Built with real complexity.
            </h2>
            <p style={{ fontSize: "15px", color: "var(--text-2)", maxWidth: "520px", margin: "0 auto", lineHeight: "1.6" }}>
              Not a tutorial project. Five independent services, event-driven messaging, and production-grade auth.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "48px",
          }}>
            {ARCH_PILLARS.map(pillar => (
              <div key={pillar.title} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "var(--shadow-sm)",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: `oklch(from ${pillar.accent} l c h / 0.12)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: pillar.accent, marginBottom: "16px",
                }}>
                  <Icon path={pillar.icon} size={20} />
                </div>
                <h3 style={{
                  fontFamily: "var(--ff-display)", fontWeight: "700",
                  fontSize: "15px", color: "var(--text)", marginBottom: "8px",
                }}>{pillar.title}</h3>
                <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: "1.6", marginBottom: "16px" }}>
                  {pillar.body}
                </p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {pillar.tags.map(tag => (
                    <span key={tag} style={{
                      padding: "2px 8px", borderRadius: "9999px",
                      background: `oklch(from ${pillar.accent} l c h / 0.1)`,
                      color: pillar.accent,
                      fontSize: "11px", fontWeight: "500",
                      border: `1px solid oklch(from ${pillar.accent} l c h / 0.25)`,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Full stack pill list */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", fontFamily: "var(--ff-display)" }}>Full stack</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
              {STACK.map(s => (
                <span key={s} style={{
                  padding: "5px 12px", borderRadius: "9999px",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  fontSize: "12px", fontWeight: "500", color: "var(--text-2)",
                }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 5%", background: "var(--bg-2)", position: "relative", overflow: "hidden" }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.3, pointerEvents: "none" }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "600px", height: "300px", borderRadius: "9999px",
          background: "var(--accent-subtle)", filter: "blur(80px)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
          {/* Icon */}
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "64px", height: "64px", borderRadius: "20px",
            background: "linear-gradient(135deg, var(--accent), var(--accent-v))",
            boxShadow: "var(--shadow-glow)",
            marginBottom: "24px",
          }}>
            <Icon path={ICONS.zap} size={28} />
          </div>
          <h2 style={{
            fontFamily: "var(--ff-display)", fontWeight: "800",
            fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.025em",
            color: "var(--text)", marginBottom: "16px",
          }}>
            Let&apos;s work <span className="grad-text">together.</span>
          </h2>
          <p style={{
            fontSize: "16px", color: "var(--text-2)", lineHeight: "1.7", marginBottom: "36px",
          }}>
            I&apos;m currently open to full-stack engineering roles. Check out my work or get in touch directly.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="lp-btn-accent" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 32px", borderRadius: "var(--r-lg)",
              background: "var(--accent)", color: "#fff",
              fontSize: "15px", fontWeight: "600", textDecoration: "none",
              boxShadow: "var(--shadow-glow)", transition: "background 110ms",
            }}>
              Get in touch
              <Icon path={ICONS.arrowRight} size={16} />
            </Link>
            <Link href="/about" className="lp-cta-outline" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 28px", borderRadius: "var(--r-lg)",
              color: "var(--accent)", fontSize: "15px", fontWeight: "600",
              textDecoration: "none", border: "1px solid var(--accent)",
              background: "var(--accent-subtle)", transition: "background 110ms",
            }}>
              <Icon path={ICONS.portfolio} size={16} />
              My portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        padding: "36px 5%",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          {/* Left: logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: "linear-gradient(135deg, var(--accent), var(--accent-v))" }} />
            <span style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "13px", color: "var(--text)" }}>Portfolio</span>
          </Link>
          {/* Centre: links */}
          <nav style={{ display: "flex", gap: "20px" }}>
            {["Privacy", "Terms", "Docs"].map(label => (
              <span key={label} className="lp-footer-link" style={{ fontSize: "12px", color: "var(--text-3)", cursor: "pointer", transition: "color 110ms" }}>{label}</span>
            ))}
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="lp-footer-link" style={{ fontSize: "12px", color: "var(--text-3)", cursor: "pointer", textDecoration: "none", transition: "color 110ms" }}>GitHub</a>
          </nav>
          {/* Right: copyright */}
          <p style={{ fontSize: "12px", color: "var(--text-3)" }}>
            © 2026 Hank P. Built with Next.js + Tailwind.
          </p>
        </div>
      </footer>

      <style>{`
        .lp-nav-link:hover    { background: var(--surface-3) !important; color: var(--text) !important; }
        .lp-profile-link:hover { background: var(--surface-2) !important; }
        .lp-btn-accent:hover  { background: var(--accent-hi) !important; }
        .lp-btn-ghost:hover   { background: var(--surface-3) !important; }
        .lp-cta-outline:hover { background: var(--accent-subtle) !important; }
        .lp-footer-link:hover { color: var(--text) !important; }
        .lp-feature-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md) !important;
          border-color: var(--accent) !important;
        }
        @media (max-width: 599px) {
          .lp-preview-card { display: none !important; }
        }
        .lp-stats-grid {
          grid-template-columns: 1fr 1fr !important;
          gap: 16px 24px !important;
        }
        @media (min-width: 768px) {
          .lp-stats-grid {
            grid-template-columns: repeat(4, auto) !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}
