import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

/**
 * <ArrowLink> — a text link with a leading or trailing arrow *icon* (never a hardcoded -> / <-
 * glyph). `.ed-arrow-link` supplies layout only (inline-flex, gap, no-underline, hover:red); pass
 * your own colour class (e.g. `ed-label-muted`) or let it inherit inside agate tables.
 *
 *   <ArrowLink href="/x" className="ed-label-muted">View the books</ArrowLink>   ->  "View the books ->"
 *   <ArrowLink href="/x" direction="left">All households</ArrowLink>             ->  "<- All households"
 */
export function ArrowLink({
  href,
  children,
  direction = "right",
  size = 13,
  className,
  ...rest
}: {
  href: string;
  children: ReactNode;
  direction?: "left" | "right";
  size?: number;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const icon = (
    <Icon name={direction === "left" ? "arrowLeft" : "arrowRight"} size={size} strokeWidth={2} />
  );
  return (
    <Link href={href} className={cn("ed-arrow-link", className)} {...rest}>
      {direction === "left" && icon}
      <span>{children}</span>
      {direction === "right" && icon}
    </Link>
  );
}
