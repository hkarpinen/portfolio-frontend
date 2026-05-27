import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon, type IconName } from "@/components/editorial/icon";
import { Btn, Card, Badge, EditorialPageHead } from "@/components/editorial";

/**
 * <AboutPage> — portfolio bio + selected work + skills (redesign)
 *
 * Matches reference/Portfolio_Redesign.html `#/about`: a page-head with one
 * primary action, a two-column split (selected work grid + aside), and a
 * dark "Currently" availability card. Real portfolio content; no inline styles.
 */

export const metadata: Metadata = {
  title: "About — Hank Karpinen",
  description: "Full-stack engineer with 4+ years experience. AWS certified. Seven microservices, thirty screens, hand-rolled auth. Open to senior & staff roles.",
};

const PROJECTS: { icon: IconName; title: string; description: string; tech: string[]; href: string; cta: string }[] = [
  {
    icon: "household",
    title: "Household",
    description: "Household management service. Create shared households, assign chores, manage a shared calendar, and track who's contributing what.",
    tech: ["ASP.NET Core", "EF Core", "Postgres", "MassTransit"],
    href: "/household",
    cta: "Open Household",
  },
  {
    icon: "dollar",
    title: "Finance",
    description: "Personal finance engine in its own microservice. Log expenses, split costs across a household, track income sources.",
    tech: ["ASP.NET Core", "RabbitMQ", "Postgres", "React Query"],
    href: "/expenses",
    cta: "Open Finance",
  },
  {
    icon: "forum",
    title: "Community Forum",
    description: "Threaded forum platform with communities, voting, and moderation tools.",
    tech: ["ASP.NET Core", "SSE", "JWT", "MassTransit"],
    href: "/forum",
    cta: "Open Forum",
  },
  {
    icon: "weather",
    title: "Geography & Weather",
    description: "Live weather via OpenWeather. City search, °F/°C toggle, interactive Leaflet map overlays.",
    tech: ["ASP.NET Core", "OpenWeather", "Leaflet"],
    href: "/weather",
    cta: "Open Weather",
  },
  {
    icon: "math",
    title: "Unit Conversion",
    description: "Pure domain engine for length, mass, temperature, volume, speed, area, and data.",
    tech: ["ASP.NET Core", "DDD", "React Query"],
    href: "/convert",
    cta: "Open Convert",
  },
  {
    icon: "palette",
    title: "Stack & Gazette (this app)",
    description: "A unified frontend over seven independent microservices behind a single Nginx gateway. The UI you're reading now.",
    tech: ["Next.js 14", "TypeScript", "Tailwind", "Docker"],
    href: "/demo",
    cta: "Try the demo",
  },
];

const SKILLS: { label: string; items: string[] }[] = [
  { label: "Backend", items: [".NET / C#", "ASP.NET Core", "EF Core", "Postgres", "RabbitMQ", "MassTransit"] },
  { label: "Frontend", items: ["Next.js", "TypeScript", "React Query", "Tailwind", "Radix", "React Hook Form"] },
  { label: "Cloud & DevOps", items: ["AWS", "Azure", "Docker", "Nginx", "GitHub Actions", "CI/CD"] },
  { label: "Data", items: ["PostgreSQL", "SQL", "Oracle", "MongoDB", "Entity Framework"] },
  { label: "Also", items: ["Python", "Node.js", "REST APIs", "Microservices"] },
];

export default function AboutPage() {
  return (
    <div className="ed-about">
      <EditorialPageHead
        kicker="Portfolio · About"
        title={`Hi, I'm <em>Hank.</em>`}
        deck="Full-stack engineer based in Pullman, WA. I write the migrations, the auth flows, and the frontend — across seven microservices. AWS certified, 4+ years experience. Open to senior & staff roles."
      />

      <div className="ed-about-hero">
        <div className="ed-about-hero-row">
          <div className="ed-about-headshot">
            <Image
              src="/hank_headshot.jpeg"
              alt="Hank Karpinen"
              width={160}
              height={160}
              priority
            />
          </div>
          <div className="ed-about-bio">
            <p className="ed-deck">Full-stack engineer based in Pullman, WA. I write the migrations, the auth flows, and the frontend — across seven microservices. AWS certified, 4+ years experience.</p>
            <div className="ed-about-cta-row">
              <Btn href="/contact" variant="primary" size="md" iconRight={<Icon name="arrowRight" size={16} />}>
                Get in touch
              </Btn>
              <Btn asChild variant="secondary" size="md">
                <a href="/cv.pdf" download="Hank-Karpinen-CV.pdf">Download CV</a>
              </Btn>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end -mt-2">
        <Btn href="/contact" variant="primary" size="md" iconRight={<Icon name="arrowRight" size={16} />}>
          Get in touch
        </Btn>
      </div>

      <div className="ed-about-grid">
        {/* Selected work */}
        <section aria-labelledby="selected-work-heading" className="flex flex-col gap-5">
          <h2 id="selected-work-heading" className="ed-h3">Selected <em>work</em></h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROJECTS.map(project => (
              <Card key={project.title} muted className="flex flex-col gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="ed-project-card-icon shrink-0" aria-hidden="true">
                    <Icon name={project.icon} size={20} strokeWidth={1.5} />
                  </span>
                  <h3 className="ed-h4 min-w-0 break-words">{project.title}</h3>
                </div>
                <p className="ed-project-card-body">{project.description}</p>
                <div className="flex flex-wrap gap-2" aria-label={`Technologies: ${project.tech.join(", ")}`}>
                  {project.tech.map(t => (
                    <Badge key={t} variant="default" size="sm">{t}</Badge>
                  ))}
                </div>
                <Link href={project.href} className="ed-about-card-link">
                  {project.cta} <Icon name="arrowRight" size={14} aria-hidden />
                </Link>
              </Card>
            ))}
          </div>
        </section>

        {/* Aside */}
        <aside aria-label="Skills and availability" className="flex flex-col gap-6">
          <Card>
            <h3 className="ed-h4 mb-5">Skills</h3>
            <dl className="flex flex-col gap-4">
              {SKILLS.map(group => (
                <div key={group.label}>
                  <dt className="ed-kicker mb-1">{group.label}</dt>
                  <dd className="ed-about-skill-text">{group.items.join(" · ")}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <div className="ed-card-dark" role="complementary" aria-label="Availability">
            <p className="ed-kicker">
              <span className="pulse-dot mr-2" aria-hidden="true" />
              Currently open
            </p>
            <p className="ed-h4 ed-card-dark-lead">
              Open to <em>senior &amp; staff</em> full-stack — remote, hybrid, or onsite.
            </p>
            <p className="ed-card-dark-sub">Based in Pullman, WA · Response within 24h.</p>
            <Btn href="/contact" variant="secondary" size="md" fullWidth className="ed-btn-on-dark">
              Get in touch →
            </Btn>
          </div>
        </aside>
      </div>

      <div className="mt-12 border-t border-rule py-6">
        <p className="font-mono uppercase text-xs tracking-[0.22em] text-ink-2">
          Open to full-stack roles ·{" "}
          <Link href="/contact" className="text-red underline">Get in touch</Link>
          {" "}·{" "}
          <a href="mailto:hank@stackgazette.dev" className="text-red underline">hank@stackgazette.dev</a>
          {" "}·{" "}
          <a href="/cv.pdf" download className="text-red underline">Download CV</a>
        </p>
      </div>
    </div>
  );
}
