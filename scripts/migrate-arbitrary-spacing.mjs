#!/usr/bin/env node
/**
 * One-shot migration: replace `gap-[Npx]` / `p-[Npx]` / `m-[Npx]` /
 * `h-[Npx]` / `w-[Npx]` / `top-[Npx]` / `right-[Npx]` / `bottom-[Npx]` /
 * `left-[Npx]` / `inset-[Npx]` / `min-h-[Npx]` / `min-w-[Npx]` /
 * `max-h-[Npx]` / `max-w-[Npx]` arbitrary classes with their scale-token
 * equivalents, using the spacing scale in tailwind.config.ts. Idempotent.
 *
 * Audit §2.2. Run from the repo root after extending the spacing scale:
 *   node scripts/migrate-arbitrary-spacing.mjs
 *
 * Skips values that don't map to a scale token (e.g. `[640px]` for an
 * actual max-width breakpoint — those stay arbitrary and the human
 * decides whether to scale-ify them).
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components"];

// Mirror of tailwind.config.ts:`theme.extend.spacing`. Px → scale token.
// Keep this in sync if the scale changes again.
const PX_TO_TOKEN = {
  "1px": "0.5",
  "2px": "1",
  "3px": "1.5",
  "4px": "2",
  "6px": "3",
  "7px": "3.5",
  "8px": "4",
  "10px": "5",
  "12px": "6",
  "14px": "7",
  "16px": "8",
  "18px": "9",
  "20px": "10",
  "24px": "12",
  "28px": "14",
  "32px": "16",
  "36px": "18",
  "40px": "20",
  "44px": "11", // WCAG 2.5.5 touch-target floor
  "48px": "24",
  "56px": "28",
  "64px": "32",
  "80px": "40",
  "96px": "48",
};

// Property prefixes that consume a spacing token. Excludes `border-` (a
// border-width arbitrary like `border-[1.5px]` is semantically distinct
// from spacing).
const PREFIXES = [
  "gap",
  "p",
  "px",
  "py",
  "pt",
  "pr",
  "pb",
  "pl",
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "h",
  "w",
  "min-h",
  "min-w",
  "max-h",
  "max-w",
  "top",
  "right",
  "bottom",
  "left",
  "inset",
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (st.isFile() && (extname(full) === ".ts" || extname(full) === ".tsx")) out.push(full);
  }
  return out;
}

const PREFIX_GROUP = PREFIXES.map((p) => p.replace(/-/g, "\\-")).join("|");
const RE = new RegExp(`\\b(-?)(${PREFIX_GROUP})-\\[(\\d+(?:\\.\\d+)?px)\\]`, "g");

function rewrite(source) {
  let touched = false;
  const next = source.replace(RE, (match, sign, prefix, px) => {
    const token = PX_TO_TOKEN[px];
    if (!token) return match; // unrecognised value — leave arbitrary
    touched = true;
    return `${sign}${prefix}-${token}`;
  });
  return touched ? next : source;
}

let changed = 0;
let migrations = 0;
for (const dir of SCAN_DIRS) {
  const root = join(ROOT, dir);
  try {
    statSync(root);
  } catch {
    continue;
  }
  for (const file of walk(root)) {
    const before = readFileSync(file, "utf8");
    const after = rewrite(before);
    if (after !== before) {
      const fileMigrations =
        (before.match(RE) || []).filter((m) => PX_TO_TOKEN[m.match(/\[(.+?)\]/)?.[1] ?? ""])
          .length;
      writeFileSync(file, after, "utf8");
      changed += 1;
      migrations += fileMigrations;
      console.log(`  ↻ ${file.slice(ROOT.length + 1)}  (${fileMigrations})`);
    }
  }
}
console.log(`\nDone. ${changed} file${changed === 1 ? "" : "s"} touched, ${migrations} arbitrary-value classes migrated.`);
