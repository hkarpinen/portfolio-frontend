import type { Metadata } from "next";
import Link from "next/link";
import { requireAnonymous } from "@/lib/auth/session";

/** Auth routes (login/register/etc.) add no SEO value — keep them out of
 *  the index so search results show the public landing instead. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  await requireAnonymous();

  return (
    <div className="ed-auth-split">
      {/* Left panel — dark ink */}
      <div className="ed-auth-left">
        <Link href="/" className="ed-auth-brand">
          <span className="ed-sidebar-mark">SG</span>
          <span className="ed-auth-brand-name">
            The Stack <em>&amp;</em> Gazette
          </span>
        </Link>

        <div className="ed-auth-left-foot">
          <p className="ed-auth-tagline">
            A full-stack app,
            <br />
            <em>built from scratch.</em>
          </p>
          <ul className="ed-auth-bullets">
            <li>Six services · Thirty screens</li>
            <li>Hand-rolled auth · RabbitMQ pipelines</li>
            <li>Hiring me costs more than the demo</li>
          </ul>
        </div>
      </div>

      {/* Right panel — paper */}
      <div className="ed-auth-right">
        <div className="ed-auth-back-row">
          <Link href="/" className="ed-auth-back">
            ← Back to landing
          </Link>
        </div>
        <div className="ed-auth-right-body">{children}</div>
      </div>
    </div>
  );
}
