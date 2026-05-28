"use client";

import { usePathname, useParams } from "next/navigation";
import { MastheadRow } from "@/components/editorial/masthead-row";
import { Btn } from "@/components/editorial/button";
import { Icon } from "@/components/editorial/icon";

/**
 * <ForumMasthead> — layout-level masthead for the (forum) route group.
 *
 * Three modes, picked from pathname:
 *   1. List (`/forum`, `/`) → desk "Forum Desk", action "+ New community"
 *   2. Community (`/forum/g/[slug]/*`) → desk "Forum · g/{slug}",
 *      action "+ New thread"
 *   3. Profile / search / new / mod tools → desk "Forum Desk", no action
 *      (these are utility surfaces, not content)
 */

function actionFor(pathname: string, slug?: string): React.ReactNode {
  // Community subtree: post a thread is the primary action.
  if (slug) {
    return (
      <Btn
        href={`/forum/g/${slug}/threads/new`}
        variant="primary"
        size="sm"
        iconLeft={<Icon name="plus" size={12} strokeWidth={2.5} />}
      >
        New thread
      </Btn>
    );
  }
  // List page: post a community.
  if (pathname === "/forum" || pathname === "/" || pathname === "/forum/") {
    return (
      <Btn
        href="/forum/new"
        variant="primary"
        size="sm"
        iconLeft={<Icon name="plus" size={12} strokeWidth={2.5} />}
      >
        New community
      </Btn>
    );
  }
  return null;
}

export function ForumMasthead() {
  const pathname = usePathname() || "/forum";
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug;

  const desk = slug ? `Forum · g/${slug}` : "Forum Desk";
  return <MastheadRow desk={desk} action={actionFor(pathname, slug)} />;
}
