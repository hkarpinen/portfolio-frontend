"use client";

import { EditorialPageHead } from "@/components/editorial";
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
  kicker: "Account",
  title: "Your <em>settings</em>",
  deck: "Profile, password, sessions, notifications.",
};

// Order matters: longer (more specific) prefixes first so /settings/profile/forum
// wins over /settings/profile.
const ROUTE_HEAD: { prefix: string; head: HeadCopy }[] = [
  {
    prefix: "/identity/settings/profile/forum",
    head: {
      kicker: "Settings · Profile",
      title: "Forum <em>identity</em>",
      deck: "How you show up across forum threads and replies.",
    },
  },
  {
    prefix: "/identity/settings/profile/account",
    head: {
      kicker: "Settings · Profile",
      title: "Account <em>identity</em>",
      deck: "Display name, avatar, bio — what other readers see.",
    },
  },
  {
    prefix: "/identity/settings/profile",
    head: {
      kicker: "Settings · Profile",
      title: "Your <em>profile</em>",
      deck: "What your name, avatar, and bio look like across the app.",
    },
  },
  {
    prefix: "/identity/settings/security",
    head: {
      kicker: "Settings · Account",
      title: "Account <em>security</em>",
      deck: "Password, two-factor authentication, and irreversible account actions.",
    },
  },
  {
    prefix: "/identity/settings/notifications",
    head: {
      kicker: "Settings · Channels",
      title: "Notification <em>preferences</em>",
      deck: "What we email you and what stays in the inbox.",
    },
  },
  {
    prefix: "/identity/settings/sessions",
    head: {
      kicker: "Settings · Account",
      title: "Active <em>sessions</em>",
      deck: "Where you're signed in. Revoke any you don't recognise.",
    },
  },
  {
    prefix: "/identity/settings/connections",
    head: {
      kicker: "Settings · Linked accounts",
      title: "Connected <em>accounts</em>",
      deck: "Google, GitHub, Plaid — anything the app talks to on your behalf.",
    },
  },
  {
    prefix: "/identity/settings/appearance",
    head: {
      kicker: "Settings · Theme",
      title: "Editorial <em>appearance</em>",
      deck: "Density, navigation style, and other surface preferences.",
    },
  },
];

export function SettingsPageHead() {
  const pathname = usePathname() || "/identity/settings";
  const match = ROUTE_HEAD.find((r) => pathname.startsWith(r.prefix));
  const head = match?.head ?? FALLBACK;
  return <EditorialPageHead kicker={head.kicker} title={head.title} deck={head.deck} />;
}
