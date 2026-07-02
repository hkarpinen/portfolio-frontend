import { Btn, Icon } from "@/components/editorial";

/**
 * WHAT I BRING — the recruiter-facing "why hire me" section.
 *
 * Translates the technical achievement (a production-grade app built solo)
 * into plain-language strengths a hiring manager or HR screener can read.
 * The deep technical version lives one click away on /about/architecture.
 */
const CLAIMS: [string, string, string][] = [
  [
    "No. 01",
    "Ships end-to-end",
    "I'm comfortable across the whole stack — the interface, the APIs behind it, the database, the cloud, and the deployment. I can take a feature from an idea to running in production on my own.",
  ],
  [
    "No. 02",
    "Modernizes legacy systems",
    "My day job is turning old, hard-to-maintain systems into modern, scalable ones — the kind of work that keeps a business moving instead of stalling on a rewrite that never ships.",
  ],
  [
    "No. 03",
    "Quality-minded by training",
    "I started in QA, so I build with testing, reliability, and the tricky edge cases in mind from day one — not bolted on at the end.",
  ],
  [
    "No. 04",
    "Communicates and leads",
    "Certified ScrumMaster. I run agile ceremonies, scope work directly with stakeholders, and keep non-technical partners in the loop the whole way through.",
  ],
];

export function LandingArchitectureSection() {
  return (
    <section className="public-section" aria-labelledby="bring-heading">
      <div className="head">
        <div>
          <div className="kicker" style={{ marginBottom: 8 }}>
            // WHAT I BRING
          </div>
          <h2 id="bring-heading">More than someone who writes code.</h2>
        </div>
        <Btn
          href="/about/architecture"
          variant="secondary"
          iconRight={<Icon name="arrowRight" size={13} strokeWidth={2} />}
        >
          Technical deep-dive
        </Btn>
      </div>
      <p className="sub">
        This site isn&apos;t a tutorial project — it&apos;s production-quality software I designed,
        built, and shipped on my own. Here&apos;s what that says about how I&apos;d work on your
        team. (Engineers: the technical breakdown is one click away.)
      </p>
      <div className="claims">
        {CLAIMS.map(([num, title, body]) => (
          <article key={num} className="claim">
            <span className="num">{num}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
