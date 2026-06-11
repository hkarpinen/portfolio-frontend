"use client";

import { Btn, Icon } from "@/components/editorial";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { startDemo } from "@/lib/api/identity";
import { checkDemoReady } from "@/lib/api/households";
import { RecaptchaScript, useRecaptcha } from "@/components/recaptcha";

import { ERROR } from "@/lib/error-messages";

const DEMO_EXPIRES_AT_KEY = "demo_expires_at";
const POLL_INTERVAL_MS = 1500;
const TIMEOUT_MS = 15_000;

type Status = "starting" | "seeding" | "error";
type StepState = "done" | "active" | "pending";

function StepRow({ state, label }: { state: StepState; label: string }) {
  const stateLabel = state === "done" ? "Complete" : state === "active" ? "In progress" : "Pending";
  return (
    <li className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={
          "flex h-5 w-5 shrink-0 items-center justify-center border-[1.5px] " +
          (state === "done"
            ? "border-green bg-green-soft text-green"
            : state === "active"
              ? "border-red text-red"
              : "border-ink-4 text-transparent")
        }
      >
        {state === "done" && <Icon name="check" size={13} strokeWidth={2.5} />}
        {state === "active" && <span className="h-2 w-2 animate-pulse bg-red" aria-hidden="true" />}
      </span>
      <span className={"ed-label-muted " + (state === "pending" ? "opacity-60" : "")}>
        {label}
        <span className="sr-only"> — {stateLabel}</span>
      </span>
    </li>
  );
}

export default function DemoPage() {
  const router = useRouter();
  const executeRecaptcha = useRecaptcha();
  const [status, setStatus] = useState<Status>("starting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const didStart = useRef(false);

  useEffect(() => {
    if (didStart.current) return;
    didStart.current = true;

    async function run() {
      try {
        const captchaToken = await executeRecaptcha("demo_start");
        const { demoExpiresAt } = await startDemo(captchaToken);
        localStorage.setItem(DEMO_EXPIRES_AT_KEY, demoExpiresAt);
        setStatus("seeding");

        const deadline = Date.now() + TIMEOUT_MS;

        while (Date.now() < deadline) {
          await sleep(POLL_INTERVAL_MS);
          const { ready } = await checkDemoReady();
          if (ready) {
            router.replace("/household");
            return;
          }
        }

        router.replace("/household");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : ERROR.DEFAULT;
        setErrorMessage(message);
        setStatus("error");
      }
    }

    run();
  }, [router, executeRecaptcha]);

  const seeding = status === "seeding";

  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="ed-card w-full max-w-[520px] text-center">
          {status === "error" ? (
            <div role="alert">
              <p className="ed-kicker mb-3">Demo</p>
              <h1 className="ed-h1 mb-4">
                Couldn&apos;t start the <em>demo.</em>
              </h1>
              <p className="ed-deck mb-8">{errorMessage}</p>
              <Btn href="/" variant="secondary" size="lg">
                Back to home
              </Btn>
            </div>
          ) : (
            <>
              <p className="ed-kicker mb-3">Spinning up your demo</p>
              <h1 className="ed-h1 mb-3">
                You&apos;re <em>in.</em>
              </h1>
              <p className="ed-deck mb-8">
                Provisioning a sandboxed household with seeded data. About three seconds.
              </p>

              {/* Progress steps — live region announces current step to screen readers */}
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label="Demo setup progress"
                className="mx-auto mb-8 flex max-w-[320px] flex-col gap-3 text-left"
              >
                <ul className="flex list-none flex-col gap-3" aria-label="Setup steps">
                  <StepRow state={seeding ? "done" : "active"} label="reCAPTCHA cleared" />
                  <StepRow state={seeding ? "done" : "pending"} label="Sandbox account created" />
                  <StepRow
                    state={seeding ? "active" : "pending"}
                    label="Demo household seeded · 3 roommates"
                  />
                  <StepRow state="pending" label="Redirecting to dashboard" />
                </ul>
              </div>

              <p className="ed-meta mb-6">
                This is a sandboxed environment — data resets nightly and is not suitable for real
                data.
              </p>

              <Btn href="/household" variant="primary" size="lg" fullWidth>
                Skip to dashboard
              </Btn>

              <p className="ed-hint mt-6">
                Like what you see?{" "}
                <Link href="/identity/register" className="font-semibold text-red">
                  Create a free account{" "}
                  <Icon name="arrowRight" size={13} strokeWidth={2} className="inline align-[-2px]" />
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
      <RecaptchaScript strategy="afterInteractive" />
    </>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
