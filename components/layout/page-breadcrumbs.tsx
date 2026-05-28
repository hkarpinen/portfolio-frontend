"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * <PageBreadcrumbs> — in-content breadcrumb trail
 *
 * Lives inside the page content area (above any SectionHeader / page title),
 * not in the global top bar. Skips rendering on the home page. UUID segments
 * are dropped so we don't show raw IDs. Visual rules live in /app/globals.css
 * under `.ed-breadcrumb*` and `.ed-page-breadcrumb*` classes.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function pathToCrumbs(pathname: string): { label: string; href?: string }[] {
  if (pathname === "/") return [];
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [{ label: "Home", href: "/" }];
  let acc = "";
  for (let i = 0; i < parts.length; i++) {
    // The loop guard `i < parts.length` proves the indexed access is
    // safe; the explicit narrow keeps the rest of the body free of
    // non-null assertions.
    const p = parts[i];
    if (p === undefined) continue;
    acc += "/" + p;
    if (UUID_RE.test(p)) continue;
    // Forum communities live at /forum/g/{slug}/... — merge the "g" and
    // the slug into a single "g/{slug}" crumb so it reads as one labelled
    // item, matching how the rest of the forum UI presents communities.
    if (p === "g" && i + 1 < parts.length && parts[i - 1] === "forum") {
      const slug = parts[i + 1] ?? "";
      acc += "/" + slug;
      crumbs.push({ label: `g/${slug}`, href: acc });
      i++; // consume the slug segment too
      continue;
    }
    crumbs.push({ label: p.replace(/-/g, " "), href: acc });
  }
  // The last crumb is always the "current page" — strip its href so it
  // renders as plain text. This matters when the URL ends in a UUID
  // (which we drop), because then the visually-last crumb isn't the
  // last URL segment and would otherwise resolve to a non-existent
  // parent route (e.g. /household/{uuid}/expenses).
  if (crumbs.length > 0) {
    const last = crumbs[crumbs.length - 1];
    if (last) crumbs[crumbs.length - 1] = { label: last.label };
  }
  return crumbs;
}

// Routes that supply their own contextual navigation (an editorial
// MastheadRow, a section header, etc.) and don't need — or actively clash
// with — the generic breadcrumb trail. EXACT match: deeper routes like
// /expenses/new still get breadcrumbs because there's actually a return
// path worth showing.
const SUPPRESSED_EXACT = new Set<string>([
  "/expenses",
  "/income",
  "/household",
  "/dashboard",
  "/notifications",
  "/forum",
  "/about",
  "/contact",
  "/admin",
  // The new-source pages hand-roll their own in-content breadcrumb with
  // friendlier labels ("Add source" / "Add expense" instead of the literal
  // "new" URL segment). The audit (§5.6) flagged that both render on these
  // routes — suppress the auto trail to leave just the polished one.
  "/expenses/new",
  "/income/new",
]);

/** Routes whose entire subtree is wayfound by their group's MastheadRow
 *  (tabs in the masthead replace the breadcrumb trail). Detail/leaf pages
 *  beyond these still get breadcrumbs unless added to SUPPRESSED_EXACT. */
const SUPPRESSED_SUBTREE: string[] = [
  // /household/[id]/* — masthead carries household name + tabs + action.
  // The breadcrumb's "household > [uuid] > expenses" would only add noise.
  "/household/",
  // /forum/g/[slug]/* — masthead carries the community slug as the desk.
  "/forum/g/",
  // /settings/* — masthead + left-rail nav replace the breadcrumb trail.
  "/settings/",
];

export function PageBreadcrumbs() {
  const pathname = usePathname() || "/";
  if (SUPPRESSED_EXACT.has(pathname)) return null;
  if (SUPPRESSED_SUBTREE.some((p) => pathname.startsWith(p))) return null;
  const crumbs = pathToCrumbs(pathname);
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="ed-page-breadcrumb">
      <ol className="ed-breadcrumb">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={i} className="flex min-w-0 items-center gap-2">
              {i > 0 && (
                <span aria-hidden="true" className="ed-breadcrumb-sep">
                  /
                </span>
              )}
              {c.href && !last ? (
                <Link href={c.href} className="ed-breadcrumb-link">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="ed-breadcrumb-current">
                  {c.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
