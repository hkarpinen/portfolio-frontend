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
    <div className="bg-paper-2 shadow-stamp py-20 px-16 text-center border-ink">
      {status === "loading" && (
        <>
          <div className="w-[56px] h-[56px]" style={{ border: "2px solid var(--ink-4)", borderTopColor: "var(--ink)", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
          <p className="font-mono text-sm text-ink-3 uppercase tracking-wide">Confirming your email…</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-[56px] h-[56px] bg-green-soft flex items-center justify-center" style={{ margin: "0 auto 20px", border: "1.5px solid var(--green)" }}>
            <span style={{ color: "var(--green)" }}><Icon name="check" size={24} strokeWidth={2} /></span>
          </div>
          <h1 className="font-serif italic font-normal text-3xl tracking-[-0.025em] text-ink mb-4">Email confirmed<span className="text-red">.</span></h1>
          <p className="text-base text-ink-3 leading-[1.6] mb-[28px]">{message}</p>
          <Btn href="/login" variant="primary">Sign in</Btn>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-[56px] h-[56px] bg-red-soft flex items-center justify-center" style={{ margin: "0 auto 20px", border: "1.5px solid var(--red)" }}>
            <span style={{ color: "var(--red)" }}><Icon name="x" size={24} strokeWidth={2} /></span>
          </div>
          <h1 className="font-serif italic font-normal text-3xl tracking-[-0.025em] text-ink mb-4">Confirmation failed<span className="text-red">.</span></h1>
          <p className="text-base text-ink-3 leading-[1.6] mb-[28px]">{message}</p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Btn href="/register" variant="primary">Try again</Btn>
            <Btn href="/login" variant="secondary">Back to sign in</Btn>
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
        <div className="bg-paper-2 py-20 px-16 shadow-stamp text-center border-ink">
          <div className="w-[48px] h-[48px] mx-auto" style={{ border: "2px solid var(--ink-4)", borderTopColor: "var(--ink)", animation: "spin 0.8s linear infinite" }} />
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}