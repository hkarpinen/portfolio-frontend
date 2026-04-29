"use client";

import { useState } from "react";

function inputStyle(hasError = false): React.CSSProperties {
  return {
    height: "38px",
    width: "100%",
    background: "var(--surface-2)",
    border: `1px solid ${hasError ? "var(--danger)" : "var(--border)"}`,
    borderRadius: "12px",
    padding: "0 12px",
    fontSize: "13px",
    color: "var(--text)",
    outline: "none",
    transition: "border-color 110ms, box-shadow 110ms",
  };
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)", letterSpacing: "0.02em" }}>
        {label}
      </label>
      {children}
      {hint && <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{hint}</span>}
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Section header */}
      <div>
        <h1 style={{
          fontFamily: "var(--ff-display)", fontWeight: "800",
          fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)",
          marginBottom: "6px",
        }}>
          Get in touch
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-3)" }}>
          Have a project in mind or want to collaborate? Send me a message.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: "24px",
        alignItems: "start",
      }} className="contact-grid">
        {/* Form */}
        {submitted ? (
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "40px 32px",
            boxShadow: "var(--shadow-sm)", textAlign: "center",
          }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px",
              background: "var(--success-s)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 style={{
              fontFamily: "var(--ff-display)", fontWeight: "700",
              fontSize: "20px", color: "var(--text)", marginBottom: "8px",
            }}>Message sent!</h2>
            <p style={{ fontSize: "13px", color: "var(--text-3)", lineHeight: "1.6", marginBottom: "24px" }}>
              Thanks for reaching out. I&apos;ll get back to you as soon as possible.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
              style={{
                padding: "8px 20px", borderRadius: "10px",
                background: "var(--surface-2)", color: "var(--text-2)",
                border: "1px solid var(--border)",
                fontSize: "13px", fontWeight: "500", cursor: "pointer",
                transition: "background 110ms",
              }}
            >
              Send another
            </button>
          </div>
        ) : (
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)",
          }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Name + Email row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="name-email-grid">
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
                  className="contact-input"
                  style={{
                    width: "100%",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "10px 12px",
                    fontSize: "13px",
                    color: "var(--text)",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: "1.6",
                    transition: "border-color 110ms, box-shadow 110ms",
                    fontFamily: "var(--ff-body)",
                  }}
                />
              </Field>

              <button
                type="submit"
                className="contact-submit"
                style={{
                  height: "42px", borderRadius: "12px",
                  background: "var(--accent)", color: "#fff",
                  border: "none", cursor: "pointer",
                  fontSize: "14px", fontWeight: "600", fontFamily: "var(--ff-display)",
                  transition: "background 110ms, transform 100ms",
                }}
              >
                Send message
              </button>
            </form>
          </div>
        )}

        {/* Contact info sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)",
          }}>
            <h3 style={{
              fontFamily: "var(--ff-display)", fontWeight: "700",
              fontSize: "14px", color: "var(--text)", marginBottom: "16px",
            }}>
              Contact info
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {CONTACT_INFO.map(info => (
                  <a
                  key={info.label}
                  href={info.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-info-link"
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", borderRadius: "10px",
                    background: "var(--surface-2)", textDecoration: "none",
                    transition: "background 110ms",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{info.icon}</span>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: "500" }}>{info.label}</div>
                    <div style={{ fontSize: "12px", color: "var(--accent)" }}>{info.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div style={{
            background: "var(--accent-subtle)",
            border: "1px solid oklch(63% 0.22 252 / 0.25)",
            borderRadius: "16px", padding: "20px",
          }}>
            <p style={{ fontSize: "13px", color: "var(--accent)", lineHeight: "1.6" }}>
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
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px var(--accent-subtle);
        }
        .contact-submit:hover  { background: var(--accent-hi) !important; }
        .contact-submit:active { transform: scale(0.97); }
        .contact-info-link:hover { background: var(--surface-3) !important; }
      `}</style>
    </div>
  );
}
