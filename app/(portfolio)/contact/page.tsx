"use client";

import { useState } from "react";

function inputStyle(hasError = false): React.CSSProperties {
  return {
    height: "38px",
    width: "100%",
    background: "var(--paper-2)",
    border: `1px solid ${hasError ? "var(--danger)" : "var(--ink-3)"}`,
    
    padding: "0 12px",
    fontSize: "var(--ts-body-sm)",
    color: "var(--text)",
    outline: "none",
    transition: "border-color 110ms, box-shadow 110ms",
  };
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-base font-medium text-ink-2 tracking-[0.02em]">
        {label}
      </label>
      {children}
      {hint && <span className="text-sm text-ink-3">{hint}</span>}
    </div>
  );
}

const CONTACT_INFO = [
  {
    icon: "✉️",
    label: "Email",
    value: "hello@example.com",
    href: "mailto:hello@example.com",
  },
  {
    icon: "💼",
    label: "LinkedIn",
    value: "linkedin.com/in/hank-karpinen",
    href: "https://www.linkedin.com/in/hank-karpinen/",
  },
  {
    icon: "🐙",
    label: "GitHub",
    value: "github.com/hkarpinen",
    href: "https://github.com/hkarpinen",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Section header */}
      <div>
        <h1 className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink mb-3">
          Get in touch
        </h1>
        <p className="text-md text-ink-3">
          Have a project in mind or want to collaborate? Send me a message.
        </p>
      </div>

      <div style={{ gridTemplateColumns: "1fr 280px", alignItems: "start" }} className="contact-grid grid gap-12">
        {/* Form */}
        {submitted ? (
          <div className="bg-paper py-20 px-16 shadow-card text-center" style={{ border: "1.5px solid var(--ink)" }}>
            <div className="w-[56px] h-[56px] bg-[rgba(61,107,43,0.10)] flex items-center justify-center" style={{ margin: "0 auto 16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="font-serif font-bold text-xl text-ink mb-4">Message sent!</h2>
            <p className="text-base text-ink-3 leading-[1.6] mb-12">
              Thanks for reaching out. I&apos;ll get back to you as soon as possible.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
              className="py-4 px-10 bg-paper-2 text-ink-2 text-base font-medium cursor-pointer" style={{ border: "1.5px solid var(--ink)", transition: "background 110ms" }}
            >
              Send another
            </button>
          </div>
        ) : (
          <div className="bg-paper p-12 shadow-card" style={{ border: "1.5px solid var(--ink)" }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {/* Name + Email row */}
              <div style={{ gridTemplateColumns: "1fr 1fr" }} className="name-email-grid grid gap-6">
                <Field label="Name">
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                    required
                    className="contact-input"
                    style={inputStyle()}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    required
                    className="contact-input"
                    style={inputStyle()}
                  />
                </Field>
              </div>

              <Field label="Subject">
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="What is this about?"
                  required
                  className="contact-input"
                  style={inputStyle()}
                />
              </Field>

              <Field label="Message">
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell me about your project…"
                  required
                  rows={6}
                  className="contact-input w-full bg-paper-2 py-5 px-6 text-base text-ink outline-none leading-[1.6] font-body"
                  style={{ border: "1.5px solid var(--ink)", resize: "vertical", transition: "border-color 110ms, box-shadow 110ms" }}
                />
              </Field>

              <button
                type="submit"
                className="contact-submit h-[42px] bg-red text-white cursor-pointer text-md font-semibold font-serif"
                style={{ border: "none", transition: "background 110ms, transform 100ms" }}
              >
                Send message
              </button>
            </form>
          </div>
        )}

        {/* Contact info sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-paper p-10 shadow-card" style={{ border: "1.5px solid var(--ink)" }}>
            <h3 className="font-serif font-bold text-md text-ink mb-8">
              Contact info
            </h3>
            <div className="flex flex-col gap-5">
              {CONTACT_INFO.map(info => (
                  <a
                  key={info.label}
                  href={info.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-info-link flex items-center gap-5 py-5 px-6 bg-paper-2 no-underline"
                  style={{ transition: "background 110ms" }}
                >
                  <span className="text-lg">{info.icon}</span>
                  <div>
                    <div className="text-sm text-ink-3 font-medium">{info.label}</div>
                    <div className="text-base text-red">{info.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-[rgba(178,42,26,0.10)] p-10" style={{ border: "1px solid oklch(63% 0.22 252 / 0.25)" }}>
            <p className="text-base text-red leading-[1.6]">
              <strong>Response time:</strong> I typically reply within 24–48 hours.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .name-email-grid { grid-template-columns: 1fr !important; }
        }
        .contact-input:focus {
          border-color: var(--ink) !important;
          box-shadow: 0 0 0 3px rgba(178,42,26,0.08);
        }
        .contact-submit:hover  { background: var(--accent-hi) !important; }
        .contact-submit:active { transform: scale(0.97); }
        .contact-info-link:hover { background: var(--surface-3) !important; }
      `}</style>
    </div>
  );
}
