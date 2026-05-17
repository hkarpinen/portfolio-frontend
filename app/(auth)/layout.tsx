import Link from "next/link";
import { requireAnonymous } from "@/lib/auth/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Already-signed-in users have no business on /login or /login/2fa; bounce server-side.
  await requireAnonymous();

  return (
    <div className="min-h-[100vh] bg-paper flex flex-col">
      {/* Masthead strip */}
      <header className="p-[20px_5%] flex items-baseline justify-between gap-8" style={{ borderBottom: "3px solid var(--ink)" }}>
        <Link href="/" className="no-underline">
          <span className="font-serif italic text-2xl tracking-tight leading-none text-ink">
            The Stack<span className="text-red">.</span>
          </span>
        </Link>
        <span className="font-mono text-sm text-ink-3 uppercase tracking-wide">
          Vol. I · No. 04
        </span>
      </header>

      <div style={{ borderBottom: "1px solid var(--ink-4)" }} />

      {/* Content — centered column */}
      <div className="flex-1 flex items-center justify-center py-24 px-8">
        <div className="w-full max-w-[420]">
          {/* Column label */}
          <div className="mb-12 flex items-center gap-5">
            <span className="w-[22] h-[1] bg-red inline-block" />
            <span className="font-mono text-sm text-red uppercase tracking-[0.30em]">
              Reader access
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>

  );
}
