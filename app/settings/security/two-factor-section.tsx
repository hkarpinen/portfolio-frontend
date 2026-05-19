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
    <div className="bg-paper-2 p-5 border-ink">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3">Two-Factor Authentication</p>
          <p className="text-sm mt-1 text-ink-2">Extra security via authenticator app</p>
        </div>
        {twoFaEnabled === true && (
          <span
            className="text-sm font-semibold bg-green-soft text-green py-[3px] px-[10px]"
            style={{ border: "1px solid oklch(68% 0.18 152 / 0.25)" }}
          >
            Active
          </span>
        )}
      </div>

      {twoFaEnabled === null && (
        <p className="text-ink-3 text-base">Loading…</p>
      )}

      {twoFaEnabled === false && !qrCodeUrl && (
        <div>
          <p className="text-base text-ink-3 mb-[14px]">
            Add an extra layer of security to your account using an authenticator app.
          </p>
          {totpError && <p className="text-red text-base mb-6">{totpError}</p>}
          <Toggle checked={false} onCheckedChange={handleEnable2FA} />
        </div>
      )}

      {qrCodeUrl && (
        <div className="flex flex-col gap-[14px]">
          <p className="text-base text-ink-3">
            Scan the QR code with your authenticator app, then enter the 6-digit code below to confirm.
          </p>
          <div className="bg-white p-6 inline-block border-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCodeUrl} alt="2FA QR Code" className="w-[160px] h-[160px] block" />
          </div>
          {totpError && <p className="text-red text-base">{totpError}</p>}
          <div className="flex gap-2">
            <Input
              type="text"
              value={totpCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotpCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="flex-1"
            />
            <Btn variant="primary" type="button" onClick={handleConfirm2FA} disabled={totpLoading || totpCode.length < 6}>
              {totpLoading ? "Verifying…" : "Verify"}
            </Btn>
          </div>
        </div>
      )}

      {twoFaEnabled === true && (
        <div className="flex items-center gap-6">
          <p className="text-base text-ink-3 flex-1">
            Two-factor authentication is enabled on your account.
          </p>
          <Toggle checked={true} onCheckedChange={() => {}} />
        </div>
      )}
    </div>
  );
}
