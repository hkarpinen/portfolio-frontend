"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { startDemo } from "@/lib/api/identity";
import { checkDemoReady } from "@/lib/api/households";

const DEMO_EXPIRES_AT_KEY = "demo_expires_at";
const POLL_INTERVAL_MS = 1500;
const TIMEOUT_MS = 15_000;

export default function DemoPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"starting" | "seeding" | "error">("starting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const didStart = useRef(false);

  useEffect(() => {
    if (didStart.current) return;
    didStart.current = true;

    async function run() {
      try {
        const { demoExpiresAt } = await startDemo();
        localStorage.setItem(DEMO_EXPIRES_AT_KEY, demoExpiresAt);
        setStatus("seeding");

        const deadline = Date.now() + TIMEOUT_MS;

        while (Date.now() < deadline) {
          await sleep(POLL_INTERVAL_MS);
          const { ready } = await checkDemoReady();
          if (ready) {
            router.replace("/bills");
            return;
          }
        }

        // Timeout — redirect anyway; data may arrive shortly after.
        router.replace("/bills");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setErrorMessage(message);
        setStatus("error");
      }
    }

    run();
  }, [router]);

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="text-center max-w-sm">
          <p className="font-mono text-sm uppercase tracking-widest text-ink/60 mb-2">Demo</p>
          <p className="font-body text-base text-ink mb-6">{errorMessage}</p>
          <a href="/" className="font-mono text-sm uppercase tracking-widest underline">
            Back to home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="text-center max-w-sm">
        <p className="font-mono text-sm uppercase tracking-widest text-ink/60 mb-2">Demo</p>
        <p className="font-serif text-2xl italic mb-6">
          {status === "starting" ? "Starting your demo…" : "Setting things up…"}
        </p>
        <Spinner />
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <div
      className="inline-block h-5 w-5 border-2 border-ink/30 border-t-ink rounded-full animate-spin"
      aria-label="Loading"
    />
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
