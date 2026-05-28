/**
 * Static content blocks for the landing page.
 *
 * Lifted out of `landing-page.tsx` so the rendering files can stay focused
 * on JSX and so non-engineers can update copy + module entries by editing
 * one isolated data file.
 */

/**
 * Module cards. `tech` populates the small mono tag row inside the card —
 * pulled straight from each project's real stack so recruiters can scan
 * the technologies without leaving the front page.
 */
export const MODULES: {
  num: string;
  name: string;
  desc: string;
  public: boolean;
  href: string;
  cta: string;
  tech: string[];
}[] = [
  {
    num: "01",
    name: "Weather",
    desc: "City search, °F/°C toggle, Leaflet map.",
    public: true,
    href: "/weather",
    cta: "Open Weather",
    tech: ["ASP.NET Core", "OpenWeather", "Leaflet"],
  },
  {
    num: "02",
    name: "Convert",
    desc: "Length, mass, temp, volume, speed, area, data.",
    public: true,
    href: "/convert",
    cta: "Open Convert",
    tech: ["ASP.NET Core", "DDD", "React Query"],
  },
  {
    num: "03",
    name: "Household",
    desc: "Shared ledger, splits, calendar, chores.",
    public: false,
    href: "/login?next=/household",
    cta: "Sign in",
    tech: ["ASP.NET Core", "EF Core", "Postgres", "MassTransit"],
  },
  {
    num: "04",
    name: "Forum",
    desc: "Threaded discussions, votes, mod queues.",
    public: false,
    href: "/login?next=/forum",
    cta: "Sign in",
    tech: ["ASP.NET Core", "SSE", "JWT", "MassTransit"],
  },
  {
    num: "05",
    name: "Finance",
    desc: "Personal expenses & income tracking.",
    public: false,
    href: "/login?next=/expenses",
    cta: "Sign in",
    tech: ["ASP.NET Core", "RabbitMQ", "Postgres", "React Query"],
  },
];

/**
 * Skills inlined here (no longer split into a separate /about page).
 * Categories match what was on the old about page exactly.
 */
export const SKILLS: { label: string; items: string[] }[] = [
  {
    label: "Backend",
    items: [".NET / C#", "ASP.NET Core", "EF Core", "Postgres", "RabbitMQ", "MassTransit"],
  },
  {
    label: "Frontend",
    items: ["Next.js", "TypeScript", "React Query", "Tailwind", "Radix", "React Hook Form"],
  },
  {
    label: "Cloud & DevOps",
    items: ["AWS", "Azure", "Docker", "Nginx", "GitHub Actions", "CI/CD"],
  },
  { label: "Data", items: ["PostgreSQL", "SQL", "Oracle", "MongoDB", "Entity Framework"] },
  { label: "Also", items: ["Python", "Node.js", "REST APIs", "Microservices"] },
];

export const NAV_LINKS: [string, string][] = [
  ["About", "/#about"],
  ["Architecture", "/about/architecture"],
  ["Weather", "/weather"],
  ["Convert", "/convert"],
  ["Contact", "/contact"],
];
