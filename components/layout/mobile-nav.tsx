"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

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
          className="md:hidden bg-transparent cursor-pointer text-ink-2 p-2"
          style={{ border: "none" }}
          aria-label="Open navigation menu"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="p-4 shadow-modal min-w-[200px] z-[50] border-ink" style={{ background: "oklch(from var(--surface) l c h / 0.95)", backdropFilter: "blur(12px)"}}
        >
          {[
            { href: "/about",       label: "About" },
            { href: "/contact",     label: "Contact" },
            { href: "/forum", label: "Forum" },
            { href: "/bills",  label: "Expenses" },
          ].map((item) => (
            <DropdownMenu.Item key={item.href} asChild>
              <Link
                href={item.href}
                className="block px-3 py-[10px] rounded-lg text-sm no-underline outline-none cursor-pointer transition-colors data-[highlighted]:bg-surface-2 text-ink-2"
                
              >
                {item.label}
              </Link>
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator className="h-[1px]" style={{ background: "var(--ink-3)", margin: "4px 0" }} />

          {displayName ? (
            <DropdownMenu.Item asChild>
              <Link
                href="/settings/profile"
                className="flex items-center gap-2 px-3 py-[10px] rounded-lg no-underline outline-none cursor-pointer transition-colors data-[highlighted]:bg-surface-2"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <span className="w-12 h-12 rounded-full bg-red-soft text-red flex items-center justify-center text-sm font-bold">{initials ?? "?"}</span>
                )}
                <span className="text-md text-ink">{displayName}</span>
              </Link>
            </DropdownMenu.Item>
          ) : (
            <>
              <DropdownMenu.Item asChild>
                <Link href="/login" className="block px-3 py-[10px] rounded-lg text-sm no-underline outline-none cursor-pointer transition-colors data-[highlighted]:bg-surface-2 text-ink-2" >
                  Sign in
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link href="/register" className="block px-3 py-[10px] rounded-lg text-sm font-semibold text-center no-underline outline-none cursor-pointer transition-colors data-[highlighted]:brightness-110 text-white bg-red" >
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

