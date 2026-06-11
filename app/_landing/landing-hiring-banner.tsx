"use client";

import { Btn, Icon } from "@/components/editorial";
import { useState } from "react";

/**
 * Dark hiring banner — kicker + "Let's work together" CTA + inline
 * contact-email capture. Owns its own `contactEmail` state since this is
 * the only place it's needed; the rest of the landing can stay server.
 */
export function LandingHiringBanner() {
  const [contactEmail, setContactEmail] = useState("");

  return (
    <section className="ed-banner-dark" aria-label="Hiring — get in touch">
      <div className="min-w-[240px] flex-1">
        <p className="ed-kicker">Currently open to roles</p>
        <p className="ed-h3 ed-banner-dark-title">
          Let&apos;s <em>work</em> together.
        </p>
        <p className="mt-2 font-mono text-sm uppercase tracking-[0.12em] text-[var(--paper)] opacity-80">
          Senior &amp; staff full-stack · Remote, hybrid, or onsite · Pullman, WA
        </p>
      </div>
      <div className="border-paper/30 flex w-full items-stretch gap-0 border-[1.5px] sm:w-auto sm:shrink-0">
        <label htmlFor="contact-email" className="sr-only">
          Your email address
        </label>
        <input
          id="contact-email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="your@email.com"
          className="placeholder:text-paper/40 min-w-0 flex-1 border-none bg-transparent px-4 py-3 font-mono text-sm tracking-[0.1em] text-paper outline-none sm:min-w-[200px]"
          autoComplete="email"
        />
        <Btn
          href={`/contact${contactEmail ? `?email=${encodeURIComponent(contactEmail)}` : ""}`}
          variant="primary"
          size="lg"
          className="shrink-0"
          iconRight={<Icon name="arrowRight" size={14} strokeWidth={2} />}
        >
          Get in touch
        </Btn>
      </div>
    </section>
  );
}
