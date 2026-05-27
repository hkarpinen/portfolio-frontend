"use client";

import { useState } from "react";
import { Input, Textarea, Btn, Card, EditorialPageHead } from "@/components/editorial";
import { Icon } from "@/components/editorial/icon";

const LINKS = [
  { label: "GitHub", href: "https://github.com/hkarpinen", display: "github.com/hkarpinen" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/hank-karpinen/", display: "linkedin.com/in/hank-karpinen" },
  { label: "Read.cv", href: "https://read.cv/hankk", display: "read.cv/hankk" },
];

function ContactAside() {
  return (
    <Card className="flex flex-col" aria-label="Direct contact information">
      <h2 className="ed-h4">Direct</h2>
      <a href="mailto:hank@stackgazette.dev" className="ed-contact-email" aria-label="Send email to hank@stackgazette.dev">
        hank@stackgazette.dev
      </a>

      <div className="ed-contact-divider my-6" role="separator" />

      <h2 className="ed-h4 mb-2">Elsewhere</h2>
      <nav aria-label="Social profiles">
        {LINKS.map(link => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="ed-contact-row"
            aria-label={`${link.label} — ${link.display} (opens in new tab)`}
          >
            <span>{link.label}</span>
            <span className="ed-contact-row-handle" aria-hidden="true">{link.display} <Icon name="arrowRight" size={12} /></span>
          </a>
        ))}
      </nav>

      <div className="ed-contact-divider my-6" role="separator" />

      <p className="ed-label-muted leading-relaxed">
        Based in Pullman, WA · open to relocate<br />
        Response within 24h
      </p>
    </Card>
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
    <div className="flex flex-col gap-10">
      <EditorialPageHead
        kicker="Contact"
        title={`Drop me a <em>line.</em>`}
        deck="Roles, freelance, code questions — all welcome. Hank Karpinen, full-stack engineer based in Pullman, WA. I'll get back to you within 24 hours."
      />

      {submitted ? (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] items-start gap-8">
          <div className="ed-card flex flex-col items-start gap-4 text-left" role="alert" aria-live="polite">
            <h2 className="ed-h3">Message sent.</h2>
            <p className="ed-deck">Thanks for reaching out — I&apos;ll get back to you within 24h.</p>
            <Btn
              variant="secondary"
              onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
            >
              Send another
            </Btn>
          </div>
          <ContactAside />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] items-start gap-8">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
            aria-label="Contact form"
            noValidate
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                type="text"
                label="Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                autoComplete="name"
                required
              />
              <Input
                type="email"
                label="Email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@email.com"
                autoComplete="email"
                required
              />
            </div>

            <Input
              type="text"
              label="Subject"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="e.g. Senior role, freelance project, or just hi"
            />

            <Textarea
              label="Message"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Tell me about the role, the team, or just say hi. I read every message."
              required
              rows={8}
            />

            <div className="flex gap-3 flex-wrap">
              <Btn type="submit" variant="primary" size="lg" iconRight={<Icon name="arrowRight" size={16} aria-hidden />}>
                Send message
              </Btn>
              <Btn type="button" variant="secondary" size="lg" href="/about">
                Back to About
              </Btn>
            </div>
          </form>

          <ContactAside />
        </div>
      )}
    </div>
  );
}
