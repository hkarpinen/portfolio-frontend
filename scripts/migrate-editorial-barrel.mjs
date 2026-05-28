#!/usr/bin/env node
/**
 * One-shot migration for the editorial barrel adoption (audit §5.5).
 *
 * Walks every .ts/.tsx file under app/, components/ (excluding the
 * editorial directory itself so sibling imports stay deep), and hooks/,
 * and rewrites every import that targets a deep editorial path into a
 * single merged barrel import. Type-only imports (`import type { … }`)
 * are preserved as a separate barrel line so the type-import discipline
 * (`consistent-type-imports` rule) doesn't degrade.
 *
 * After the run:
 *   - `import { Btn } from "@/components/editorial/button"` etc. → gone
 *   - Multiple deep editorial imports in one file → one barrel import
 *     (and optionally one `import type` from the same barrel).
 *
 * The script is idempotent: a file with no deep imports is a no-op.
 * Run from the repo root: `node scripts/migrate-editorial-barrel.mjs`.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components", "hooks"];
const EXCLUDE_DIRS = ["components/editorial"]; // sibling imports inside the barrel stay deep
const BARREL = "@/components/editorial";

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = full.slice(ROOT.length + 1);
    if (EXCLUDE_DIRS.some((p) => rel.startsWith(p))) continue;
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (st.isFile() && (extname(full) === ".ts" || extname(full) === ".tsx")) out.push(full);
  }
  return out;
}

/**
 * Match `import { … } from "@/components/editorial/<slug>";` AND the
 * barrel form `import { … } from "@/components/editorial";`. Both get
 * collapsed into one merged emission per file (a file already using the
 * barrel partially is the common case the first pass missed).
 */
const DEEP_IMPORT_RE =
  /^import\s+(type\s+)?\{\s*([^}]+?)\s*\}\s+from\s+"@\/components\/editorial(?:\/[a-z][a-z0-9-]*)?";?\s*$/gm;

function parseNames(rawList) {
  // Split on commas, trim each, separate type-only specifiers (`type Foo`).
  return rawList
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function rewrite(source) {
  let touched = false;
  const valueNames = new Set();
  const typeNames = new Set();

  const stripped = source.replace(DEEP_IMPORT_RE, (_match, isTypeImport, names) => {
    touched = true;
    const groupIsType = Boolean(isTypeImport);
    for (const raw of parseNames(names)) {
      if (raw.startsWith("type ")) {
        typeNames.add(raw.slice("type ".length).trim());
      } else if (groupIsType) {
        typeNames.add(raw);
      } else {
        valueNames.add(raw);
      }
    }
    return ""; // drop the original line; we re-emit a merged one
  });

  if (!touched) return source;

  // Build the merged imports and place them at the top of the file, just
  // before the first remaining import or the start of the file.
  const merged = [];
  if (valueNames.size > 0) {
    merged.push(`import { ${[...valueNames].sort().join(", ")} } from "${BARREL}";`);
  }
  if (typeNames.size > 0) {
    merged.push(`import type { ${[...typeNames].sort().join(", ")} } from "${BARREL}";`);
  }

  // Collapse any blank lines the strip produced; insert merged imports at
  // the position where the first deep import used to live.
  const collapsed = stripped.replace(/^\n{2,}/gm, "\n").replace(/\n{3,}/g, "\n\n");

  // Find the first import line (any) — if present, insert before it; else
  // prepend to the file.
  const firstImportIdx = collapsed.search(/^import\s/m);
  let next;
  if (firstImportIdx === -1) {
    next = merged.join("\n") + "\n\n" + collapsed.trimStart();
  } else {
    next =
      collapsed.slice(0, firstImportIdx) +
      merged.join("\n") +
      "\n" +
      collapsed.slice(firstImportIdx);
  }

  return next;
}

let changed = 0;
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
      writeFileSync(file, after, "utf8");
      changed += 1;
      console.log(`  ↻ ${file.slice(ROOT.length + 1)}`);
    }
  }
}
console.log(`\nDone. ${changed} file${changed === 1 ? "" : "s"} migrated.`);
