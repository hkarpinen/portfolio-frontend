"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { loginSchema, LoginInput } from "@/schemas/auth";
import { api, ApiError } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
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
      router.refresh();
      router.push("/communities");
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

        {/* Email */}
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
          {errors.email && (
            <span style={{ fontSize: "11px", color: "var(--danger)" }}>{errors.email.message}</span>
          )}
        </div>

        {/* Password */}
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
            <button
              type="button"
              onClick={() => setShowPw(s => !s)}
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

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            height: "42px",
            borderRadius: "12px",
            background: isSubmitting ? "var(--surface-3)" : "var(--accent)",
            color: isSubmitting ? "var(--text-3)" : "#fff",
            border: "none",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "600",
            fontFamily: "var(--ff-display)",
            transition: "background 110ms, transform 100ms",
            marginTop: "4px",
          }}
          onMouseEnter={e => {
            if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = "var(--accent-hi)";
          }}
          onMouseLeave={e => {
            if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = "var(--accent)";
          }}
          onMouseDown={e => {
            if (!isSubmitting) (e.currentTarget as HTMLElement).style.transform = "scale(0.97)";
          }}
          onMouseUp={e => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          }}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
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
