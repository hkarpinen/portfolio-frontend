import { Btn } from "@/components/editorial";
import Image from "next/image";

import { SKILLS } from "./landing-config";

/**
 * "Hi, I'm Hank Karpinen." — bio + headshot + skills grid.
 *
 * Sits between the modules grid and the hiring banner: what's built ->
 * how -> who -> let's work together. `id="about"` so the top nav can
 * anchor-link here.
 */
export function LandingAboutSection() {
  return (
    <section id="about" className="ed-landing-section" aria-labelledby="about-engineer-heading">
      <div className="ed-section-row">
        <h2 id="about-engineer-heading" className="ed-h3">
          Hi, I&apos;m <em>Hank Karpinen</em>.
        </h2>
      </div>

      <div className="flex flex-col items-start gap-8 md:flex-row md:gap-10">
        <div className="flex w-full shrink-0 justify-center md:w-auto md:justify-start">
          <div
            className="overflow-hidden border-[1.5px] border-ink"
            style={{ width: 200, height: 200 }}
          >
            <Image
              src="/hank_headshot.jpeg"
              alt="Hank Karpinen"
              width={200}
              height={200}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <p className="ed-deck" style={{ marginTop: 0 }}>
            Full-stack engineer based in Pullman, WA. AWS certified, 4+ years experience. Open to
            senior &amp; staff roles.
          </p>

          <div className="flex flex-wrap gap-3">
            <Btn asChild variant="secondary" size="md">
              <a href="/cv.pdf" download="Hank-Karpinen-CV.pdf">
                Download CV
              </a>
            </Btn>
            <Btn asChild variant="ghost" size="md">
              <a href="mailto:hank@stackgazette.dev">hank@stackgazette.dev</a>
            </Btn>
          </div>
        </div>
      </div>

      <ul
        className="mt-10 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3"
        aria-label="Skills and tools"
      >
        {SKILLS.map((group) => (
          <li key={group.label} className="flex flex-col gap-2.5">
            <h3
              className="font-700 font-mono text-sm uppercase tracking-[0.12em]"
              style={{ color: "var(--red)" }}
            >
              {group.label}
            </h3>
            <ul className="flex flex-wrap gap-1.5" aria-label={`${group.label} skills`}>
              {group.items.map((item) => (
                <li
                  key={item}
                  className="font-700 border border-ink-3 px-2 py-0.5 font-mono text-[0.72rem] uppercase tracking-[0.10em]"
                  style={{ color: "var(--ink-2)" }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
