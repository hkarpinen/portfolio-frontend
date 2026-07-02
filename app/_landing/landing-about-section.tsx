import { Btn } from "@/components/editorial";
import Image from "next/image";

import { SKILLS } from "./landing-config";

/**
 * THE_ENGINEER — bio + headshot + skills grid.
 *
 * Mirrors the Terminus landing `.public-section` bio block: kicker +
 * "Hi, I'm Hank Karpinen." headline, a portrait-and-deck row with a
 * `.cta-row`, then the `.skills-grid` of six labelled `.chips` groups.
 * `id="about"` so the top nav can anchor-link here.
 */
export function LandingAboutSection() {
  return (
    <section id="about" className="public-section" aria-labelledby="about-engineer-heading">
      <div className="kicker" style={{ marginBottom: 8 }}>
        // ABOUT ME
      </div>
      <h2 id="about-engineer-heading" style={{ marginBottom: 18 }}>
        Hi, I&apos;m Hank Karpinen.
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 24,
          alignItems: "start",
          marginBottom: 28,
        }}
      >
        <div
          className="overflow-hidden"
          style={{ width: 72, height: 72, border: "2px solid var(--amber)" }}
        >
          <Image
            src="/hank_headshot.jpeg"
            alt="Hank Karpinen"
            width={72}
            height={72}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="deck" style={{ margin: 0, maxWidth: "60ch" }}>
            Full-stack software engineer based in Pullman, WA. I started in QA, moved into building
            software, and now modernize older systems into modern, scalable apps. AWS Certified
            Solutions Architect and ScrumMaster, 4+ years&apos; experience. Open to senior &amp;
            staff roles.
          </p>
          <div className="cta-row" style={{ marginTop: 16 }}>
            <Btn asChild variant="secondary">
              <a href="/cv.pdf" download="Hank-Karpinen-CV.pdf">
                $ download-cv
              </a>
            </Btn>
            <Btn asChild variant="ghost">
              <a href="mailto:contact@hankkarpinen.com">contact@hankkarpinen.com</a>
            </Btn>
          </div>
        </div>
      </div>

      <div className="skills-grid">
        {SKILLS.map((group) => (
          <div key={group.label}>
            <h4>{group.label}</h4>
            <div className="chips" aria-label={`${group.label} skills`}>
              {group.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
