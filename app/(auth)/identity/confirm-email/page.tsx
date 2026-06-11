"use client";

import { Btn, Icon } from "@/components/editorial";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useConfirmEmail } from "@/hooks/use-identity";
import { getErrorMessage } from "@/lib/error-messages";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const confirm = useConfirmEmail();
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  // Fire the mutation once when the page mounts with valid params. The four
  // render states (loading / success / error / missing-params) derive directly
  // from the mutation status — no parallel useState needed.
  useEffect(() => {
    if (token && userId) {
      confirm.mutate({ userId, token });
    }
    // We intentionally fire once per (userId, token) pair, not on every
    // identity change of `confirm`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId]);

  const missingParams = !token || !userId;
  const status: "loading" | "success" | "error" = missingParams
    ? "error"
    : confirm.isSuccess
      ? "success"
      : confirm.isError
        ? "error"
        : "loading";
  const message = missingParams
    ? "Missing token or userId in the confirmation link."
    : confirm.isError
      ? getErrorMessage(confirm.error, "Network error. Please try again.")
      : "Your email has been confirmed. You can now sign in.";

  return (
    <div className="ed-auth-card text-center">
      {status === "loading" && (
        <>
          {/* Spinner: composite border + animation combo has no single Tailwind equivalent — kept inline */}
          <div
            role="status"
            aria-label="Confirming your email, please wait"
            className="mx-auto mb-10 h-28 w-28"
            style={{
              border: "2px solid var(--ink-4)",
              borderTopColor: "var(--ink)",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p className="ed-label-muted" aria-live="polite">
            Confirming your email…
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="mx-auto mb-10 flex h-28 w-28 items-center justify-center border border-green bg-green-soft">
            <span className="text-green">
              <Icon name="check" size={24} strokeWidth={2} />
            </span>
          </div>
          <h1 className="ed-h1 mb-4">
            Email confirmed<span className="text-red">.</span>
          </h1>
          <p className="mb-14 text-base leading-[1.6] text-ink-3">{message}</p>
          <Btn href="/identity/login" variant="primary">
            Sign in
          </Btn>
        </>
      )}

      {status === "error" && (
        <>
          <div className="ed-medallion ed-medallion-bordered mx-auto mb-10">
            <span className="text-red">
              <Icon name="x" size={24} strokeWidth={2} />
            </span>
          </div>
          <p className="ed-kicker mb-2 text-red">Confirmation failed</p>
          <h1 className="ed-h1 mb-4">
            Link expired <em>or</em> invalid.
          </h1>
          <p className="mb-4 text-base leading-[1.6] text-ink-3">{message}</p>
          <p className="ed-label-muted mb-8 leading-relaxed">
            Confirmation links expire after 24 hours. Sign in to request a new one, or register
            again if you haven&apos;t yet.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Btn href="/identity/login" variant="primary">
              Sign in to resend
            </Btn>
            <Btn href="/identity/register" variant="secondary">
              Register again
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="ed-auth-card text-center">
          {/* Spinner: composite border + animation combo has no single Tailwind equivalent — kept inline */}
          <div
            className="mx-auto h-24 w-24"
            style={{
              border: "2px solid var(--ink-4)",
              borderTopColor: "var(--ink)",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
