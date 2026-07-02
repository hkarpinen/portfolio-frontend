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
    <div className="auth-grid">
      {/* Aside — brand lockup + pitch (hidden < 960px) */}
      <aside className="auth-aside">
        <Link href="/" className="lockup">
          <span className="mark">// HK</span>
          <span className="name">Hank Karpinen</span>
        </Link>

        <p className="pitch">
          A full-stack app,
          <br />
          <em>built from scratch.</em>
        </p>
        <div className="font-mono text-[0.72rem] leading-[1.9] text-ink-3">
          Seven .NET 8 services
          <br />
          Thirty screens
          <br />
          Hand-rolled auth
          <br />
          RabbitMQ event mesh
        </div>

        <div className="foot">
          // demo session available — no account required
          <br />
          three seconds in
        </div>
      </aside>

      {/* Main — form column */}
      <main id="main" className="auth-main-col">
        <div className="auth-wrap">
          <Link href="/" className="back">
            ← / home
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
