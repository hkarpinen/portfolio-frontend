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
  star:         "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  users:        "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm14 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  menu:         "M3 12h18M3 6h18M3 18h18",
  x:            "M18 6L6 18M6 6l12 12",
};

const FEATURES = [
  {
    icon: "portfolio" as const,
    title: "Portfolio Showcase",
    description: "Display your projects, skills, and achievements in a beautiful, customizable portfolio. Share your work with the world.",
    accent: "var(--accent)",
  },
  {
    icon: "bills" as const,
    title: "Bill Splitting",
    description: "Manage shared household expenses effortlessly. Track who owes what, split bills fairly, and keep everyone in sync.",
    accent: "var(--accent-v)",
  },
  {
    icon: "forum" as const,
    title: "Community Forum",
    description: "Connect with others in topic-based communities. Start discussions, share knowledge, and build connections.",
    accent: "var(--success)",
  },
  {
    icon: "users" as const,
    title: "Team Collaboration",
    description: "Built for teams and households. Invite members, assign roles, and collaborate seamlessly across all modules.",
    accent: "var(--warning)",
  },
];

const TESTIMONIALS = [
  {
    name: "Alex Chen",
    role: "Frontend Developer",
    body: "The portfolio module helped me land my dream job. The design is clean and the projects section really showcases my work beautifully.",
    initials: "AC",
    color: "var(--accent)",
  },
  {
    name: "Sarah Müller",
    role: "Product Manager",
    body: "We use the bills module for our shared apartment. It's made splitting expenses so much less stressful. Everything is transparent.",
    initials: "SM",
    color: "var(--accent-v)",
  },
  {
    name: "Marcus Johnson",
    role: "Community Manager",
    body: "The forum module has the cleanest UI I've seen. Our community loves it — engagement went up 3x since we switched over.",
    initials: "MJ",
    color: "var(--success)",
  },
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
        background: "oklch(from var(--surface) l c h / 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "15px", color: "var(--text)" }}>Portfolio</span>
          </Link>

          <div style={{ flex: 1 }} />

          {/* Desktop nav */}
          <nav className="hidden md:flex" style={{ gap: "4px" }}>
            {[
              { label: "About", href: "/about" },
              { label: "Forum", href: "/communities" },
              { label: "Bills", href: "/households" },
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
                <Link href="/login" style={{
                  padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600",
                  color: "var(--text-2)", textDecoration: "none", border: "1px solid var(--border)",
                  transition: "background 110ms, border-color 110ms",
                }}>Sign in</Link>
                <Link href="/register" className="lp-btn-accent" style={{
                  padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600",
                  color: "#fff", textDecoration: "none", background: "var(--accent)",
                  transition: "background 110ms",
                }}>Get started</Link>
              </>
            )}
          </div>

          <MobileNav displayName={displayName} avatarUrl={avatarUrl} initials={initials} />
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "80px 32px 96px" }}>
        {/* Dot grid */}
        <div className="dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none" }} />

        {/* Gradient mesh */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: "-15%", left: "20%",
            width: "700px", height: "700px", borderRadius: "9999px",
            background: "var(--accent-subtle)", filter: "blur(120px)",
            animation: "meshMove 18s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: "-10%", right: "10%",
            width: "500px", height: "500px", borderRadius: "9999px",
            background: "var(--accent-v-subtle)", filter: "blur(100px)",
            animation: "meshMove 22s ease-in-out infinite reverse",
          }} />
        </div>

        <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "4px 12px", borderRadius: "9999px",
            background: "var(--accent-subtle)", border: "1px solid oklch(63% 0.22 252 / 0.3)",
            fontSize: "12px", fontWeight: "500", color: "var(--accent)",
            marginBottom: "24px", fontFamily: "var(--ff-display)",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "9999px", background: "var(--accent)" }} />
            Full-stack portfolio platform
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "var(--ff-display)",
            fontWeight: "900",
            fontSize: "clamp(40px, 7vw, 72px)",
            lineHeight: "1.05",
            letterSpacing: "-0.03em",
            marginBottom: "24px",
            maxWidth: "900px",
            margin: "0 auto 24px",
          }}>
            Everything you need,{" "}
            <span className="grad-text">all in one place</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: "18px",
            color: "var(--text-2)",
            maxWidth: "560px",
            margin: "0 auto 40px",
            lineHeight: "1.6",
          }}>
            Showcase your work, manage shared expenses, and build communities — a unified platform built for modern living.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="lp-btn-accent" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 28px", borderRadius: "12px",
              background: "var(--accent)", color: "#fff",
              fontSize: "15px", fontWeight: "600", textDecoration: "none",
              boxShadow: "var(--shadow-glow)",
              transition: "background 110ms, box-shadow 110ms",
            }}>
              Get started free
              <Icon path={ICONS.arrowRight} size={16} />
            </Link>
            <Link href="/about" className="lp-btn-ghost" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 28px", borderRadius: "12px",
              background: "var(--surface-2)", color: "var(--text)",
              fontSize: "15px", fontWeight: "600", textDecoration: "none",
              border: "1px solid var(--border)",
              transition: "background 110ms",
            }}>
              View portfolio
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: "48px", justifyContent: "center",
            marginTop: "64px", flexWrap: "wrap",
          }}>
            {[
              { value: "3", label: "Integrated modules" },
              { value: "∞", label: "Community threads" },
              { value: "100%", label: "Open source" },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--ff-display)", fontWeight: "800",
                  fontSize: "36px", lineHeight: "1", color: "var(--text)",
                  letterSpacing: "-0.025em",
                }}>{stat.value}</div>
                <div style={{ fontSize: "13px", color: "var(--text-3)", marginTop: "4px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 32px", background: "var(--bg-2)" }}>
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
              color: "var(--text)",
            }}>
              One platform, three powerful modules
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}>
            {FEATURES.map(feature => (
              <div
                key={feature.title}
                className="lp-feature-card"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "var(--shadow-sm)",
                  transition: "transform 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms, border-color 110ms",
                  cursor: "default",
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
                <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: "1.6" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 32px", background: "var(--bg)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{
              fontSize: "11px", fontWeight: "700", color: "var(--accent)",
              textTransform: "uppercase", letterSpacing: "0.1em",
              fontFamily: "var(--ff-display)", marginBottom: "12px",
            }}>Testimonials</p>
            <h2 style={{
              fontFamily: "var(--ff-display)", fontWeight: "800",
              fontSize: "clamp(28px, 4vw, 42px)", letterSpacing: "-0.025em",
              color: "var(--text)",
            }}>
              Loved by users
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "var(--shadow-sm)",
              }}>
                {/* Stars */}
                <div style={{ display: "flex", gap: "3px", marginBottom: "16px" }}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--warning)" stroke="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p style={{
                  fontSize: "14px", color: "var(--text-2)", lineHeight: "1.6",
                  marginBottom: "20px",
                }}>
                  &ldquo;{t.body}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    width: "36px", height: "36px", borderRadius: "9999px",
                    background: `oklch(from ${t.color} l c h / 0.15)`,
                    color: t.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: "700", fontFamily: "var(--ff-display)",
                    flexShrink: 0,
                  }}>{t.initials}</span>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)" }}>{t.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-3)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 32px", background: "var(--bg-2)", position: "relative", overflow: "hidden" }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.3, pointerEvents: "none" }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "600px", height: "300px", borderRadius: "9999px",
          background: "var(--accent-subtle)", filter: "blur(80px)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontFamily: "var(--ff-display)", fontWeight: "800",
            fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.025em",
            color: "var(--text)", marginBottom: "16px",
          }}>
            Ready to get started?
          </h2>
          <p style={{
            fontSize: "16px", color: "var(--text-2)", lineHeight: "1.6", marginBottom: "36px",
          }}>
            Join today and explore all three modules — portfolio, bills, and forum — completely free.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="lp-btn-accent" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 32px", borderRadius: "12px",
              background: "var(--accent)", color: "#fff",
              fontSize: "15px", fontWeight: "600", textDecoration: "none",
              boxShadow: "var(--shadow-glow)",
              transition: "background 110ms",
            }}>
              Create free account
              <Icon path={ICONS.arrowRight} size={16} />
            </Link>
            <Link href="/about" className="lp-cta-outline" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 28px", borderRadius: "12px",
              color: "var(--accent)", fontSize: "15px", fontWeight: "600",
              textDecoration: "none", border: "1px solid var(--accent)",
              background: "var(--accent-subtle)", transition: "background 110ms",
            }}>
              View portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        padding: "40px 32px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "6px",
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-v) 100%)",
            }} />
            <span style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "14px", color: "var(--text)" }}>Portfolio</span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
            © 2026 Portfolio. All rights reserved.
          </p>
          <nav style={{ display: "flex", gap: "16px" }}>
            {[
              { label: "About", href: "/about" },
              { label: "Forum", href: "/communities" },
              { label: "Bills", href: "/households" },
            ].map(item => (
              <Link key={item.href} href={item.href} className="lp-footer-link" style={{ fontSize: "13px", color: "var(--text-3)", textDecoration: "none", transition: "color 110ms" }}>{item.label}</Link>
            ))}
          </nav>
        </div>
      </footer>

      <style>{`
        .lp-nav-link:hover    { background: var(--surface-3) !important; color: var(--text) !important; }
        .lp-profile-link:hover { background: var(--surface-2) !important; }
        .lp-btn-accent:hover  { background: var(--accent-hi) !important; }
        .lp-btn-ghost:hover   { background: var(--surface-3) !important; }
        .lp-cta-outline:hover { background: oklch(63% 0.22 252 / 0.18) !important; }
        .lp-footer-link:hover { color: var(--text) !important; }
        .lp-feature-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md) !important;
          border-color: var(--border-2) !important;
        }
      `}</style>
    </div>
  );
}
