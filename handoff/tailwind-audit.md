# Tailwind Audit & Remediation Plan

## Executive summary

The frontend ships a custom Tailwind theme (`tailwind.config.ts`) that silently doubles every developer's mental model: the spacing scale is halved (1 unit = 2px, not 4px), the `fontSize` scale is shifted (every name resolves smaller than default), the `2xl` screen is reduced from 1536px to 1440px, and an entire parallel design system (`ed-*`) overlaps with utilities. **None of this is documented anywhere a developer or LLM will see** (CLAUDE.md is a 1-line redirect, AGENTS.md is a 5-line Next.js notice, README is feature-only). The combination produces concretely broken UI in shipped code — most visibly an **8px checkbox** in the household expense form, **16px spinners** on income/forum/search pages, and **~12.5px body copy** in places authors thought were 14px. There is also dead theme config (custom animations, durations, several screens, all "semantic alias" colors) consumed only via CSS variables, not via Tailwind utilities. The single highest-leverage fix is a one-page documentation block; the second is replacing five hand-rolled spinners with the existing `<Spinner />`. Everything else is incremental hygiene that can be parallelized.

## Findings

### F1 — The halved spacing scale is undocumented

- **Severity**: critical
- **Evidence**: `tailwind.config.ts:138-154` redefines `spacing` so `1 = 2px`, `4 = 8px`, `8 = 16px`, `12 = 24px`, etc. Searching all docs:
  - `CLAUDE.md` is `@AGENTS.md` (1 line).
  - `AGENTS.md` is a 5-line Next.js-version note, no design-system content.
  - `README.md` has zero design-system content.
  - `handoff 8/PRINCIPLES.md:45,114,138` documents type floor and target heights in pixels but **never mentions** the halved spacing scale or that `w-8 = 16px`.
  - `handoff 8/MIGRATION.md:18` mentions `--s-1`…`--s-10` semantic spacing tokens — these are CSS variables, *not* the Tailwind utility scale.
- **Impact**: Every developer and every LLM writing markup will produce wrong-sized UI by default. The mental model `w-8 h-8` → 32px avatar produces a 16px dot. Multiplied across 8 confirmed misuses and an unbounded future surface area, this is the root cause of most other findings here.
- **Recommended fix**: Add a `frontend/CLAUDE.md` (or replace the `@AGENTS.md` redirect) with a "Spacing scale — read this first" block citing the exact mapping (`w-4 = 8px`, `w-8 = 16px`, `gap-6 = 12px`, `py-2 = 4px`) and the named touch-target token (`min-h-hit = 44px`). Append a "Don't" list pulled directly from F2–F5.

### F2 — `w-4 h-4` checkboxes/radios render at 8px (sub-touchable)

- **Severity**: critical
- **Evidence** (6 sites total — all interactive controls):
  - `app/(household)/household/[id]/expenses/new/page.tsx:205` — `w-4 h-4` checkbox ("Recurring expense")
  - `app/(auth)/login/login-form.tsx:174` — `w-4 h-4` checkbox ("Remember me")
  - `app/settings/appearance/page.tsx:49,93` — `w-4 h-4` radio (theme/density)
  - `app/settings/notifications/page.tsx:173` — `w-4 h-4` checkbox
  - `app/(household)/household/[id]/calendar/new/page.tsx:92` — `w-4 h-4` checkbox
  - Plus three sibling ad-hoc sizes: `w-5 h-5` (10px) in `app/(household)/household/[id]/expenses/new/page.tsx:170`; `w-[15px] h-[15px]` in `app/(finance)/income/add-deduction-form.tsx:33`; `w-[18px] h-[18px]` in `app/(forum)/forum/[slug]/threads/new/page.tsx:181`.
- **Impact**: 8px hit targets fail WCAG 2.5.5; on mobile they are essentially un-clickable. Five different checkbox sizes across the app also break visual consistency.
- **Recommended fix**: Standardize on `w-[18px] h-[18px]` (the existing best example) for every native checkbox/radio, OR introduce a `.ed-checkbox` / `.ed-radio` class in `globals.css` and swap every site to it. Wrap the label in a `min-h-hit` row so the touch target itself meets 44px even when the visual control is smaller.

