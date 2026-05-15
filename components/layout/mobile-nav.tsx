"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

function Icon({ path, size = 16 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const MENU_ICON = "M3 12h18M3 6h18M3 18h18";

interface MobileNavProps {
  displayName?: string | null;
  avatarUrl?: string | null;
  initials?: string | null;
}

export function MobileNav({ displayName, avatarUrl, initials }: MobileNavProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="md:hidden"
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-2)", padding: "4px" }}
          aria-label="Open navigation menu"
        >
          <Icon path={MENU_ICON} size={20} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          style={{
            borderRadius: "12px",
            padding: "8px",
            background: "oklch(from var(--surface) l c h / 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
            minWidth: "200px",
            zIndex: 50,
          }}
        >
          {[
            { href: "/about",       label: "About" },
            { href: "/contact",     label: "Contact" },
            { href: "/communities", label: "Forum" },
            { href: "/households",  label: "Expenses" },
          ].map((item) => (
            <DropdownMenu.Item key={item.href} asChild>
              <Link
                href={item.href}
                className="block px-3 py-[10px] rounded-lg text-sm no-underline outline-none cursor-pointer transition-colors data-[highlighted]:bg-surface-2"
                style={{ color: "var(--text-2)" }}
              >
                {item.label}
              </Link>
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />

          {displayName ? (
            <DropdownMenu.Item asChild>
              <Link
                href="/settings/profile"
                className="flex items-center gap-2 px-3 py-[10px] rounded-lg no-underline outline-none cursor-pointer transition-colors data-[highlighted]:bg-surface-2"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" style={{ width: "24px", height: "24px", borderRadius: "9999px", objectFit: "cover" }} />
                ) : (
                  <span style={{
                    width: "24px", height: "24px", borderRadius: "9999px",
                    background: "var(--accent-subtle)", color: "var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "var(--ts-meta)", fontWeight: "700",
                  }}>{initials ?? "?"}</span>
                )}
                <span style={{ fontSize: "var(--ts-body)", color: "var(--text)" }}>{displayName}</span>
              </Link>
            </DropdownMenu.Item>
          ) : (
            <>
              <DropdownMenu.Item asChild>
                <Link href="/login" className="block px-3 py-[10px] rounded-lg text-sm no-underline outline-none cursor-pointer transition-colors data-[highlighted]:bg-surface-2" style={{ color: "var(--text-2)" }}>
                  Sign in
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link href="/register" className="block px-3 py-[10px] rounded-lg text-sm font-semibold text-center no-underline outline-none cursor-pointer transition-colors data-[highlighted]:brightness-110" style={{ color: "#fff", background: "var(--accent)" }}>
                  Get started
                </Link>
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

