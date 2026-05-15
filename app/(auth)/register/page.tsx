"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { registerSchema, RegisterInput } from "@/schemas/auth";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

function PasswordStrength({ password }: { password: string }) {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score = [len >= 8, hasUpper && hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const colors = ["var(--danger)", "var(--danger)", "var(--warning)", "var(--warning)", "var(--success)"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ display: "flex", gap: "3px" }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: "3px", borderRadius: "9999px",
            background: i < score ? colors[score] : "var(--surface-3)",
            transition: "background 220ms",
          }} />
        ))}
      </div>
      {score > 0 && (
        <span style={{ fontSize: "var(--ts-meta)", color: colors[score] }}>{labels[score]}</span>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "var(--ts-label)", fontWeight: "500", color: "var(--text-2)", letterSpacing: "0.02em" }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: "var(--ts-meta)", color: "var(--danger)" }}>{error}</span>}
    </div>
  );
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  height: "38px",
  width: "100%",
  background: "var(--surface-2)",
  border: `1px solid ${hasError ? "var(--danger)" : "var(--border)"}`,
  borderRadius: "12px",
  padding: "0 12px",
  fontSize: "var(--ts-body-sm)",
  color: "var(--text)",
  outline: "none",
  transition: "border-color 110ms, box-shadow 110ms",
});

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwValue, setPwValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    try {
      await api.post("/api/identity/register", {
        email: data.email,
        displayName: data.displayName,
        password: data.password,
      });
      setSubmitted(true);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Registration failed. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div style={{
        background: "var(--paper-2)",
        border: "1.5px solid var(--ink)",
        boxShadow: "var(--shadow-stamp)",
        padding: "40px 32px",
        textAlign: "center",
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "16px",
          background: "var(--success-s)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "var(--ts-card-h)", letterSpacing: "-0.025em", color: "var(--text)", marginBottom: "8px" }}>
          Check your inbox
        </h1>
        <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)", lineHeight: "1.6", marginBottom: "24px" }}>
          We&apos;ve sent a confirmation link to your email. Click it to activate your account.
        </p>
        <Link href="/login" style={{
          fontSize: "var(--ts-body-sm)", color: "var(--accent)", fontWeight: "500", textDecoration: "none",
        }}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--paper-2)",
      border: "1.5px solid var(--ink)",
      boxShadow: "var(--shadow-stamp)",
      padding: "32px",
    }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{
          fontFamily: "var(--ff-serif)", fontStyle: "italic", fontWeight: 400,
          fontSize: "var(--ts-h3)", letterSpacing: "-0.025em", color: "var(--ink)",
          marginBottom: "6px",
        }}>
          Create account<span style={{ color: "var(--red)" }}>.</span>
        </h1>
        <p style={{ fontFamily: "var(--ff-mono)", fontSize: "var(--ts-meta)", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.20em" }}>
          Join the community today
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {serverError && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px",
            background: "var(--danger-s)", border: "1px solid oklch(62% 0.21 22 / 0.3)",
            fontSize: "var(--ts-body-sm)", color: "var(--danger)",
          }}>
            {serverError}
          </div>
        )}

        <Field label="Display name" error={errors.displayName?.message}>
          <input
            type="text"
            {...register("displayName")}
            placeholder="Your name"
            style={inputStyle(!!errors.displayName)}
            onFocus={e => {
              if (!errors.displayName) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-subtle)";
              }
            }}
            onBlur={e => {
              if (!errors.displayName) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }
            }}
          />
        </Field>

        <Field label="Email address" error={errors.email?.message}>
          <input
            type="email"
            {...register("email")}
            placeholder="you@example.com"
            style={inputStyle(!!errors.email)}
            onFocus={e => {
              if (!errors.email) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-subtle)";
              }
            }}
            onBlur={e => {
              if (!errors.email) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }
            }}
          />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"}
              {...register("password", {
                onChange: e => setPwValue(e.target.value),
              })}
              placeholder="Min. 12 characters"
              style={{ ...inputStyle(!!errors.password), paddingRight: "40px" }}
              onFocus={e => {
                if (!errors.password) {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-subtle)";
                }
              }}
              onBlur={e => {
                if (!errors.password) {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }
              }}
            />
            <button type="button" onClick={() => setShowPw(s => !s)} style={{
              position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: "2px",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                {showPw
                  ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                }
              </svg>
            </button>
          </div>
          <PasswordStrength password={pwValue} />
        </Field>

        <Field label="Confirm password" error={errors.confirmPassword?.message}>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirm ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Repeat password"
              style={{ ...inputStyle(!!errors.confirmPassword), paddingRight: "40px" }}
              onFocus={e => {
                if (!errors.confirmPassword) {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-subtle)";
                }
              }}
              onBlur={e => {
                if (!errors.confirmPassword) {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }
              }}
            />
            <button type="button" onClick={() => setShowConfirm(s => !s)} style={{
              position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: "2px",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                {showConfirm
                  ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                }
              </svg>
            </button>
          </div>
        </Field>

        <Button
          type="submit"
          disabled={isSubmitting}
          variant="primary"
          fullWidth
          style={{ marginTop: "4px", height: "42px" }}
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p style={{ textAlign: "center", fontSize: "var(--ts-body-sm)", color: "var(--text-3)", marginTop: "24px" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--ink)", fontWeight: 600, textDecoration: "underline" }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
