"use client";

import { useState } from "react";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import { Btn, Badge } from "@/components/editorial";
import { Icon } from "@/components/editorial/icon";
import { Avatar } from "@/components/layout/sidebar-nav";
import {
  NotificationsProvider,
  useNotificationsContext,
} from "@/components/layout/notifications-provider";

/**
 * <LandingPage> — public landing (redesign)
 *
 * Drop-in replacement for /app/landing-page.tsx. Imports nothing from
 * /components/landing/ (those are deleted in step 7 of MIGRATION).
 *
 * All visual rules in /app/globals.css under `.ed-public-nav*` /
 * `.ed-hero*` / `.ed-module-card*` / `.ed-banner-dark` / `.ed-public-footer`.
 * Zero inline styles.
 */

const MODULES: { num: string; name: string; desc: string; public: boolean; href: string; cta: string }[] = [
  { num: "01", name: "Portfolio",  desc: "Project breakdown, the stack, the why.",              public: true,  href: "/about",              cta: "Read about" },
  { num: "02", name: "Weather",    desc: "City search, °F/°C toggle, Leaflet map.",             public: true,  href: "/weather",             cta: "Open Weather" },
  { num: "03", name: "Convert",    desc: "Length, mass, temp, volume, speed, area, data.",      public: true,  href: "/convert",             cta: "Open Convert" },
  { num: "04", name: "Household",  desc: "Shared ledger, splits, calendar, chores.",            public: false, href: "/login?next=/household", cta: "Sign in" },
  { num: "05", name: "Forum",      desc: "Threaded discussions, votes, mod queues.",            public: false, href: "/login?next=/forum",    cta: "Sign in" },
  { num: "06", name: "Finance",    desc: "Personal expenses & income tracking.",                public: false, href: "/login?next=/expenses", cta: "Sign in" },
];

const NAV_LINKS: [string, string][] = [
  ["About", "/about"],
  ["Weather", "/weather"],
  ["Convert", "/convert"],
  ["Contact", "/contact"],
];

type LandingPageProps = {
  displayName?: string | null;
  avatarUrl?: string | null;
};

export function LandingPage({ displayName = null, avatarUrl = null }: LandingPageProps) {
  return (
    <NotificationsProvider>
      <LandingPageInner displayName={displayName} avatarUrl={avatarUrl} />
    </NotificationsProvider>
  );
}

