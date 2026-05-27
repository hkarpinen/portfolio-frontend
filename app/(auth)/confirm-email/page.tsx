"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { Btn, Icon } from "@/components/editorial";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  useEffect(() => {
    if (!token || !userId) {
      setStatus("error");
      setMessage("Missing token or userId in the confirmation link.");
      return;
    }

    api.post("/api/identity/confirm-email", { userId, token })
      .then(() => {
        setStatus("success");
        setMessage("Your email has been confirmed. You can now sign in.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "Network error. Please try again.");
      });
  }, [token, userId]);

  return (
    <div className="ed-auth-card text-center">
      {status === "loading" && (
        <>
          {/* Spinner: composite border + animation combo has no single Tailwind equivalent — kept inline */}
          <div role="status" aria-label="Confirming your email, please wait" className="w-[56px] h-[56px] mx-auto mb-10" style={{ border: "2px solid var(--ink-4)", borderTopColor: "var(--ink)", animation: "spin 0.8s linear infinite" }} />
          <p className="ed-label-muted" aria-live="polite">Confirming your email…</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-[56px] h-[56px] bg-green-soft flex items-center justify-center mx-auto mb-10 border border-green">
            <span className="text-green"><Icon name="check" size={24} strokeWidth={2} /></span>
          </div>
          <h1 className="ed-h1 mb-4">Email confirmed<span className="text-red">.</span></h1>
          <p className="text-base text-ink-3 leading-[1.6] mb-[28px]">{message}</p>
          <Btn href="/login" variant="primary">Sign in</Btn>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-[56px] h-[56px] bg-red-soft flex items-center justify-center mx-auto mb-10 border border-red">
            <span className="text-red"><Icon name="x" size={24} strokeWidth={2} /></span>
          </div>
          <p className="ed-kicker mb-2 text-red">Confirmation failed</p>
          <h1 className="ed-h1 mb-4">Link expired <em>or</em> invalid.</h1>
          <p className="text-base text-ink-3 leading-[1.6] mb-4">{message}</p>
          <p className="ed-label-muted mb-8 leading-relaxed">
            Confirmation links expire after 24 hours. Sign in to request a new one, or register again if you haven&apos;t yet.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Btn href="/login" variant="primary">Sign in to resend</Btn>
            <Btn href="/register" variant="secondary">Register again</Btn>
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
          <div className="w-[48px] h-[48px] mx-auto" style={{ border: "2px solid var(--ink-4)", borderTopColor: "var(--ink)", animation: "spin 0.8s linear infinite" }} />
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}