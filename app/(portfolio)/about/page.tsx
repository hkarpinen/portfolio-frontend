import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Btn, Icon } from "@/components/editorial";
import { SKILLS } from "@/app/_landing/landing-config";

/**
 * /about — Overview page.
 *
 * Mirrors the Terminus prototype PAGES['/about']: a `.profile-hero`
 * (cover + headshot + identity row), a `.facts` strip, a `.grid-3`
 * PROJECTS section, and the `.skills-grid`. Public, server-rendered
 * inside the (portfolio) AppShell.
 */
export const metadata: Metadata = {
  title: "Hank Karpinen — Overview",
  description:
    "Hank Karpinen — full-stack engineer in Pullman, WA. Modernizing legacy systems into scalable .NET and cloud architectures with AI-assisted tooling; QA roots, full-stack across TypeScript/React and Python. AWS Certified Solutions Architect.",
  alternates: { canonical: "/about" },
};

const CERTS = [
  "AWS Certified Solutions Architect — Associate",
  "AWS Certified Cloud Practitioner",
  "Certified ScrumMaster",
];

const EXPERIENCE: { role: string; org: string; dates: string; where: string; desc: string }[] = [
  {
    role: "Enterprise Developer II",
    org: "University of Idaho",
    dates: "Jun 2025 — Present",
    where: "Moscow, ID",
    desc: "Modernizing legacy .NET WebForms apps into .NET 10 Razor Pages + API architectures. Built a custom AI-driven tooling workflow that pulls domain-driven components out of existing codebases and generates modern patterns for redevelopment. Sprint steward; engineering point of contact for a Databricks Lakehouse data modernization.",
  },
  {
    role: "Software Engineer",
    org: "The College of Idaho",
    dates: "Feb 2024 — Jun 2025",
    where: "Caldwell, ID",
    desc: "Consolidated 10+ disconnected legacy systems into a single containerized full-stack app with role-based access. Built a Drupal 11 platform end-to-end and stood up CI/CD pipelines across multiple environments.",
  },
  {
    role: "Software Engineer in Test (SDET)",
    org: "Scentsy",
    dates: "Dec 2022 — Feb 2024",
    where: "Meridian, ID",
    desc: "Automated and manual test suites for front-end and API features, plus complex SQL test-data generation for edge cases. Supported the migration from a monolith to a distributed microservices architecture.",
  },
  {
    role: "Software Tester",
    org: "QualityLogic",
    dates: "Aug 2020 — Sep 2021",
    where: "Boise, ID",
    desc: "Scenario-based manual and automated testing with TestRail and Selenium; detailed defect reports and repro steps, working inside agile sprint teams.",
  },
];

const FACTS: [string, string, string][] = [
  ["4+ yrs", "experience", ""],
  ["7", "services", ""],
  ["AWS", "certified", ""],
  ["OPEN", "to roles", "green"],
];

