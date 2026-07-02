"use client";

import { Btn, Icon } from "@/components/editorial";
import { useState } from "react";

const LINKS = [
  { label: "GitHub", href: "https://github.com/hkarpinen", display: "github.com/hkarpinen" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/hank-karpinen/",
    display: "in/hank-karpinen",
  },
  { label: "Read.cv", href: "https://read.cv/hankk", display: "read.cv/hankk" },
];

/**
 * Contact aside — `.card` with the direct email, social links, and a
 * location note. Mirrors the Terminus prototype's `// DIRECT` /
 * `// ELSEWHERE` card.
 */
function ContactAside() {
  return (
    <aside>
      <div className="card">
        <h2 className="card-h">// DIRECT</h2>
        <a
          href="mailto:contact@hankkarpinen.com"
          style={{
            color: "var(--amber)",
            font: "600 0.875rem/1 var(--ff-mono)",
            display: "inline-block",
            marginTop: 8,
          }}
          aria-label="Send email to contact@hankkarpinen.com"
        >
          contact@hankkarpinen.com
        </a>

        <div className="divider-hr" role="separator" />

        <h2 className="card-h">// ELSEWHERE</h2>
        <nav className="stack" style={{ marginTop: 10 }} aria-label="Social profiles">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="row"
              style={{
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--border)",
                textDecoration: "none",
              }}
              aria-label={`${link.label} — ${link.display} (opens in new tab)`}
            >
              <span style={{ font: "600 0.75rem/1 var(--ff-mono)", color: "var(--text)" }}>
                {link.label}
              </span>
              <span
                style={{ font: "400 0.68rem/1 var(--ff-mono)", color: "var(--text-4)" }}
                className="inline-flex items-center gap-1"
                aria-hidden="true"
              >
                {link.display} <Icon name="arrowUpRight" size={12} strokeWidth={2} />
              </span>
            </a>
          ))}
        </nav>

        <div className="divider-hr" role="separator" />

        <div className="label" style={{ lineHeight: 1.9 }}>
          // Pullman, WA · open to relocate
          <br />
          Response within 24h
        </div>
      </div>
    </aside>
  );
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="page-head">
        <div className="titles">
          <div className="kicker" style={{ marginBottom: 8 }}>
            // CONTACT
          </div>
          <h1>Drop me a line.</h1>
          <p className="deck">
            Roles, freelance, code questions — all welcome. Hank Karpinen, full-stack engineer based
            in Pullman, WA. I&apos;ll get back to you within 24 hours.
          </p>
        </div>
      </header>

      {submitted ? (
        <div className="split">
          <div className="card flex flex-col items-start gap-4 text-left" role="alert" aria-live="polite">
            <h2 className="ed-h3">Message sent.</h2>
            <p className="deck">Thanks for reaching out — I&apos;ll get back to you within 24h.</p>
            <Btn
              variant="secondary"
              onClick={() => {
                setSubmitted(false);
                setForm({ name: "", email: "", subject: "", message: "" });
              }}
            >
              $ send-another
            </Btn>
          </div>
          <ContactAside />
        </div>
      ) : (
        <div className="split">
          <form className="form wide" onSubmit={handleSubmit} aria-label="Contact form" noValidate>
            <div className="field-row">
              <div className="field">
                <label htmlFor="c-name">Name</label>
                <input
                  id="c-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="c-email">Email</label>
                <input
                  id="c-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@email.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="c-subj">Subject</label>
              <input
                id="c-subj"
                type="text"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="What's this about?"
              />
            </div>

            <div className="field">
              <label htmlFor="c-msg">Message</label>
              <textarea
                id="c-msg"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Tell me about the role, the team, or just say hi."
                rows={8}
                required
              />
            </div>

            <div className="form-actions">
              <Btn
                type="submit"
                variant="primary"
                size="lg"
                iconRight={<Icon name="arrowRight" size={16} aria-hidden />}
              >
                $ send
              </Btn>
              <Btn type="button" variant="secondary" size="lg" href="/about">
                Cancel
              </Btn>
            </div>
          </form>

          <ContactAside />
        </div>
      )}
    </div>
  );
}
