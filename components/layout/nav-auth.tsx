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
      <Link href="/login" className="text-md font-semibold text-red no-underline py-[6px] px-[14px] bg-[rgba(178,42,26,0.10)]" style={{ transition: "background 110ms" }}>
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
    <div className="flex items-center gap-4">
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
            className="w-[28px] h-[28px] rounded-full object-cover" style={{ border: "2px solid var(--surface)" }}
          />
        ) : (
          <span className="w-[28px] h-[28px] bg-[rgba(178,42,26,0.10)] text-red flex items-center justify-center text-sm font-bold font-serif">
            {initials || "?"}
          </span>
        )}
        <span className="text-md font-medium text-ink-2">
          {displayName}
        </span>
      </Link>
      <button
        onClick={logout}
        className="text-base font-medium text-red bg-transparent cursor-pointer py-2 px-4" style={{ border: "none" }}
      >
        Logout
      </button>
    </div>
  );
}