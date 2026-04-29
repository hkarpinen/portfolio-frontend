import type { Metadata } from "next";
import Link from "next/link";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About",
};

const PROJECTS = [
  {
    icon: "📋",
    title: "Bills Splitter",
    description: "A full-stack household expense management app. Track shared bills, split costs fairly, and visualize contributions over time.",
    tech: ["ASP.NET Core", "C#", "EF Core", "PostgreSQL", "RabbitMQ", "MassTransit", "React Query", "Docker"],
    href: "/households",
  },
  {
    icon: "💬",
    title: "Community Forum",
    description: "A Reddit-inspired forum platform with communities, threaded comments, voting, and moderation tools.",
    tech: ["ASP.NET Core", "C#", "EF Core", "PostgreSQL", "SSE", "JWT", "MassTransit", "React Query"],
    href: "/communities",
  },
  {
    icon: "🎨",
    title: "Portfolio Platform",
    description: "This very application — a unified platform combining portfolio showcase, community forum, and bill management.",
    tech: ["Next.js 14", "TypeScript", "Tailwind CSS", "Nginx", "Docker Compose"],
    href: "/about",
  },
];

const SKILLS = [
  { label: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS"] },
  { label: "Backend", items: [".NET / C#", "REST APIs", "SignalR", "Docker"] },
  { label: "Data", items: ["PostgreSQL", "Entity Framework", "Redis"] },
];

const FACTS = [
  { value: "3", label: "Full-stack modules" },
  { value: "10+", label: "Technologies used" },
  { value: "100%", label: "TypeScript coverage" },
];

export default function AboutPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Hero banner */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "24px",
        padding: "40px 32px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none" }} />
        <div style={{
          position: "absolute", top: "-30%", right: "-5%",
          width: "400px", height: "400px", borderRadius: "9999px",
          background: "var(--accent-subtle)", filter: "blur(80px)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "9999px",
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-v) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "28px", fontWeight: "800", color: "#fff",
            fontFamily: "var(--ff-display)", flexShrink: 0,
            border: "3px solid var(--surface)",
            boxShadow: "var(--shadow-md)",
          }}>
            HK
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: "var(--ff-display)", fontWeight: "800",
              fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)",
              marginBottom: "4px",
            }}>
              Hank Karpinen
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-2)", marginBottom: "16px" }}>
              Full-Stack Developer · Building modern web applications
            </p>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Link href="/contact" className={styles.btnAccent} style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "7px 16px", borderRadius: "10px",
                background: "var(--accent)", color: "#fff",
                fontSize: "13px", fontWeight: "600", textDecoration: "none",
                transition: "background 110ms",
              }}>
                Contact me
              </Link>
              {[
                { label: "CV", href: "/cv.pdf" },
                { label: "GitHub", href: "https://github.com/hkarpinen" },
                { label: "LinkedIn", href: "https://www.linkedin.com/in/hank-karpinen/" },
              ].map(btn => (
                <a key={btn.label} href={btn.href} target="_blank" rel="noopener noreferrer"
                  className={styles.btnSecondary}
                  style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "7px 16px", borderRadius: "10px",
                    background: "var(--surface-2)", color: "var(--text-2)",
                    border: "1px solid var(--border)",
                    fontSize: "13px", fontWeight: "500", textDecoration: "none",
                    transition: "background 110ms, color 110ms",
                  }}
                >
                  {btn.label}
                </a>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {FACTS.map(f => (
              <div key={f.label} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--ff-display)", fontWeight: "800",
                  fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)",
                  lineHeight: "1",
                }}>{f.value}</div>
                <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "4px" }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column content grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: "24px",
      }} className={styles.portfolioGrid}>
        {/* Projects */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2 style={{
            fontFamily: "var(--ff-display)", fontWeight: "700",
            fontSize: "18px", color: "var(--text)", letterSpacing: "-0.015em",
          }}>
            Projects
          </h2>

          {PROJECTS.map(project => (
            <Link
              key={project.title}
              href={project.href}
              className={styles.projectCard}
              style={{
                display: "block",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "var(--shadow-sm)",
                textDecoration: "none",
                transition: "transform 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms, border-color 110ms",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <span style={{ fontSize: "28px", flexShrink: 0 }}>{project.icon}</span>
                <div>
                  <h3 style={{
                    fontFamily: "var(--ff-display)", fontWeight: "700",
                    fontSize: "15px", color: "var(--text)", marginBottom: "6px",
                  }}>{project.title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: "1.6", marginBottom: "12px" }}>
                    {project.description}
                  </p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {project.tech.map(t => (
                      <span key={t} style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        background: "var(--accent-subtle)",
                        color: "var(--accent)",
                        fontSize: "11px",
                        fontWeight: "500",
                        border: "1px solid oklch(63% 0.22 252 / 0.25)",
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Sidebar: skills + facts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Skills card */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)",
          }}>
            <h2 style={{
              fontFamily: "var(--ff-display)", fontWeight: "700",
              fontSize: "15px", color: "var(--text)", marginBottom: "16px",
            }}>
              Skills
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {SKILLS.map(group => (
                <div key={group.label}>
                  <p style={{
                    fontSize: "10px", fontWeight: "700", color: "var(--text-3)",
                    textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px",
                  }}>{group.label}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {group.items.map(skill => (
                      <span key={skill} style={{
                        padding: "3px 9px",
                        borderRadius: "9999px",
                        background: "var(--surface-3)",
                        color: "var(--text-2)",
                        fontSize: "12px",
                        fontWeight: "500",
                        border: "1px solid var(--border)",
                      }}>{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick facts */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)",
          }}>
            <h2 style={{
              fontFamily: "var(--ff-display)", fontWeight: "700",
              fontSize: "15px", color: "var(--text)", marginBottom: "12px",
            }}>
              Quick Facts
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Location", value: "Finland" },
                { label: "Available", value: "Open to opportunities" },
                { label: "Focus", value: "Full-stack web" },
              ].map(fact => (
                <div key={fact.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 10px", borderRadius: "8px", background: "var(--surface-2)",
                }}>
                  <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{fact.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text)" }}>{fact.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