// The nine portfolio-* services that make up this app — pulled from
// github.com/hkarpinen. Backend services have no standalone UI, so only the
// frontend carries a "Live" link.
const PROJECTS: {
  name: string;
  desc: string;
  tags: string[];
  github: string;
  live?: string;
}[] = [
  {
    name: "portfolio-frontend",
    desc: "This app. The Next.js 15 App Router UI in front of every service.",
    tags: ["TypeScript", "Next.js", "React Query", "Tailwind"],
    github: "https://github.com/hkarpinen/portfolio-frontend",
    live: "/",
  },
  {
    name: "portfolio-identity",
    desc: "Auth & identity: registration, JWT login, TOTP 2FA, email confirmation, profiles, admin.",
    tags: ["C#", ".NET 8", "JWT", "TOTP 2FA"],
    github: "https://github.com/hkarpinen/portfolio-identity",
  },
  {
    name: "portfolio-household",
    desc: "Households coordinate shared life: chore rotations, a shared calendar, and member roles.",
    tags: ["C#", "EF Core", "Postgres", "RabbitMQ"],
    github: "https://github.com/hkarpinen/portfolio-household",
  },
  {
    name: "portfolio-finance",
    desc: "Household expense splitting — bills split by membership, plus income tracking for coverage.",
    tags: ["C#", "EF Core", "Postgres"],
    github: "https://github.com/hkarpinen/portfolio-finance",
  },
  {
    name: "portfolio-forum",
    desc: "Reddit-style communities: threads, comments, votes, and moderator membership & bans.",
    tags: ["C#", "RabbitMQ", "SSE"],
    github: "https://github.com/hkarpinen/portfolio-forum",
  },
  {
    name: "portfolio-notifications",
    desc: "Consumes domain events over RabbitMQ, persists them, and fans out to clients over SSE.",
    tags: ["C#", "RabbitMQ", "SSE"],
    github: "https://github.com/hkarpinen/portfolio-notifications",
  },
  {
    name: "portfolio-geography",
    desc: "Stateless geography service — current weather today, room for geocoding & timezones.",
    tags: ["C#", ".NET 8", "OpenWeather"],
    github: "https://github.com/hkarpinen/portfolio-geography",
  },
  {
    name: "portfolio-math",
    desc: "Stateless math service — unit conversion today, built to grow into more pure-math tools.",
    tags: ["C#", ".NET 8", "DDD"],
    github: "https://github.com/hkarpinen/portfolio-math",
  },
  {
    name: "portfolio-infra",
    desc: "Docker Compose stack — pulls prebuilt ghcr.io images and wires up every service.",
    tags: ["Docker", "Compose", "Nginx"],
    github: "https://github.com/hkarpinen/portfolio-infra",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <div className="profile-hero">
        <div className="cover" aria-hidden="true" />
        <div className="pmain">
          <div className="avatar-xl overflow-hidden p-0">
            <Image
              src="/hank_headshot.jpeg"
              alt="Hank Karpinen"
              width={60}
              height={60}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="prow">
            <div className="profile-id">
              <h1>Hank Karpinen</h1>
              <div className="role">// full-stack-engineer · pullman-wa</div>
              <p className="bio">
                I started in QA — learning how software breaks — then moved into building it. Today
                I modernize legacy systems into scalable .NET and cloud architectures, increasingly
                with AI-assisted tooling I build myself, and ship full-stack across TypeScript/React
                and Python. AWS Certified Solutions Architect &amp; ScrumMaster. Open to senior
                &amp; staff roles.
              </p>
            </div>
            <div className="profile-actions">
              <Btn
                href="/contact"
                variant="primary"
                iconRight={<Icon name="arrowRight" size={13} strokeWidth={2} />}
              >
                $ contact
              </Btn>
              <Btn asChild variant="secondary">
                <a href="/cv.pdf" download="Hank-Karpinen-CV.pdf">
                  $ cv.pdf
                </a>
              </Btn>
            </div>
          </div>
        </div>
      </div>

      <div className="facts">
        {FACTS.map(([v, l, cls]) => (
          <div key={l} className="fact">
            <div className={`v ${cls}`}>{v}</div>
            <div className="l">{l}</div>
          </div>
        ))}
      </div>

      <div className="section-h">
        <h2>// CERTIFICATIONS</h2>
      </div>
      <div className="chips" style={{ marginBottom: 28 }}>
        {CERTS.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>

      <div className="section-h">
        <h2>// EXPERIENCE</h2>
        <div className="actions">
          <Btn asChild variant="secondary" size="sm">
            <a href="/cv.pdf" download="Hank-Karpinen-CV.pdf">
              Full résumé
            </a>
          </Btn>
        </div>
      </div>
      <div className="exp-list">
        {EXPERIENCE.map((e) => (
          <div key={`${e.role}-${e.org}`} className="exp-item">
            <div className="exp-date">{e.dates}</div>
            <div>
              <div className="exp-role">
                {e.role} <span className="exp-org">· {e.org}</span>
              </div>
              <div className="exp-where">{e.where}</div>
              <p className="exp-desc">{e.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="section-h">
        <h2>// PROJECTS</h2>
        <div className="actions">
          <Btn href="https://github.com/hkarpinen" variant="secondary" size="sm">
            View all
          </Btn>
        </div>
      </div>
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {PROJECTS.map((p) => (
          <article
            key={p.name}
            className="card"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <h3 className="card-h">{p.name}</h3>
            <p style={{ fontSize: "0.75rem", flex: 1 }}>{p.desc}</p>
            <div className="row" style={{ gap: 5, flexWrap: "wrap" }}>
              {p.tags.map((t) => (
                <span key={t} className="badge">
                  {t}
                </span>
              ))}
            </div>
            <div
              className="row"
              style={{ paddingTop: 8, gap: 14, borderTop: "1px solid var(--border)" }}
            >
              <a
                href={p.github}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--amber)",
                  font: "600 0.68rem/1 var(--ff-mono)",
                  display: "inline-flex",
                  gap: 5,
                  alignItems: "center",
                }}
              >
                GitHub <Icon name="arrowUpRight" size={12} strokeWidth={2} />
              </a>
              {p.live && (
                <Link
                  href={p.live}
                  style={{
                    color: "var(--amber)",
                    font: "600 0.68rem/1 var(--ff-mono)",
                    display: "inline-flex",
                    gap: 5,
                    alignItems: "center",
                  }}
                >
                  Live <Icon name="arrowUpRight" size={12} strokeWidth={2} />
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="section-h">
        <h2>// SKILLS</h2>
      </div>
      <div className="skills-grid" style={{ marginTop: 0 }}>
        {SKILLS.map((group) => (
          <div key={group.label}>
            <h4>{group.label}</h4>
            <div className="chips">
              {group.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