### F3 — Hand-rolled spinners render at 16px

- **Severity**: high
- **Evidence**:
  - `app/(finance)/income/income-detail-panel.tsx:31` — `w-8 h-8` border-spin (16px)
  - `app/(forum)/search/page.tsx:52` — `w-8 h-8` border-spin (16px)
  - `app/(finance)/income/manage-deductions-modal.tsx:147` — `w-8 h-8` (toggle thumb, intentional but identical class)
  - `app/(household)/household/[id]/expenses/[expenseId]/page.tsx:51` — `w-16 h-16` border-spin (32px, page-level — inconsistent with the 16px ones)
  - A `components/editorial/spinner.tsx` exists and is **not** used in any of these.
- **Impact**: Loading states are unreadable; visual inconsistency between page-level and inline spinners.
- **Recommended fix**: Replace each border-spin div with `<Spinner size={20} />` (inline) or `<Spinner size={32} />` (page-level). Delete the ad-hoc class strings.

### F4 — `text-sm` on body copy renders at ~12.5px

- **Severity**: high
- **Evidence**: `tailwind.config.ts:93` sets `sm: '0.78rem'` (≈12.5px). Total `text-sm` usages: **138**. A representative sample of body-copy uses (not labels):
  - `app/settings/security/two-factor-section.tsx:52,122` — `<p className="text-sm mt-1 text-ink-2">` body explainer
  - `app/settings/security/danger-zone-section.tsx:15` — danger-zone explanation paragraph
  - `app/settings/sessions/page.tsx:189` — body paragraph
  - `app/settings/connections/page.tsx:47` — `<p className="text-sm text-ink-3 mt-[3px]">` description
  - `app/(finance)/income/manage-deductions-modal.tsx:134,193` — modal body copy
  - `app/(forum)/forum/community-card.tsx:96,99,102` — member/thread/reply counts (likely intended ~14px)
  - `app/(forum)/page.tsx:124,173,179,183,227` — feed metadata strings
