"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { identityKeys } from "@/lib/query-keys";

interface LoginFormProps {
  from: string;
}

export function LoginForm({ from }: LoginFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    try {
      await api.post("/api/identity/login", data);
      queryClient.invalidateQueries({ queryKey: identityKeys.me() });
      router.push(from);
      router.refresh();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Invalid email or password.");
    }
  }

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "24px",
      padding: "32px",
      boxShadow: "var(--shadow-lg)",
    }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h1 style={{
          fontFamily: "var(--ff-display)", fontWeight: "800",
          fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)",
          marginBottom: "8px",
        }}>
          Welcome back
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
          Sign in to your account
        </p>
      </div>

      {/* OAuth buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => window.location.href = "/api/identity/oauth/github"}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            padding: "10px 16px", borderRadius: "12px",
            background: "var(--surface-2)", border: "1px solid var(--border)",
            color: "var(--text)", fontSize: "14px", fontWeight: 500, cursor: "pointer",
            width: "100%", transition: "border-color 0.12s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>
        <button
          type="button"
          onClick={() => window.location.href = "/api/identity/oauth/google"}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            padding: "10px 16px", borderRadius: "12px",
            background: "var(--surface-2)", border: "1px solid var(--border)",
            color: "var(--text)", fontSize: "14px", fontWeight: 500, cursor: "pointer",
            width: "100%", transition: "border-color 0.12s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        <span style={{ fontSize: "12px", color: "var(--text-3)" }}>or</span>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {serverError && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "var(--danger-s)",
            border: "1px solid oklch(62% 0.21 22 / 0.3)",
            fontSize: "13px",
            color: "var(--danger)",
          }}>
            {serverError}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{
            fontSize: "12px", fontWeight: "500", color: "var(--text-2)",
            letterSpacing: "0.02em",
          }}>
            Email address
          </label>
          <input
            type="email"
            {...register("email")}
            placeholder="you@example.com"
            style={{
              height: "38px",
              background: "var(--surface-2)",
              border: `1px solid ${errors.email ? "var(--danger)" : "var(--border)"}`,
              borderRadius: "12px",
              padding: "0 12px",
              fontSize: "13px",
              color: "var(--text)",
              outline: "none",
              transition: "border-color 110ms, box-shadow 110ms",
            }}
            onFocus={e => {
              if (!errors.email) {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
              }
            }}
            onBlur={e => {
              if (!errors.email) {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          />
          {errors.email && (
            <span style={{ fontSize: "11px", color: "var(--danger)" }}>{errors.email.message}</span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)", letterSpacing: "0.02em" }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"}
              {...register("password")}
              placeholder="••••••••"
              style={{
                height: "38px",
                width: "100%",
                background: "var(--surface-2)",
                border: `1px solid ${errors.password ? "var(--danger)" : "var(--border)"}`,
                borderRadius: "12px",
                padding: "0 40px 0 12px",
                fontSize: "13px",
                color: "var(--text)",
                outline: "none",
                transition: "border-color 110ms, box-shadow 110ms",
              }}
              onFocus={e => {
                if (!errors.password) {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
                }
              }}
              onBlur={e => {
                if (!errors.password) {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              style={{
                position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-3)", padding: "2px",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                {showPw
                  ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                }
              </svg>
            </button>
          </div>
          {errors.password && (
            <span style={{ fontSize: "11px", color: "var(--danger)" }}>{errors.password.message}</span>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          variant="primary"
          fullWidth
          style={{ marginTop: "4px", height: "42px" }}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-3)", marginTop: "24px" }}>
        Don&apos;t have an account?{" "}
        <Link href="/register" style={{ color: "var(--accent)", fontWeight: "500", textDecoration: "none" }}>
          Create one
        </Link>
      </p>
    </div>
  );
}
