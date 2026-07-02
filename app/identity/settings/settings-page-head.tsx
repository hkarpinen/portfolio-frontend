"use client";

import { SectionHeader } from "@/components/editorial";
import { usePathname } from "next/navigation";

/**
 * <SettingsPageHead> — pathname-aware editorial header for /settings/*.
 *
 * Rendered once in /settings/layout.tsx so every sub-page inherits a
 * specific headline + deck that matches the route. New sub-pages should
 * add an entry to ROUTE_HEAD below — falling through returns a generic
 * "Your *settings*" head so we never render a bare page.
 */

interface HeadCopy {
  kicker: string;
  title: string;
  deck: string;
}

const FALLBACK: HeadCopy = {
  kicker: "// SYSTEM · SETTINGS",
  title: "Your <em>settings</em>",
  deck: "Profile, password, sessions, notifications.",
};

// Order matters: longer (more specific) prefixes first so /settings/profile/forum
// wins over /settings/profile.
const ROUTE_HEAD: { prefix: string; head: HeadCopy }[] = [
  {
    prefix: "/identity/settings/profile/forum",
    head: {
      kicker: "// SETTINGS · PROFILE",
      title: "Forum <em>identity</em>",
      deck: "How you show up across forum threads and replies.",
    },
  },
  {
    prefix: "/identity/settings/profile/account",
    head: {
      kicker: "// SETTINGS · PROFILE",
      title: "Account <em>identity</em>",
      deck: "Display name, avatar, bio — what other readers see.",
    },
  },
  {
    prefix: "/identity/settings/profile",
    head: {
      kicker: "// SETTINGS · PROFILE",
      title: "Your <em>profile</em>",
      deck: "What your name, avatar, and bio look like across the app.",
    },
  },
  {
    prefix: "/identity/settings/security",
    head: {
      kicker: "// SETTINGS · ACCOUNT",
      title: "Account <em>security</em>",
      deck: "Password, two-factor authentication, and irreversible account actions.",
    },
  },
  {
    prefix: "/identity/settings/notifications",
    head: {
      kicker: "// SETTINGS · CHANNELS",
      title: "Notification <em>preferences</em>",
      deck: "What we email you and what stays in the inbox.",
    },
  },
  {
    prefix: "/identity/settings/sessions",
    head: {
      kicker: "// SETTINGS · ACCOUNT",
      title: "Active <em>sessions</em>",
      deck: "Where you're signed in. Revoke any you don't recognise.",
    },
  },
  {
    prefix: "/identity/settings/connections",
    head: {
      kicker: "// SETTINGS · LINKED_ACCOUNTS",
      title: "Connected <em>accounts</em>",
      deck: "Google, GitHub, Plaid — anything the app talks to on your behalf.",
    },
  },
  {
    prefix: "/identity/settings/appearance",
    head: {
      kicker: "// SETTINGS · THEME",
      title: "Terminus <em>appearance</em>",
      deck: "Density, navigation style, and other surface preferences.",
    },
  },
];

export function SettingsPageHead() {
  const pathname = usePathname() || "/identity/settings";
  const match = ROUTE_HEAD.find((r) => pathname.startsWith(r.prefix));
  const head = match?.head ?? FALLBACK;
  return <SectionHeader kicker={head.kicker} title={head.title} subtitle={head.deck} />;
}
