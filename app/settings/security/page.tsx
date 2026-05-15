"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, ApiError } from "@/lib/api-client";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";

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
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "var(--shadow-sm)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "38px",
  padding: "0 12px",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
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
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { fullWidth?: boolean }) {
  return (
    <Button variant="primary" fullWidth={fullWidth} className={className} {...props}>
      {children}
    </Button>
  );
}

function DangerButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button variant="danger" className={className} {...props}>
      {children}
    </Button>
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
    <div className="page-enter" style={{ maxWidth: "620px", margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--ff-display)", fontSize: "var(--ts-h2)", lineHeight: "var(--lh-display)", letterSpacing: "-0.02em", fontWeight: 700, color: "var(--text)" }}>
          Settings
        </h1>
        <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)", marginTop: "4px" }}>
          Manage your account, security, and preferences
        </p>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--border)", marginBottom: "28px", display: "flex", gap: "4px" }}>
        {TABS.map((tab) => {
          const active = tab === "Security";
          return (
            <a
              key={tab}
              href={TAB_HREFS[tab]}
              style={{
                padding: "10px 16px",
                fontSize: "var(--ts-body)",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--text)" : "var(--text-3)",
                borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: "-1px",
                textDecoration: "none",
                transition: "color 150ms",
              }}
            >
              {tab}
            </a>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Password card — expandable */}
        <Collapsible.Root
          className="bg-surface border border-border rounded-2xl p-5 shadow-sm"
          onOpenChange={(open) => { if (!open) { setPasswordSaved(false); setPasswordError(null); } }}
        >
          <Collapsible.Trigger asChild>
            <button
              type="button"
              className="group w-full flex items-center justify-between bg-transparent border-none cursor-pointer p-0"
            >
              <div>
                <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Password</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Change your account password</p>
              </div>
              <span className="text-lg leading-none" style={{ color: "var(--text-3)" }}>
                <span className="inline group-data-[state=open]:hidden">+</span>
                <span className="hidden group-data-[state=open]:inline">−</span>
              </span>
            </button>
          </Collapsible.Trigger>

          <Collapsible.Content>

            <form
              onSubmit={handleSubmit(onPasswordSubmit)}
              style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}
            >
              {passwordError && (
                <div style={{ background: "var(--danger-s)", border: "1px solid oklch(62% 0.21 22 / 0.3)", borderRadius: "10px", padding: "10px 14px", fontSize: "var(--ts-body-sm)", color: "var(--danger)" }}>
                  {passwordError}
                </div>
              )}
              {passwordSaved && (
                <div style={{ background: "var(--success-s)", border: "1px solid oklch(68% 0.18 152 / 0.3)", borderRadius: "10px", padding: "10px 14px", fontSize: "var(--ts-body-sm)", color: "var(--success)" }}>
                  Password updated successfully!
                </div>
              )}
              <div>
                <label style={labelStyle}>Current Password</label>
                <Input type="password" {...register("currentPassword")} placeholder="••••••••" />
                {errors.currentPassword && (
                  <p style={{ color: "var(--danger)", fontSize: "var(--ts-label)", marginTop: "4px" }}>{errors.currentPassword.message}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>New Password</label>
                <Input type="password" {...register("newPassword")} placeholder="••••••••" />
                {errors.newPassword && (
                  <p style={{ color: "var(--danger)", fontSize: "var(--ts-label)", marginTop: "4px" }}>{errors.newPassword.message}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <Input type="password" {...register("confirmPassword")} placeholder="••••••••" />
                {errors.confirmPassword && (
                  <p style={{ color: "var(--danger)", fontSize: "var(--ts-label)", marginTop: "4px" }}>{errors.confirmPassword.message}</p>
                )}
              </div>
              <PrimaryButton type="submit" disabled={isSubmitting} fullWidth>
                {isSubmitting ? "Updating…" : "Update Password"}
              </PrimaryButton>
            </form>
          </Collapsible.Content>
        </Collapsible.Root>

        {/* 2FA card */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Two-Factor Authentication</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Extra security via authenticator app</p>
            </div>
            {twoFaEnabled === true && (
              <span
                style={{
                  fontSize: "var(--ts-meta)",
                  fontWeight: 600,
                  background: "var(--success-s)",
                  color: "var(--success)",
                  borderRadius: "9999px",
                  padding: "3px 10px",
                  border: "1px solid oklch(68% 0.18 152 / 0.25)",
                }}
              >
                Active
              </span>
            )}
          </div>

          {twoFaEnabled === null && (
            <p style={{ color: "var(--text-3)", fontSize: "var(--ts-body-sm)" }}>Loading…</p>
          )}

          {twoFaEnabled === false && !qrCodeUrl && (
            <div>
              <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)", marginBottom: "14px" }}>
                Add an extra layer of security to your account using an authenticator app.
              </p>
              {totpError && (
                <p style={{ color: "var(--danger)", fontSize: "var(--ts-body-sm)", marginBottom: "12px" }}>{totpError}</p>
              )}
              <Toggle checked={false} onChange={handleEnable2FA} />
            </div>
          )}

          {qrCodeUrl && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)" }}>
                Scan the QR code with your authenticator app, then enter the 6-digit code below to confirm.
              </p>
              <div style={{ background: "#fff", padding: "12px", display: "inline-block", borderRadius: "12px", border: "1px solid var(--border)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt="2FA QR Code" style={{ width: "160px", height: "160px", display: "block" }} />
              </div>
              {totpError && (
                <p style={{ color: "var(--danger)", fontSize: "var(--ts-body-sm)" }}>{totpError}</p>
              )}
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  containerClassName="flex-1"
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)", flex: 1 }}>
                Two-factor authentication is enabled on your account.
              </p>
              <Toggle checked={true} onChange={() => {/* disable 2FA flow */}} />
            </div>
          )}
        </Card>

        {/* Sessions placeholder */}
        <Card>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Active Sessions</p>
          <p className="text-sm mt-2" style={{ color: "var(--text-3)" }}>You are currently signed in on this device.</p>
        </Card>

        {/* Danger zone */}
        <Card className="border-danger/40">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--danger)" }}>Danger Zone</p>
          <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)", marginTop: "8px", marginBottom: "16px" }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <DangerButton type="button">Delete Account</DangerButton>
        </Card>
      </div>
    </div>
  );
}
