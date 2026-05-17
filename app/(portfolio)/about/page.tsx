import type { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
  title: "About",
};

const PROJECTS = [
  {
    icon: "🏠",
    title: "Household",
    description: "Household management service. Create shared households, assign chores, manage a shared calendar, and track who's contributing what. Built on the Household microservice (ASP.NET Core, EF Core).",
    tech: ["ASP.NET Core", "C#", "EF Core", "PostgreSQL", "MassTransit", "React Query", "Docker"],
    href: "/bills",
  },
  {
    icon: "💰",
    title: "Finance",
    description: "Personal finance engine backed by its own microservice. Log expenses, split costs across household members, track income sources, and connect bank accounts via the Finance API.",
    tech: ["ASP.NET Core", "C#", "EF Core", "PostgreSQL", "RabbitMQ", "MassTransit", "React Query", "Docker"],
    href: "/expenses",
  },
  {
    icon: "💬",
    title: "Community Forum",
    description: "A Reddit-inspired forum platform with communities, threaded comments, voting, and moderation tools.",
    tech: ["ASP.NET Core", "C#", "EF Core", "PostgreSQL", "SSE", "JWT", "MassTransit", "React Query"],
    href: "/forum",
  },
  {
    icon: "🎨",
    title: "Portfolio Platform",
    description: "This very application — a unified frontend combining portfolio showcase, community forum, household management, and personal finance across six independent microservices.",
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
  { value: "4", label: "Full-stack modules" },
  { value: "10+", label: "Technologies used" },
  { value: "100%", label: "TypeScript coverage" },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-12">
      {/* Hero banner */}
      <div className="py-20 px-16 bg-paper-2 shadow-card" style={{ border: "1.5px solid var(--ink)" }}>
        <div className="flex items-center gap-12 flex-wrap">
          {/* Avatar — square stamp */}
          <div className="w-40 h-40 bg-paper-3 flex items-center justify-center text-xl font-bold text-ink font-mono shrink-0" style={{ border: "2px solid var(--ink)" }}>
            HK
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="font-serif italic font-normal text-3xl tracking-[-0.025em] text-ink mb-2">
              Hank Karpinen<span className="text-red">.</span>
            </h1>
            <p className="font-mono text-sm text-ink-3 uppercase tracking-wide mb-8">
              Full-Stack Developer · Building modern web applications
            </p>

            {/* Action buttons */}
            <div className="flex gap-4 flex-wrap">
              <Link href="/contact" className="inline-flex items-center gap-3 py-[9px] px-[16px] bg-ink text-paper text-sm font-mono uppercase tracking-wider no-underline" style={{ letterSpacing: "0.18em" }}>
                Contact me
              </Link>
              {[
                { label: "CV", href: "/cv.pdf" },
                { label: "GitHub", href: "https://github.com/hkarpinen" },
                { label: "LinkedIn", href: "https://www.linkedin.com/in/hank-karpinen/" },
              ].map(btn => (
                <a key={btn.label} href={btn.href} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center py-[9px] px-[16px] bg-transparent text-ink text-sm font-mono uppercase tracking-wider no-underline" style={{ border: "1.5px solid var(--ink)", letterSpacing: "0.18em" }}
                >
                  {btn.label}
                </a>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-12 flex-wrap">
            {FACTS.map(f => (
              <div key={f.label} className="text-center">
                <div className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink leading-none">{f.value}</div>
                <div className="text-sm text-ink-3 mt-2">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column content grid */}
      <div className="grid gap-12 grid-cols-[1fr_280px] max-md:grid-cols-1">
        {/* Projects */}
        <div className="flex flex-col gap-8">
          <h2 className="font-serif font-bold text-lg text-ink tracking-[-0.015em]">
            Projects
          </h2>

          {PROJECTS.map(project => (
            <Link
              key={project.title}
              href={project.href}
              className="block bg-paper-2 p-10 no-underline" style={{ border: "1.5px solid var(--ink)" }}
            >
              <div className="flex items-start gap-[14px]">
                <span className="text-2xl shrink-0">{project.icon}</span>
                <div>
                  <h3 className="font-serif font-bold text-md text-ink mb-3">{project.title}</h3>
                  <p className="text-base text-ink-2 leading-[1.6] mb-6">
                    {project.description}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {project.tech.map(t => (
                      <span key={t} className="inline-block py-[2px] px-[8px] bg-[rgba(178,42,26,0.10)] text-red font-mono" style={{ fontSize: "0.594rem", letterSpacing: "0.12em", border: "1px solid rgba(178,42,26,0.3)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Sidebar: skills + facts */}
        <div className="flex flex-col gap-8">
          {/* Skills card */}
          <div className="bg-paper p-10 shadow-card" style={{ border: "1.5px solid var(--ink)" }}>
            <h2 className="font-serif font-bold text-md text-ink mb-8">
              Skills
            </h2>
            <div className="flex flex-col gap-8">
              {SKILLS.map(group => (
                <div key={group.label}>
                  <p className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em] mb-4">{group.label}</p>
                  <div className="flex flex-wrap gap-3">
                    {group.items.map(skill => (
                      <span key={skill} className="py-[2px] px-[8px] bg-paper-3 text-ink-2 font-mono" style={{ fontSize: "0.594rem", letterSpacing: "0.12em", border: "1px solid var(--ink-4)" }}>{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick facts */}
          <div className="bg-paper p-10 shadow-card" style={{ border: "1.5px solid var(--ink)" }}>
            <h2 className="font-serif font-bold text-md text-ink mb-6">
              Quick Facts
            </h2>
            <div className="flex flex-col gap-5">
              {[
                { label: "Location", value: "Finland" },
                { label: "Available", value: "Open to opportunities" },
                { label: "Focus", value: "Full-stack web" },
              ].map(fact => (
                <div key={fact.label} className="flex justify-between items-center py-4 px-5 bg-paper-2">
                  <span className="text-base text-ink-3">{fact.label}</span>
                  <span className="text-base font-medium text-ink">{fact.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
