"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, ApiError } from "@/lib/api-client";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Btn, Input, Toggle } from "@/components/editorial";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const TABS = ["Profile", "Security", "Notifications", "Connections"] as const;
type Tab = (typeof TABS)[number];

const TAB_HREFS: Record<Tab, string> = {
  Profile: "/settings/profile",
  Security: "/settings/security",
  Notifications: "/settings/notifications",
  Connections: "/settings/connections",
};

/* ── Style constants ──────────────────────────────────────────────────────── */

const cardStyle: React.CSSProperties = {
  background: "var(--paper-2)",
  border: "1.5px solid var(--ink)",
  padding: "20px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "38px",
  padding: "0 12px",
  background: "var(--paper-2)",
  border: "1.5px solid var(--ink)",
  
  color: "var(--text)",
  fontFamily: "var(--ff-body)",
  fontSize: "var(--ts-body)",
  outline: "none",
  transition: "border-color 150ms, box-shadow 150ms",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "var(--ts-label)",
  fontWeight: 500,
  color: "var(--text-2)",
  letterSpacing: "0.02em",
  marginBottom: "6px",
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: "var(--ts-meta)",
  fontWeight: 700,
  color: "var(--text-3)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

/* ── Sub-components ───────────────────────────────────────────────────────── */

function PrimaryButton({
  children,
  fullWidth,
  className,
  disabled,
  type,
  form,
  style,
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { fullWidth?: boolean }) {
  return (
    <Btn variant="primary" fullWidth={fullWidth} className={className} disabled={disabled} type={type as "button"|"submit"|"reset"} form={form} style={style as React.CSSProperties}>
      {children}
    </Btn>
  );
}

function DangerButton({
  children,
  className,
  disabled,
  type,
  onClick,
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Btn variant="danger" className={className} disabled={disabled} type={type as "button"|"submit"|"reset"} onClick={onClick as ((e: React.MouseEvent) => void) | undefined}>
      {children}
    </Btn>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function SecuritySettingsPage() {
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [twoFaEnabled, setTwoFaEnabled] = useState<boolean | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [totpError, setTotpError] = useState<string | null>(null);
  const [totpLoading, setTotpLoading] = useState(false);


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    api.get<{ twoFactorEnabled?: boolean }>("/api/identity/me")
      .then((data) => setTwoFaEnabled(!!data.twoFactorEnabled))
      .catch(() => setTwoFaEnabled(false));
  }, []);

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordError(null);
    setPasswordSaved(false);
    try {
      await api.put("/api/identity/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset();
      setPasswordSaved(true);
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Failed to update password. Check your current password.");
    }
  };

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
    <div className="page-enter max-w-[620px] mx-auto py-16 px-12" >
      {/* Header */}
      <div className="mb-[28px]">
        <h1 className="font-serif text-4xl leading-none tracking-snug font-bold text-ink">
          Settings
        </h1>
        <p className="text-base text-ink-3 mt-2">
          Manage your account, security, and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-[28px] flex gap-2" style={{ borderBottom: "1.5px solid var(--ink)" }}>
        {TABS.map((tab) => {
          const active = tab === "Security";
          return (
            <a
              key={tab}
              href={TAB_HREFS[tab]}
              className="py-5 px-8 text-md mb-[-1px] no-underline" style={{ fontWeight: active ? 600 : 400, color: active ? "var(--red)" : "var(--ink-3)", borderBottom: active ? "3px solid var(--red)" : "2px solid transparent", transition: "color 150ms" }}
            >
              {tab}
            </a>
          );
        })}
      </div>

      <div className="flex flex-col gap-8">
        {/* Password card — expandable */}
        <Collapsible.Root
          className="bg-paper-2 p-5"
          onOpenChange={(open) => { if (!open) { setPasswordSaved(false); setPasswordError(null); } }}
        >
          <Collapsible.Trigger asChild>
            <button
              type="button"
              className="group w-full flex items-center justify-between bg-transparent border-none cursor-pointer p-0"
            >
              <div>
                <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Password</p>
                <p className="text-sm mt-1 text-ink-2" >Change your account password</p>
              </div>
              <span className="text-lg leading-none text-ink-3" >
                <span className="inline group-data-[state=open]:hidden">+</span>
                <span className="hidden group-data-[state=open]:inline">−</span>
              </span>
            </button>
          </Collapsible.Trigger>

          <Collapsible.Content>

            <form
              onSubmit={handleSubmit(onPasswordSubmit)}
              className="flex flex-col gap-[14px] mt-10 pt-10" style={{ borderTop: "1.5px solid var(--ink)" }}
            >
              {passwordError && (
                <div className="bg-[rgba(178,42,26,0.10)] py-[10px] px-[14px] text-base text-red" style={{ border: "1px solid oklch(62% 0.21 22 / 0.3)" }}>
                  {passwordError}
                </div>
              )}
              {passwordSaved && (
                <div className="bg-[rgba(61,107,43,0.10)] py-[10px] px-[14px] text-base text-green" style={{ border: "1px solid oklch(68% 0.18 152 / 0.3)" }}>
                  Password updated successfully!
                </div>
              )}
              <div>
                <label style={labelStyle}>Current Password</label>
                <Input type="password" {...register("currentPassword")} placeholder="••••••••" />
                {errors.currentPassword && (
                  <p className="text-red text-base mt-2">{errors.currentPassword.message}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>New Password</label>
                <Input type="password" {...register("newPassword")} placeholder="••••••••" />
                {errors.newPassword && (
                  <p className="text-red text-base mt-2">{errors.newPassword.message}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <Input type="password" {...register("confirmPassword")} placeholder="••••••••" />
                {errors.confirmPassword && (
                  <p className="text-red text-base mt-2">{errors.confirmPassword.message}</p>
                )}
              </div>
              <PrimaryButton type="submit" disabled={isSubmitting} fullWidth>
                {isSubmitting ? "Updating…" : "Update Password"}
              </PrimaryButton>
            </form>
          </Collapsible.Content>
        </Collapsible.Root>

        {/* 2FA card */}
        <div className="bg-paper-2 p-5" style={{ border: "1.5px solid var(--ink)" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3" >Two-Factor Authentication</p>
              <p className="text-sm mt-1 text-ink-2" >Extra security via authenticator app</p>
            </div>
            {twoFaEnabled === true && (
              <span
                className="text-sm font-semibold bg-[rgba(61,107,43,0.10)] text-green py-[3px] px-[10px]" style={{ border: "1px solid oklch(68% 0.18 152 / 0.25)" }}
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
              {totpError && (
                <p className="text-red text-base mb-6">{totpError}</p>
              )}
              <Toggle checked={false} onCheckedChange={handleEnable2FA} />
            </div>
          )}

          {qrCodeUrl && (
            <div className="flex flex-col gap-[14px]">
              <p className="text-base text-ink-3">
                Scan the QR code with your authenticator app, then enter the 6-digit code below to confirm.
              </p>
              <div className="bg-white p-6 inline-block" style={{ border: "1.5px solid var(--ink)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-[160px] h-[160px] block" />
              </div>
              {totpError && (
                <p className="text-red text-base">{totpError}</p>
              )}
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={totpCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="flex-1"
                />
                <PrimaryButton
                  type="button"
                  onClick={handleConfirm2FA}
                  disabled={totpLoading || totpCode.length < 6}
                >
                  {totpLoading ? "Verifying…" : "Verify"}
                </PrimaryButton>
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

        {/* Sessions placeholder */}
        <div className="bg-paper-2 p-5" style={{ border: "1.5px solid var(--ink)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3" >Active Sessions</p>
          <p className="text-sm mt-2 text-ink-3" >You are currently signed in on this device.</p>
        </div>

        {/* Danger zone */}
        <div className="bg-paper-2 p-5" style={{ border: "1.5px solid var(--red)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-red" >Danger Zone</p>
          <p className="text-base text-ink-3 mt-4 mb-8">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <DangerButton type="button">Delete Account</DangerButton>
        </div>
      </div>
    </div>
  );
}
