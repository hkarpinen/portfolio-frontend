"use client";

import Link from "next/link";
import { useState } from "react";

function Icon({ path, size = 16 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const MENU_ICON  = "M3 12h18M3 6h18M3 18h18";
const CLOSE_ICON = "M18 6L6 18M6 6l12 12";

interface MobileNavProps {
  displayName?: string | null;
  avatarUrl?: string | null;
  initials?: string | null;
}

export function MobileNav({ displayName, avatarUrl, initials }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle button (visible on mobile only) */}
      <button
        className="md:hidden"
        onClick={() => setOpen(o => !o)}
        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-2)", padding: "4px" }}
      >
        <Icon path={open ? CLOSE_ICON : MENU_ICON} size={20} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            borderTop: "1px solid var(--border)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            background: "oklch(from var(--surface) l c h / 0.95)",
            backdropFilter: "blur(12px)",
            zIndex: 50,
          }}
        >
          {[
            { href: "/about",       label: "About" },
            { href: "/contact",     label: "Contact" },
            { href: "/communities", label: "Forum" },
            { href: "/households",  label: "Bills" },
          ].map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
              padding: "10px 12px", borderRadius: "8px", fontSize: "14px",
              color: "var(--text-2)", textDecoration: "none",
            }}>
              {item.label}
            </Link>
          ))}

          <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />

          {displayName ? (
            <Link href="/settings/profile" onClick={() => setOpen(false)} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 12px", borderRadius: "8px", textDecoration: "none",
            }}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" style={{ width: "24px", height: "24px", borderRadius: "9999px", objectFit: "cover" }} />
              ) : (
                <span style={{
                  width: "24px", height: "24px", borderRadius: "9999px",
                  background: "var(--accent-subtle)", color: "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: "700",
                }}>{initials ?? "?"}</span>
              )}
              <span style={{ fontSize: "14px", color: "var(--text)" }}>{displayName}</span>
            </Link>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} style={{
                padding: "10px 12px", borderRadius: "8px", fontSize: "14px",
                color: "var(--text-2)", textDecoration: "none",
              }}>
                Sign in
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} style={{
                padding: "10px 12px", borderRadius: "8px", fontSize: "14px", fontWeight: "600",
                color: "#fff", background: "var(--accent)", textDecoration: "none", textAlign: "center",
              }}>
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
