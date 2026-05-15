"use client";

import Link from "next/link";
import { useLogout } from "@/hooks/use-identity";
import styles from "./nav-auth.module.css";

type NavAuthProps = {
  displayName: string | null;
  avatarUrl?: string | null;
};

export function NavAuth({ displayName, avatarUrl = null }: NavAuthProps) {
  const logout = useLogout();

  if (!displayName) {
    return (
      <Link href="/login" style={{
        fontSize: "var(--ts-body)", fontWeight: "600", color: "var(--accent)",
        textDecoration: "none", padding: "6px 14px", borderRadius: "8px",
        background: "var(--accent-subtle)", transition: "background 110ms",
      }}>
        Sign in
      </Link>
    );
  }

  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Link
        href="/settings/profile"
        aria-label="Your profile"
        className={styles.profileLink}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            style={{ width: "28px", height: "28px", borderRadius: "9999px", objectFit: "cover", border: "2px solid var(--surface)" }}
          />
        ) : (
          <span style={{
            width: "28px", height: "28px", borderRadius: "9999px",
            background: "var(--accent-subtle)", color: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "var(--ts-meta)", fontWeight: "700", fontFamily: "var(--ff-display)",
          }}>
            {initials || "?"}
          </span>
        )}
        <span style={{ fontSize: "var(--ts-body)", fontWeight: "500", color: "var(--text-2)" }}>
          {displayName}
        </span>
      </Link>
      <button
        onClick={logout}
        style={{
          fontSize: "var(--ts-label)", fontWeight: "500", color: "var(--danger)",
          background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
        }}
      >
        Logout
      </button>
    </div>
  );
}