- **Impact**: Anywhere an author wrote `text-sm` thinking "14px small body", they shipped 12.5px instead. Borderline-legible on retina, hostile on standard DPI. Author awareness is mixed: 26 files use `text-[0.72rem]` arbitrary syntax (matching `text-xs`'s actual value) — i.e. they're bypassing the scale they can't trust.
- **Recommended fix**: Don't rename the token (too much blast radius). Either (a) lift `sm` to `0.875rem` and `base` to `0.9375rem` in `tailwind.config.ts` and re-screenshot, or (b) leave the scale and bulk-rewrite body-copy `text-sm` → `text-base` in the file list above. Pick (b) as the safer batchable change.

### F5 — Undocumented 900px breakpoint used as sidebar-collapse tier

- **Severity**: medium
- **Evidence**: 16 sites use the 900px boundary without a named screen:
  - `min-[900px]:` arbitrary variants (11 sites): `components/layout/top-bar.tsx:52`; `components/layout/app-shell.tsx:119,143,147`; `app/(forum)/forum/page.tsx:37,41`; `app/(geography)/weather/weather-client.tsx:104`; `app/(geography)/weather/location-search.tsx:19,21,47,55`.
  - `@media (min-width: 900px)` / `(max-width: 900px)` in CSS (5 sites): `app/globals.css:317,319,341,997,1949`.
  - The config comment at `tailwind.config.ts:172-181` explicitly references "600/640/768/900" as in-use breakpoints but only registers `xs/sm/md/lg/xl/2xl` (no `nav` or similar at 900).
- **Impact**: New components either guess at the breakpoint or pick a different one. The sidebar collapse semantics aren't discoverable; touching `app-shell.tsx` requires correlating four files manually.
- **Recommended fix**: Add `nav: '900px'` to `screens` in `tailwind.config.ts` (between `md` and `lg`). Bulk-rename `min-[900px]:` → `nav:` and `max-[900px]:` → `max-nav:` in TSX. Replace `@media (min-width: 900px)` in `globals.css` with a comment naming the same intent (CSS media queries can't reference Tailwind screens directly, but the comment keeps them findable).

### F6 — `text-xs` and `text-sm` are not what their names suggest

- **Severity**: medium
- **Evidence**: `tailwind.config.ts:87-99` documents this explicitly but no consumer-facing doc does:
  - `text-xs = 0.72rem` (≈11.5px, not 12px default)
  - `text-sm = 0.78rem` (≈12.5px, not 14px default)
  - `text-base = 0.875rem` (≈14px, not 16px default)
  - `text-md = 1rem` (NEW token, not in default Tailwind — see `components/editorial/input.tsx` and 5 other files using `text-md`)
- **Impact**: Closely related to F4 but distinct: even when developers consciously try to size text, the named scale doesn't match common knowledge. The non-standard `text-md` is an extra footgun (it doesn't exist in default Tailwind so it silently falls back to `text-base` if the config is ever switched out).
- **Recommended fix**: Document this in the same CLAUDE.md block as F1. Optionally rename `text-md` to `text-body` to make its custom-ness explicit and prevent confusion with `font-medium` / `font-weight-medium` muscle memory.

### F7 — `ed-input` + `pl-11` collision is real and the author already worked around it

- **Severity**: medium
- **Evidence**: `.ed-input` sets `padding: 12px 14px` (`globals.css:725-737`). To put an icon inside, the author needs to override left padding:
  - `components/editorial/input.tsx:45` — `<input className={\`ed-input ${iconLeft ? "pl-11" : ""} ...\`}>`. `pl-11` in this scale = 22px, intended for an absolutely-positioned `left-3` (6px) icon. It "works" only because `@layer utilities` outranks `@layer components` in cascade order, so the utility wins.
  - `app/(forum)/forum/forum-feed.tsx:47` — author used `ed-input !pl-[44px]` (with `!important`) because `pl-11` would have given them 22px. They knew the override needed force.
- **Impact**: Two parallel implementations of "ed-input with left icon". The default Input component's icon at `left-3` (6px) with `pl-11` (22px) leaves only ~16px between icon-left and text-left, which is correct here but only by accident of the halved scale. Anyone adding a third icon-input variant will have to reverse-engineer this.
- **Recommended fix**: Add `.ed-input-with-icon` modifier class in `globals.css` that sets `padding-left: 44px`; rewrite both call sites to use it. Removes the magic numbers from JSX.

### F8 — Two coexisting color systems; one is unused as Tailwind utilities

- **Severity**: medium
- **Evidence** (utility-class consumption counts across `app/` + `components/`):
  - Editorial palette (authoritative): `text-ink` (130), `text-ink-2` (67), `text-ink-3` (249), `text-ink-4` (14), `bg-paper` (61), `bg-paper-2` (72), `bg-paper-3` (23), `text-red` (152), `bg-red-soft` (42), `bg-red` (15), `border-red` (14), `text-green` (14), `bg-green-soft` (10), `border-green` (3).
  - Semantic aliases (all in `tailwind.config.ts:38-77`): `text-text*`/`bg-text*`/`text-surface*`/`bg-surface*`/`bg-bg*`/`text-accent*`/`border-accent*`/`bg-warning*`/`bg-danger*` — **0 usages each**. `text-success` — 1 usage (`app/(forum)/forum/[slug]/threads/[threadId]/thread-actions.tsx:108`).
- **Impact**: The "semantic" half of the config is dead at the utility layer. It's only consumed via `var(--surface)`, `var(--danger)`, etc. inside `ed-*` components. New devs see two color systems and don't know which to pick; deleting the unused ones doesn't break anything currently shipped (except the one `text-success` call site).
- **Recommended fix**: Either (a) commit to editorial palette only, delete the semantic-alias entries from `tailwind.config.ts`, and swap the one `text-success` call to `text-green`; or (b) commit to semantic aliases and rename `bg-paper` → `bg-surface` everywhere. (a) is one wave; (b) is a multi-day project. Recommend (a).

### F9 — Dead theme.extend entries

- **Severity**: low
- **Evidence** (zero utility consumers in `app/` + `components/`):
  - `theme.extend.fontFamily.display` — `font-display` has 0 uses (`tailwind.config.ts:82`).
  - `theme.extend.transitionDuration.{fast,mid,slow,page}` — `duration-fast`/`mid`/`slow`/`page` all have 0 uses (`tailwind.config.ts:161-165`).
  - `theme.extend.transitionTimingFunction.in-out` — `ease-in-out` has 0 uses (`tailwind.config.ts:159`).
  - `theme.extend.animation.*` — `animate-fade-up`, `animate-fade-in`, `animate-scale-in`, `animate-slide-in`, `animate-pulse-dot`, `animate-shimmer` all have 0 utility-class uses. They are used as CSS class names (`.page-enter`, `.modal-sheet`, etc.) inside `globals.css`, so the keyframes are needed, but the Tailwind `animate-*` registrations are not (`tailwind.config.ts:183-192`).
  - `theme.extend.letterSpacing.{tighter,tight,mono,wider}` — 0 uses (`tailwind.config.ts:105-112`).
  - `theme.extend.screens.xs` — 0 `xs:` responsive uses (the comment at `tailwind.config.ts:169-181` admits as much).
- **Impact**: Confusing surface area when reading the config; no runtime impact.
- **Recommended fix**: Delete each of the above blocks from `tailwind.config.ts`. Keep the `@keyframes` in `globals.css` since `.page-enter`, `.modal-sheet`, etc. depend on them.

### F10 — Three different checkbox/radio implementations

- **Severity**: low (already covered visually by F2, but listed separately as a refactor target)
- **Evidence**: See F2. Five distinct className strings for the same widget across 8 sites.
- **Recommended fix**: Centralize in `<Checkbox>` and `<Radio>` React components in `components/editorial/` and rewrite all 8 sites.

---

## Remediation waves

All waves can run in parallel **except Wave 0**, which must complete first.

### Wave 0: Document the spacing & type scales (BLOCKING)

- **Owner**: 1 subagent. Blocks Waves 1–6.
- **Goal**: Stop the bleed. Make every future LLM/dev aware of the halved scales before they generate code.
- **Files**: `frontend/CLAUDE.md` (replace 1-line redirect), `frontend/AGENTS.md` (append a "Design system" section). Optionally `frontend/handoff 8/PRINCIPLES.md` (add cross-link).
- **Pattern to find** (in `CLAUDE.md`): `@AGENTS.md`
- **Pattern to replace with**: a fresh document with these sections:
  1. **Spacing**: explicit `w-1 = 2px ... w-48 = 96px` table, copied from `tailwind.config.ts:138-154`.
  2. **Type**: explicit `text-xs = 0.72rem (≈11.5px) ... text-5xl = clamp(...)` table from `tailwind.config.ts:87-102`, with bold "`text-sm` is NOT 14px" warning.
  3. **Hit target**: `min-h-hit = 44px` — use it on every interactive element.
  4. **Breakpoints**: list the actual screens, call out the `nav: 900px` tier (after Wave 4 lands it).
  5. **`ed-*` vs utilities**: rule of thumb — use the `ed-*` class for any visual primitive (button, card, input, badge, tabs); use utilities only for layout (flex/grid/gap/spacing). Cross-link `components/editorial/`.
- **Verification steps**: Open `CLAUDE.md` in Claude Code; confirm the file loads and the spacing table is readable. No build/preview check needed.
- **Out of scope**: Do not change `tailwind.config.ts`. Do not edit a single component file in this wave.

### Wave 1: Fix critical hit-target failures (checkboxes/radios)

- **Files** (exact list, 8 files):
  - `app/(household)/household/[id]/expenses/new/page.tsx` (lines 170, 205)
  - `app/(auth)/login/login-form.tsx` (line 174)
  - `app/settings/appearance/page.tsx` (lines 49, 93)
  - `app/settings/notifications/page.tsx` (line 173)
  - `app/(household)/household/[id]/calendar/new/page.tsx` (line 92)
  - `app/(finance)/income/add-deduction-form.tsx` (line 33)
  - `app/(forum)/forum/[slug]/threads/new/page.tsx` (line 181)
- **Pattern to find** (regex): `className="[^"]*\bw-(4|5)\s+h-(4|5)\b[^"]*"` on `<input type="checkbox"` or `type="radio"`; AND `w-\[15px\]\s*h-\[15px\]`.
- **Pattern to replace with**: standardize to `w-[18px] h-[18px]` (current best example), keeping any `accent-[var(--red)] cursor-pointer shrink-0` etc. Ensure the surrounding `<label>` carries `min-h-hit` so the *clickable row* is 44px even if the box is 18px. If no label wraps the input, add a wrapping `<label className="flex items-center gap-3 cursor-pointer min-h-hit">`.
- **Verification steps**: Open `/settings/appearance`, `/settings/notifications`, `/login`, the new-expense form (under `/household/[id]/expenses/new`), the new-thread form. With `mcp__Claude_Preview__preview_inspect` (serverId from the brief if available, otherwise use the running dev server), inspect each checkbox/radio with the selector `input[type="checkbox"]` or `input[type="radio"]` and confirm `width` / `height` ≥ 18px and the parent label `min-height` ≥ 44px. Resize to 375px viewport and confirm tap targets still hit.
- **Out of scope**: Do not replace native inputs with custom `<Checkbox>` component yet (that's F10 / follow-up). Do not touch toggle styles.

### Wave 2: Replace hand-rolled spinners with `<Spinner />`

- **Files** (4 files):
  - `app/(finance)/income/income-detail-panel.tsx` (line 31)
  - `app/(forum)/search/page.tsx` (line 52)
  - `app/(household)/household/[id]/expenses/[expenseId]/page.tsx` (line 51)
  - `app/(auth)/confirm-email/page.tsx` (line 82) and `app/(auth)/reset-password/page.tsx` (line 149) — inline-style spinners doing the same thing, sweep these too.
- **Pattern to find**: any `<div>` with `border-2`, `animate-spin`, and `border-t-` in its className, plus the two `style={{ border: "2px solid var(--ink-4)", ... animation: "spin ..." }}` cases.
- **Pattern to replace with**: `<Spinner size={20} />` for inline contexts; `<Spinner size={32} />` for page-level loading containers (the `h-[200px]` flex-centered cases). Add `import { Spinner } from "@/components/editorial/spinner";` (verify the exact path/alias by reading `components/editorial/index.ts` first).
- **Verification steps**: For each touched route (`/income`, `/search`, `/household/[id]/expenses/[expenseId]`, `/confirm-email`, `/reset-password`), throttle network in DevTools or trigger a slow query and confirm the spinner is visible and ~20–32px, animating, using `currentColor`. With `preview_inspect`, check `svg.animate-spin` resolves and bounding box is the requested size.
- **Out of scope**: Do not touch the toggle thumb at `manage-deductions-modal.tsx:147` (it uses `w-8 h-8` as a 16px circle — intentional). Do not touch `community-actions.tsx:38` (it's a skeleton, not a spinner).

### Wave 3: Right-size `text-sm` body copy

- **Files** (target list, ~12 files — restrict the wave to these to stay under the 10-file cap; spin a follow-up wave for the rest):
  - `app/settings/security/two-factor-section.tsx`
  - `app/settings/security/danger-zone-section.tsx`
  - `app/settings/security/active-sessions-section.tsx`
  - `app/settings/sessions/page.tsx`
  - `app/settings/connections/page.tsx`
  - `app/settings/connections/connection-card.tsx`
  - `app/settings/notifications/page.tsx`
  - `app/(finance)/income/manage-deductions-modal.tsx`
  - `app/(finance)/income/add-deduction-form.tsx`
  - `app/(forum)/forum/community-card.tsx`
  - `app/(forum)/page.tsx`
  - `app/(forum)/profile/[userId]/page.tsx`
- **Pattern to find**: `text-sm` on `<p>`, `<span>` carrying body/secondary copy (not labels, not button text, not table headers). Specifically: any `<p className="...text-sm...">`, and `<span>` strings that are descriptive (hints, counts, descriptions). Skip anywhere `font-mono uppercase tracking-` appears — those are labels, leave them.
- **Pattern to replace with**: `text-sm` → `text-base` (which is `0.875rem` = 14px in this scale). For metadata that should be even smaller, leave `text-sm`.
- **Verification steps**: Screenshot `/settings/security`, `/settings/notifications`, `/settings/connections`, `/forum/[community]`, `/forum/profile/[userId]` at desktop (1280) and mobile (375). Manually scan that secondary body copy is readable without zooming. With `preview_inspect`, query a known `<p>` (e.g. `p.text-base` near `Extra security via authenticator app`) and confirm `fontSize: 14px`.
- **Out of scope**: Do not rename `text-sm` in the Tailwind config — too much blast radius. Do not touch any element using `font-mono uppercase` (those are labels by intent). Do not touch `text-sm` inside arbitrary-class blends like `text-sm font-semibold` for badges/pills — those are fine.

### Wave 4: Formalize the 900px breakpoint as `nav:`

- **Files** (≤10 files):
  - `tailwind.config.ts` (add `nav: '900px'` to `screens`)
  - `components/layout/top-bar.tsx`
  - `components/layout/app-shell.tsx`
  - `app/(forum)/forum/page.tsx`
  - `app/(geography)/weather/weather-client.tsx`
  - `app/(geography)/weather/location-search.tsx`
  - `app/globals.css` (add a comment near each `@media (min-width: 900px)` / `(max-width: 900px)` that says `/* matches Tailwind 'nav' screen */`)
- **Pattern to find**: `min-\[900px\]:` → bulk replace with `nav:`. `max-\[900px\]:` → `max-nav:`.
- **Pattern to replace with**: see above.
- **Verification steps**: Resize the dev server to 899px and 901px and confirm the sidebar/topbar burger collapses at exactly the same point as before (no behavioural change — this is a rename). With `preview_resize` to 900px and `preview_inspect '.ed-topbar-burger'` confirm `display` flips at the boundary. Run `npm run build` to confirm Tailwind compiles the new `nav:` variant.
- **Out of scope**: Do not change the 900px value itself. Do not touch the `xs` screen (separate cleanup in Wave 6).

### Wave 5: Resolve color-system drift (delete dead semantic aliases)

- **Files**:
  - `tailwind.config.ts` (lines 38-77 — delete the `bg`, `surface`, `text`, `accent`, `success`, `warning`, `danger` blocks)
  - `app/(forum)/forum/[slug]/threads/[threadId]/thread-actions.tsx` (line 108 — swap `text-success` → `text-green`)
- **Pattern to find**: in config, the `// ── Semantic aliases ──` block. In code, the single `text-success` usage above.
- **Pattern to replace with**: deletion / `text-green`.
- **Verification steps**: Run `grep -rn -E '\b(text|bg|border)-(surface|accent|warning|danger|success)' app components` and confirm 0 results. Run `npm run build` and confirm no Tailwind errors. Open `/forum/[community]/threads/[id]` and confirm the report/save status pill still renders green.
- **Out of scope**: Do not touch CSS variables in `globals.css` (the `:root` `--surface`, `--danger`, etc. are still consumed by `ed-*` classes via `var(--…)` — leave them). Do not migrate editorial palette to semantic names — that's a separate strategic call (see Long-term).

### Wave 6: Delete remaining dead theme.extend entries

- **Files**:
  - `tailwind.config.ts` only.
- **Pattern to find**: in the config — `fontFamily.display`, `letterSpacing.{tighter,tight,mono,wider}`, `transitionDuration.{fast,mid,slow,page}`, `transitionTimingFunction['in-out']`, `animation` block (all 8 entries), `screens.xs`.
- **Pattern to replace with**: deletion.
- **Verification steps**: Re-run the same greps from F9 to confirm 0 utility consumers exist post-deletion. Run `npm run build` and `npm test` (vitest). Reload `/` and any page using `.page-enter`, `.modal-sheet`, `.ticker-track`, `.pulse-dot` and confirm animations still play (they depend on the `@keyframes` in `globals.css`, not on the `theme.extend.animation` registrations).
- **Out of scope**: Do not delete the keyframes in `globals.css`. Do not touch `theme.extend.spacing`, `fontSize`, `screens.{sm,md,lg,xl,2xl}`, `colors`, `boxShadow`, `borderRadius`, or `minHeight.hit` — those are all live.

### Wave 7: Centralize input-with-icon padding via a CSS modifier

- **Files**:
  - `app/globals.css` (add `.ed-input-with-icon { padding-left: 44px; }` near the `.ed-input` block around line 725)
  - `components/editorial/input.tsx` (line 45 — replace `${iconLeft ? "pl-11" : ""}` with `${iconLeft ? "ed-input-with-icon" : ""}`)
  - `app/(forum)/forum/forum-feed.tsx` (line 47 — replace `ed-input !pl-[44px]` with `ed-input ed-input-with-icon`)
- **Pattern to find**: `ed-input.*pl-11` and `ed-input.*!pl-\[44px\]`.
- **Pattern to replace with**: see above.
- **Verification steps**: Open `/forum` (forum-feed search) and any page using `<Input iconLeft={...}>`. With `preview_inspect 'input.ed-input'` confirm `paddingLeft: 44px`. Confirm the icon (positioned at `left-3` = 6px) sits ~10–14px from the text.
- **Out of scope**: Do not restructure the `<Input>` component beyond the className change.

---

## Long-term recommendations

These are strategic decisions the user should make before the next major design pass. They are NOT subagent-sized — flag them and move on.

1. **The halved spacing scale should be reverted.** It saves zero markup ergonomics (everyone still types numbers), costs an entire generation of developers + LLMs their muscle memory, and is the root cause of most findings here. Migration cost: high (you'd have to bulk-rewrite every numeric class in `app/` and `components/`), but it ends the recurring tax. If reversion isn't on the table, treat F1 (documentation) as load-bearing and link it from every PR template.

2. **Collapse `ed-*` into the utility layer, OR commit to it.** Right now the codebase is genuinely bi-modal: some pages render with utility classes (`bg-paper-2 border-ink p-6`), others with `ed-*` (`ed-card`). The `ed-*` system is more disciplined (single source of truth, themeable via CSS vars, doesn't suffer from the halved-spacing problem because it bakes in pixel values directly). Recommendation: make `ed-*` authoritative for *every* visual primitive (button, card, input, badge, tabs, modal, popover, sidebar, topbar) and restrict utilities to layout (flex, grid, gap, padding-for-layout, sizing-for-layout). Concretely: add `<Checkbox>`, `<Radio>`, `<Spinner>` (exists), `<IconButton>` components to `components/editorial/` so devs never reach for `<input type="checkbox" className="...">`.

3. **The semantic-alias color block in `tailwind.config.ts` is currently a fiction** — zero utility consumers. Either remove it (Wave 5) or commit to migrating editorial palette → semantic naming in a multi-day swap. Don't leave both around.

4. **`text-md` is not standard Tailwind.** It silently breaks if the config is ever rebuilt against vanilla Tailwind defaults (it'd fall back to `text-base`). Either rename to a clearly custom name (`text-body`, `text-ui`) or drop it and use `text-base` (currently `0.875rem`) for that 1rem target.

5. **The "redesign" appears to have been done in passes (`handoff 8/` directory).** The current state mixes pre- and post-redesign code. Consider a final sweep tracked as a checklist (every page reviewed for `ed-*` vs raw utility consistency, every body-copy `text-sm` audited, every interactive control verified to meet `min-h-hit`). The waves above are the start; expect 2–3 more comparable batches before the codebase is consistent end-to-end.