function LandingPageInner({ displayName, avatarUrl }: { displayName: string | null; avatarUrl: string | null }) {
  const [contactEmail, setContactEmail] = useState("");
  const { notifications, removeNotification, markRead, markAllRead } = useNotificationsContext();
  const unread = notifications.length;
  const signedIn = displayName !== null;

  return (
    <div className="ed-landing">
      <a href="#main" className="skip-link">Skip to content</a>

      {/* Top nav */}
      <header className="ed-public-nav" role="banner">
        <Link href="/" className="ed-public-nav-lockup" aria-label="The Stack & Gazette — home">
          <span className="ed-sidebar-mark" aria-hidden="true">SG</span>
          <span>
            The Stack <em>&amp;</em> Gazette
          </span>
        </Link>

        <nav aria-label="Site sections" className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(([label, href]) => (
            <Link key={href} href={href} className="ed-public-nav-link">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!signedIn && (
            <>
              <Btn href="/login" variant="secondary" size="sm">Sign in</Btn>
              <Btn href="/register" variant="primary" size="sm">Create account</Btn>
            </>
          )}

          {signedIn && (
            <>
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button
                    aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
                    className="ed-icon-btn"
                  >
                    <Icon name="bell" size={18} />
                    {unread > 0 && <span aria-hidden="true" className="ed-icon-btn-dot" />}
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content align="end" sideOffset={8} className="ed-popover">
                    <div className="ed-popover-head">
                      <span className="ed-label">Notifications</span>
                      {unread > 0 && <span className="ed-badge ed-badge-sm ed-badge-danger">{unread} new</span>}
                    </div>
                    <div className="ed-popover-body">
                      {notifications.length === 0 ? (
                        <div className="ed-popover-empty">— No notifications —</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="ed-popover-item">
                            <p className="ed-meta ed-popover-item-kicker">
                              {n.type === "success" ? "Update" : n.type === "error" ? "Error" : "Notice"} · just now
                            </p>
                            {n.title && <p className="ed-h4 ed-popover-item-title">{n.title}</p>}
                            <p className="ed-popover-item-msg">{n.message}</p>
                            <div className="ed-popover-item-acts">
                              {n.deepLink && (
                                <Link
                                  href={n.deepLink}
                                  onClick={() => { markRead(n.id); removeNotification(n.id); }}
                                  className="ed-popover-item-link"
                                >
                                  View →
                                </Link>
                              )}
                              <button
                                onClick={() => { markRead(n.id); removeNotification(n.id); }}
                                className="ed-popover-item-dismiss"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="ed-popover-foot">
                        <button
                          onClick={() => {
                            markAllRead();
                            notifications.forEach((n) => removeNotification(n.id));
                          }}
                          className="ed-btn ed-btn-secondary ed-btn-sm ed-btn-block"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>

              <Link href="/settings/profile" aria-label="Open settings" className="ed-topbar-avatar">
                <Avatar name={displayName} url={avatarUrl} size="md" />
              </Link>
            </>
          )}
        </div>
      </header>

      <main id="main" tabIndex={-1} className="ed-landing-main">
        {/* Hero */}
        <section className="ed-hero" aria-labelledby="hero-heading">
          <p className="ed-kicker mb-3 inline-flex items-center gap-2">
            <span className="pulse-dot" aria-hidden="true" />
            Hank Karpinen · Full-stack engineer · Open to roles
          </p>
          <h1 id="hero-heading" className="ed-display max-w-[18ch] mx-auto">
            A full-stack app, <em>built from scratch.</em>
          </h1>
          <p className="ed-deck ed-hero-deck">
            Six services, thirty screens, hand-rolled auth and a moderation queue — all running
            behind a single Nginx gateway. Click <em>Try the demo</em> below — no signup, no email,
            you&apos;re in inside three seconds.
          </p>
          <div className="ed-hero-cta-row">
            <Btn href="/demo" variant="primary" size="lg" iconRight={<span aria-hidden="true">→</span>}>
              Try the demo
            </Btn>
            <Btn href="/about" variant="secondary" size="lg">See the work</Btn>
          </div>
          <p className="ed-hero-cta-foot">No account needed · Demo resets nightly · No data persists</p>
        </section>

        {/* Stack summary strip */}
        <section className="ed-landing-section" aria-label="Technical highlights">
          <div className="flex flex-wrap items-center gap-4 py-4 border-t border-b border-rule-soft">
            <span className="ed-label-muted shrink-0">Built with</span>
            <div className="flex flex-wrap gap-2 items-center">
              {["Next.js 14", ".NET 8", "Postgres", "RabbitMQ", "MassTransit", "Docker", "Nginx", "JWT", "AWS"].map(t => (
                <span
                  key={t}
                  className="font-mono text-xs font-600 uppercase tracking-[0.12em] px-2 py-1 border border-ink-3 text-[var(--ink-2)]"
                >{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Modules */}
        <section className="ed-landing-section" aria-labelledby="modules-heading">
          <div className="ed-section-row">
            <h2 id="modules-heading" className="ed-h3">
              What&apos;s <em>inside</em>
            </h2>
            <Btn href="/about" variant="ghost" size="sm" iconRight={<span aria-hidden="true">→</span>}>
              Full breakdown
            </Btn>
          </div>
          <p className="ed-section-row-deck">
            Six modules. Three are public — no account required. Three need a login, or just use the demo.
          </p>
          <ul className="ed-modules-grid" aria-label="App modules">
            {MODULES.map(m => (
              <li key={m.num} className="contents">
                <Link href={m.href} className="ed-module-card">
                  <span className="ed-module-card-num" aria-hidden="true">No. {m.num}</span>
                  <h3 className="ed-h3">{m.name}</h3>
                  <p className="ed-module-card-body">{m.desc}</p>
                  <div className="ed-module-card-foot">
                    <Badge variant={m.public ? "success" : "default"} dot size="md">
                      {m.public ? "Public" : "Account"}
                    </Badge>
                    <span className="ed-module-card-arrow" aria-hidden="true">{m.cta} →</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Hiring banner */}
        <section className="ed-banner-dark" aria-label="Hiring — get in touch">
          <div className="flex-1 min-w-[240px]">
            <p className="ed-kicker">Currently open to roles</p>
            <p className="ed-h3 ed-banner-dark-title">
              Let&apos;s <em>work</em> together.
            </p>
            <p className="text-[var(--paper)] opacity-80 font-mono text-sm uppercase tracking-[0.12em] mt-2">Senior &amp; staff full-stack · Remote, hybrid, or onsite · Pullman, WA</p>
          </div>
          <div className="flex items-stretch gap-0 w-full sm:w-auto sm:shrink-0 border-[1.5px] border-paper/30">
            <label htmlFor="contact-email" className="sr-only">Your email address</label>
            <input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 min-w-0 bg-transparent text-paper font-mono text-sm tracking-[0.1em] placeholder:text-paper/40 border-none outline-none px-4 py-3 sm:min-w-[200px]"
              autoComplete="email"
            />
            <Btn
              href={`/contact${contactEmail ? `?email=${encodeURIComponent(contactEmail)}` : ""}`}
              variant="primary"
              size="lg"
              className="shrink-0"
              iconRight={<span aria-hidden="true">→</span>}
            >
              Get in touch
            </Btn>
          </div>
        </section>
      </main>

      <footer className="ed-public-footer" role="contentinfo">
        <div>© 2026 Hank Karpinen · Next.js · .NET 8 · Postgres · RabbitMQ · Docker</div>
        <nav aria-label="Social links" className="flex gap-5">
          <a href="https://github.com/hkarpinen" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/hank-karpinen/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:hank@stackgazette.dev">Email</a>
        </nav>
      </footer>
    </div>
  );
}
