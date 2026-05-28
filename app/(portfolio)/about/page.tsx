import { redirect } from "next/navigation";

/**
 * /about used to be a full bio page. The bio now lives as a section on
 * the landing (`/#about`), so this route 308-redirects there to preserve
 * any existing bookmarks, social links, or external references.
 *
 * The deeper /about/architecture route still works — it's the standalone
 * architecture deep-dive and didn't move.
 */
export default function AboutPage(): never {
  redirect("/#about");
}
