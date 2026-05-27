"use client";

import { useState, useEffect } from "react";
import { api, ApiError } from "@/lib/api-client";
import { Btn, Input, Toggle } from "@/components/editorial";

export function TwoFactorSection() {
  const [twoFaEnabled, setTwoFaEnabled] = useState<boolean | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [totpError, setTotpError] = useState<string | null>(null);
  const [totpLoading, setTotpLoading] = useState(false);

  useEffect(() => {
    api.get<{ twoFactorEnabled?: boolean }>("/api/identity/me")
      .then((data) => setTwoFaEnabled(!!data.twoFactorEnabled))
      .catch(() => setTwoFaEnabled(false));
  }, []);

  const handleEnable2FA = async () => {
    setTotpError(null);
    try {
      const data = await api.post<{ qrCodeUrl?: string; qrCode?: string; otpAuthUrl?: string }>(
        "/api/identity/2fa/enable",
      );
      setQrCodeUrl(data.qrCodeUrl ?? data.qrCode ?? data.otpAuthUrl ?? null);
    } catch (err) {
      setTotpError(err instanceof ApiError ? err.message : "Failed to initiate 2FA setup.");
    }
  };

  const handleConfirm2FA = async () => {
    setTotpError(null);
    setTotpLoading(true);
    try {
      await api.post("/api/identity/2fa/confirm", { code: totpCode });
      setTwoFaEnabled(true);
      setQrCodeUrl(null);
      setTotpCode("");
    } catch (err) {
      setTotpError(err instanceof ApiError ? err.message : "Invalid code. Please try again.");
    } finally {
      setTotpLoading(false);
    }
  };

  return (
    <div aria-labelledby="two-factor-heading" role="region" className="bg-paper-2 p-5 border-ink">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 id="two-factor-heading" className="ed-label-muted">Two-Factor Authentication</h2>
          <p className="text-sm mt-1 text-ink-2">Extra security via authenticator app</p>
        </div>
        {twoFaEnabled === true && (
          <span
            role="status"
            className="text-sm font-semibold bg-green-soft text-green py-[3px] px-[10px]"
            style={{ border: "1px solid oklch(68% 0.18 152 / 0.25)" }}
          >
            Active
          </span>
        )}
      </div>

      {twoFaEnabled === null && (
        <p className="text-ink-3 text-base" aria-live="polite">Loading…</p>
      )}

      {twoFaEnabled === false && !qrCodeUrl && (
        <div>
          <p className="text-base text-ink-3 mb-[14px]">
            Add an extra layer of security to your account using an authenticator app.
          </p>
          {totpError && <p className="text-red text-base mb-6" role="alert">{totpError}</p>}
          <Toggle
            id="enable-2fa"
            label="Enable two-factor authentication"
            checked={false}
            onCheckedChange={handleEnable2FA}
          />
        </div>
      )}

      {qrCodeUrl && (
        <div className="flex flex-col gap-[14px]">
          <p className="text-base text-ink-3">
            Scan the QR code with your authenticator app, then enter the 6-digit code below to confirm.
          </p>
          <div className="bg-white p-6 inline-block border-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="Two-factor authentication setup QR code. If you cannot scan this code, enter the setup key manually in your authenticator app."
              className="w-[160px] h-[160px] block"
            />
          </div>
          {totpError && <p className="text-red text-base" role="alert">{totpError}</p>}
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={totpCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotpCode(e.target.value)}
              placeholder="6-digit code"
              maxLength={6}
              className="flex-1"
              aria-label="6-digit authenticator code"
            />
            <Btn variant="primary" type="button" onClick={handleConfirm2FA} disabled={totpLoading || totpCode.length < 6}>
              {totpLoading ? "Verifying…" : "Verify"}
            </Btn>
          </div>
        </div>
      )}

      {twoFaEnabled === true && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6 p-[12px_16px] border-ink bg-paper">
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-ink">Authenticator app</p>
              <p className="text-sm text-ink-3 mt-1">
                {/* TODO(handoff8): surface actual 2FA set-up date from /api/identity/me once backend exposes twoFactorEnabledAt */}
                Set up · —
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => { /* TODO(handoff8): wire to /api/identity/2fa/recovery-codes GET endpoint */ }}
                className="text-base font-medium text-ink-2 underline underline-offset-2 cursor-pointer bg-transparent border-none"
              >
                View recovery codes
              </button>
              <button
                type="button"
                onClick={() => { /* TODO(handoff8): wire to /api/identity/2fa/disable endpoint */ }}
                className="bg-transparent py-3 px-6 text-base font-semibold text-red border-[1.5px] border-red cursor-pointer"
                aria-label="Disable two-factor authentication"
              >
                Disable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
