"use client";

import { Btn, Input, Toggle } from "@/components/editorial";
import { useState } from "react";
import { useMe, useEnable2FA, useConfirm2FA } from "@/hooks/use-identity";
import { getErrorMessage } from "@/lib/error-messages";

export function TwoFactorSection() {
  // The `Me` query is the single source of truth for whether 2FA is enabled —
  // it's the same query the topbar/sidebar consume, so toggling 2FA here lights
  // up everywhere via cache invalidation in the hooks.
  const { data: me } = useMe();
  const twoFaEnabled = me?.twoFactorEnabled ?? null;

  const [totpCode, setTotpCode] = useState("");

  const enable2FA = useEnable2FA();
  const confirm2FA = useConfirm2FA();

  // The QR-code URL is just a projection of the enable mutation's result —
  // no parallel state needed. Resetting the mutation after confirm clears it.
  const qrCodeUrl = enable2FA.data
    ? (enable2FA.data.qrCodeUrl ?? enable2FA.data.qrCode ?? enable2FA.data.otpAuthUrl ?? null)
    : null;

  const totpError = enable2FA.isError
    ? getErrorMessage(enable2FA.error, "Failed to initiate 2FA setup.")
    : confirm2FA.isError
      ? getErrorMessage(confirm2FA.error, "Invalid code. Please try again.")
      : null;

  const handleEnable2FA = () => enable2FA.mutate();

  const handleConfirm2FA = () => {
    confirm2FA.mutate(totpCode, {
      onSuccess: () => {
        // Drop the QR by clearing the enable mutation's cached result.
        enable2FA.reset();
        setTotpCode("");
      },
    });
  };

  return (
    <div aria-labelledby="two-factor-heading" role="region" className="border-ink bg-paper-2 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 id="two-factor-heading" className="ed-label-muted">
            Two-Factor Authentication
          </h2>
          <p className="mt-1 text-sm text-ink-2">Extra security via authenticator app</p>
        </div>
        {twoFaEnabled === true && (
          <span
            role="status"
            className="bg-green-soft px-5 py-1.5 text-sm font-semibold text-green"
            style={{ border: "1px solid oklch(68% 0.18 152 / 0.25)" }}
          >
            Active
          </span>
        )}
      </div>

      {twoFaEnabled === null && (
        <p className="text-base text-ink-3" aria-live="polite">
          Loading…
        </p>
      )}

      {twoFaEnabled === false && !qrCodeUrl && (
        <div>
          <p className="mb-7 text-base text-ink-3">
            Add an extra layer of security to your account using an authenticator app.
          </p>
          {totpError && (
            <p className="mb-6 text-base text-red" role="alert">
              {totpError}
            </p>
          )}
          <Toggle
            id="enable-2fa"
            label="Enable two-factor authentication"
            checked={false}
            onCheckedChange={handleEnable2FA}
          />
        </div>
      )}

      {qrCodeUrl && (
        <div className="flex flex-col gap-7">
          <p className="text-base text-ink-3">
            Scan the QR code with your authenticator app, then enter the 6-digit code below to
            confirm.
          </p>
          <div className="inline-block border-ink bg-white p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="Two-factor authentication setup QR code. If you cannot scan this code, enter the setup key manually in your authenticator app."
              className="block h-[160px] w-[160px]"
            />
          </div>
          {totpError && (
            <p className="text-base text-red" role="alert">
              {totpError}
            </p>
          )}
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
            <Btn
              variant="primary"
              type="button"
              onClick={handleConfirm2FA}
              disabled={confirm2FA.isPending || totpCode.length < 6}
            >
              {confirm2FA.isPending ? "Verifying…" : "Verify"}
            </Btn>
          </div>
        </div>
      )}

      {twoFaEnabled === true && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6 border-ink bg-paper p-[12px_16px]">
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-ink">Authenticator app</p>
              <p className="mt-1 text-sm text-ink-3">
                {/* TODO(handoff8): surface actual 2FA set-up date from /api/identity/me once backend exposes twoFactorEnabledAt */}
                Set up · —
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Btn
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  /* TODO(handoff8): wire to /api/identity/2fa/recovery-codes GET endpoint */
                }}
              >
                View recovery codes
              </Btn>
              <Btn
                variant="danger"
                size="sm"
                type="button"
                onClick={() => {
                  /* TODO(handoff8): wire to /api/identity/2fa/disable endpoint */
                }}
                aria-label="Disable two-factor authentication"
              >
                Disable
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
