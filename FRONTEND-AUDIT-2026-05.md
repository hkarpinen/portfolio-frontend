# Frontend Audit — May 2026

**Target:** `/Users/hankkarpinen/Desktop/Git/portfolio2/frontend` (Next.js 14.2, App Router, React 18, TS 5, Tailwind 3.4, React Query 5, RHF + Zod).

**Scope:** type coverage, Tailwind usage, SSR vs. client boundaries, caching & invalidation, duplication, test coverage. No code changes — report only.

---

## 0. Executive summary

The foundation is **better than the file count suggests**. A previous audit left clear fingerprints — a zod-validated API client (`api.parsed.*`), a `parsedServerFetch` for RSC, a centralized query-key factory (`lib/query-keys.ts`), centralized invalidation helpers (`lib/cache-invalidation.ts`), a single-mode design-token Tailwind config, strict TS with `consistent-type-imports`, and a clean server-vs-client module split (no `next/headers` ever leaking into a client bundle).

The systemic problem is **adoption drift**, not architecture:

| The pattern exists…                             | …but adoption is                                                                               | Evidence                                                      |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `api.parsed.*` (zod-validated)                  | ~half the call sites still use `api.get<T>` blind casts                                        | 27 untyped call sites across finance/identity/forum/household |
| `parsedServerFetch`                             | 3+ RSC pages still use `serverFetch<T>`                                                        | household settings pages                                      |
| `lib/formatting.ts` (`formatCurrency`)          | 6 hand-rolled `fmt0`/`fmtUsdInt`/`fmtCurrency` redefinitions                                   | finance + household pages                                     |
| `lib/cache-invalidation.ts` helpers             | calendar mutations hand-roll a fragile **predicate**; some hooks inline `qc.invalidateQueries` | `hooks/use-calendar.ts` lines 31, 56, 71                      |
| `<ConfirmDeleteDialog>` editorial primitive     | 3 places hand-roll inline confirm state                                                        | danger-zone, expense detail, connection-card                  |
| `components/editorial` barrel                   | 75% of imports go through deep paths anyway                                                    | 163 deep vs. 56 barrel                                        |
| Spacing / sizing tokens in `tailwind.config.ts` | 127 `gap-[Npx]` / `p-[Npx]` arbitrary values bypass the scale                                  | weather, math, household, settings                            |
| Custom `.border-ink` CSS shorthand              | 7 places still write `border-[var(--ink)]` (the trap the memory note warned about)             | location-search, 2fa, converter                               |

There are also **two structural gaps**:

1. **Test coverage is 89 tests / 6 files for 315 source files** — schemas are 100% covered, everything else is ~0%. Mutation hooks (which encode invalidation logic that breaks silently when wrong) and `lib/api-client.ts` error paths are completely untested. The framework is in place (Vitest + RTL + jsdom + CI gate); the gap is breadth, not infrastructure.
2. **No `loading.tsx` / `<Suspense>` streaming and no server actions.** Every mutation round-trips REST + React Query. The N+1 on the household landing page (1 list fetch + N `useHouseholdBalances` per card) is the most visible cost of that choice.

Overall grade: **B / B+** at the architectural level, **C+** at the code-hygiene level. Fixable in 4 phases of bounded work, with no architecture changes required.

---

## 1. TypeScript type coverage

### 1.1 Untyped API call sites — HIGH severity ⚠️

`api.get<T>(path)` performs a blind cast to `T`. `api.parsed.get(path, schema)` returns `z.infer<typeof schema>` and throws `ResponseValidationError` on contract drift. The audit comment in `lib/api-client.ts` lines 88–93 says exactly this. Yet **27 call sites still use the blind variant.**

| Module                             | Untyped calls | Examples                                                                                                      |
| ---------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------- |
| `lib/api/expenses.ts`              | 8             | `deleteExpense`, `markExpensePaid`, `markHouseholdExpensePaid`, `deleteHouseholdExpense`                      |
| `lib/api/identity.ts`              | 5             | `logout`, `login`, `changePassword`, `banUser`, `setUserRole`                                                 |
| `lib/api/households.ts`            | 4             | `removeMember`, `updateMemberRole`, `leaveHousehold`, `deleteHousehold`                                       |
| `lib/api/chores.ts`                | 3             | `assignChore`, `completeChore`, `deleteChore`                                                                 |
| `lib/api/forum.ts` + `calendar.ts` | 4             | `vote`, `joinCommunity`, `appointModerator`, `removeModerator`                                                |
| RSC pages (`serverFetch<T>`)       | 3             | household settings: `serverFetch<Household>`, `serverFetch<MembershipResponse[]>`, `serverFetch<UserProfile>` |

**Why this matters:** A backend rename ships, the casts keep compiling, the first symptom is `undefined.foo` in production. The whole reason the parsed variant exists is to surface the lie at the network boundary.

### 1.2 `as` casts — 162 total, HIGH severity for a handful, the rest MED

Worst-offender categories:

- **Leaflet `any` escape hatches** — [app/(geography)/weather/weather-map.tsx:26,29](<app/(geography)/weather/weather-map.tsx:26>) `(mapRef.current as any)._leaflet_id`. There are real `@types/leaflet` types for this; the cast is laziness.
- **Form data-shape casts** — [app/(finance)/expenses/expense-row.tsx:104](<app/(finance)/expenses/expense-row.tsx:104>), [app/(finance)/income/income-card-edit-form.tsx:37–38](<app/(finance)/income/income-card-edit-form.tsx:37>), [app/(finance)/income/deduction-config.ts:154](<app/(finance)/income/deduction-config.ts:154>) — string→enum casts that should narrow with a zod schema or a typed lookup.
- **Error-shape casts in `lib/api-client.ts:52–54`** — Justifiable but ugly. A single `ApiErrorPayload` zod schema (`{ error?: string; message?: string; detail?: string }`) would replace 3 lines of `(payload as { error?: string })` etc.

### 1.3 Explicit `any` — 2 instances + 3 justified disables

- [app/(household)/household/[id]/expenses/new/page.tsx:87,189](<app/(household)/household/[id]/expenses/new/page.tsx:87>) — `members.map((m: any) => …)`. The type loss is from `useHouseholdMembers` — once the hook is fully typed via `api.parsed.*`, the `: any` annotation becomes deletable.
- The 3 `@typescript-eslint/no-explicit-any` disables are for the Plaid `window.Plaid` global, which has no DT types. Justified; add to a `types/plaid.d.ts` ambient module instead so the disables disappear.

### 1.4 Hand-written type duplication of zod schemas — GOOD

I expected this to be bad; it isn't. `types/identity.ts`, `types/household.ts`, `types/household-expense.ts` all use `z.infer`. The split between `schemas/` (form input) and `types/` (wire/projection types) is the intentional and correct split. Don't unify them.

### 1.5 Untyped error handling — GOOD

`catch (e)` is consistently `unknown`, narrowed via `getErrorMessage` from `lib/error-messages.ts`. No bare `e.message` access found.

### 1.6 React component typing — GOOD

No `React.FC` anywhere. Props are explicit interfaces. `useState` is either inferred from an initializer or has an explicit generic. Don't touch.

### 1.7 What `tsconfig.json` should add

`strict: true` is on. Consider also turning on:

- `noUncheckedIndexedAccess` — would catch a class of `array[0].foo` bugs.
- `exactOptionalPropertyTypes` — would catch a few of the form-data casts in §1.2.
- `noImplicitOverride` — defensive only; cheap.

Each is a **breaking lint change**. Land in a separate PR with `--noEmit` first to count the fallout.

---

## 2. Tailwind usage

### 2.1 What's right — keep it

- `cn()` exists at [lib/utils.ts:4](lib/utils.ts:4), wraps `clsx + twMerge`. No direct `clsx()` calls in the wild. Use is uniform.
- Zero `dark:` classes — correct for the single-mode editorial palette.
- Design-token adoption is good: `bg-paper`, `text-ink-*`, `bg-red-soft` everywhere. No literal palette colors (`bg-blue-500`, `text-gray-*`) anywhere. **This is the win the previous redesign was after.**
- `prettier-plugin-tailwindcss` is installed so class order is auto-sorted on save.
- Module CSS is present (13 files) but scoped to **complex stateful interactions** (vote control, image upload, delete icon button). That's the correct line.

### 2.2 Arbitrary-value sprawl — MED/HIGH

**423 instances** of `className="…[…]…"` across the codebase. Three sub-problems:

| Sub-problem                                    | Count | Examples                                                                                                                                                                                                                                             |
| ---------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hardcoded spacing `gap-[Npx]`, `p-[Npx]`       | 127   | `gap-[5px]`, `px-[14px]`, `py-[6px]`, `p-[10px_12px]`, `p-[0_12px]`                                                                                                                                                                                  |
| Hardcoded sizes `h-[Npx]`, `w-[Npx]`           | 15+   | `h-[56px] w-[56px]` repeated 6× as an avatar                                                                                                                                                                                                         |
| `border-[var(--ink)]` instead of `.border-ink` | 7     | [app/(geography)/weather/location-search.tsx](<app/(geography)/weather/location-search.tsx>), [app/(auth)/login/2fa/page.tsx](<app/(auth)/login/2fa/page.tsx>), [app/(math)/convert/converter-client.tsx](<app/(math)/convert/converter-client.tsx>) |

The `border-[var(--ink)]` cases are the highest-priority cleanup — there's already a memory note that this is a footgun (the `.border-ink` shorthand in `globals.css` does work the same does _not_ fall back through Tailwind), and the seven sites that still write it are at risk of behavior drift when someone "fixes" `globals.css`.

The spacing values (7px, 14px) don't map to the configured scale (which is on 2px increments — `1:2px`, `2:4px`, `3:6px`, `4:8px`, `5:10px`, `6:12px`, `8:16px`). Either extend the scale to include the half-steps you actually use, or normalize the call sites. Pick one. Both is the worst.

### 2.3 Long className strings — component-extraction signal — MED

20 files have single classNames over 230 characters. Top three:

1. [app/(geography)/weather/location-search.tsx](<app/(geography)/weather/location-search.tsx>) — 319 chars
2. [app/(math)/convert/converter-client.tsx](<app/(math)/convert/converter-client.tsx>) — 308 chars
3. [app/(household)/household/[id]/mark-paid-button.tsx](<app/(household)/household/[id]/mark-paid-button.tsx>) — 294 chars (twice)

These are mostly button-variant logic done with inline conditional strings. **The library to reach for is not `cva` (heavy and adds a dep)** — instead, look at how `components/editorial/button.tsx` already does variants and either (a) extend it with more variants or (b) extract one new primitive per long-class component. The latter keeps the editorial vocabulary contained and is what the existing barrel was built for.

### 2.4 Repeated layout patterns — 5+ occurrences — MED

| Pattern                                                                        | Count | Existing primitive                                                               |
| ------------------------------------------------------------------------------ | ----- | -------------------------------------------------------------------------------- |
| `border-ink bg-paper p-8 shadow-stamp` (card)                                  | 6+    | `.ed-card` in globals.css (under-used)                                           |
| `flex items-center gap-N px-M py-K` (row)                                      | 20+   | none — candidate for `<EditorialRow>`                                            |
| `flex flex-col items-center gap-6 ... px-12 py-24 text-center` (empty state)   | 2     | `<EmptyState>` (used elsewhere — replace these two)                              |
| `font-mono text-xs uppercase tracking-[0.08em]` (action chip)                  | 10+   | none — candidate for an `<ActionLabel>` or a single utility class in globals.css |
| `h-[56px] w-[56px] flex items-center justify-center bg-red-soft` (avatar slot) | 6+    | none — already an `<Avatar>` and `<CommunityAvatar>` editorial; use them         |

### 2.5 Inline `style={{...}}` — 170 blocks — MED

Some are unavoidable (`app/opengraph-image.tsx` is satori), some are CSS-variable hand-offs in `app/layout.tsx`. But several are focus-state colors / box-shadows that should be `:focus` in `globals.css`:

- [app/settings/settings-ui.tsx:15–19](app/settings/settings-ui.tsx:15) — focus border + focus shadow inline.

### 2.6 Touch targets — MED

`min-h-hit: 44px` is configured but used **once** (and that one is `min-h-[44px]` — the arbitrary value, not the token). Several list-row action buttons are `h-7` (28px) — below WCAG 2.5.5 target size:

- [app/(household)/household/[id]/expenses-list.tsx](<app/(household)/household/[id]/expenses-list.tsx>) — `inline-flex h-7 w-7` delete button.
- Chore-row buttons, forum profile action buttons.

These are real a11y issues. Mobile users with imprecise touch (the everyone case) will mis-tap.

---

## 3. Server / client boundaries

### 3.1 Inventory (verified)

- **139 files with `"use client"`** (118 in `app/`, 21 in `components/`).
- **28 of 52 `page.tsx` files are `"use client"`** — ~54%.

That ratio is high. The reasonable target for a CRUD-heavy app with forms is 30–40% of pages being client; closer to 50% means there are page-level shells doing work the server could do.

### 3.2 What's right — keep it

- `lib/server-api-client.ts` deliberately doesn't import `next/headers` (the comment at lines 9–16 explains why); a separate `lib/server-cookies.ts` is the only place that does. **No client component imports a server-only module.** Verified.
- `<AppShellServer>` fetches session server-side and hands props to `<AppShell>` (client). Correct boundary placement.
- `<NotificationsProvider>` is scoped inside `<AppShell>`, not at root layout. Correct — only authenticated content needs it.
- Editorial primitives (`button`, `card`, `alert`, `badge`, `avatar`) are correctly **not** `"use client"`. They're pure JSX with props.
- Zero `next/dynamic({ ssr: false })`. No accidental client-only islands.

### 3.3 Pages marked `"use client"` that don't need to be — MED/HIGH

Highest-impact:

- [app/(forum)/search/page.tsx](<app/(forum)/search/page.tsx>) — entire page is client because it owns `useState` for the input and a 350ms debounce. Restructure: server page renders the search shell + initial empty/SEO content; a small `<SearchInput>` client component owns just the input + debounce + `useForumSearch`. Saves bundling the entire results layout.
- [app/(forum)/profile/[userId]/page.tsx](<app/(forum)/profile/[userId]/page.tsx>) — pure data display. Should be a server component that calls `parsedServerFetch` for the profile and hands initial data to a small client island for the interactive bits (follow/message buttons).
- [app/(household)/household/new/page.tsx](<app/(household)/household/new/page.tsx>) and `household/join/page.tsx` — form-only pages. The form must be client (RHF needs state) but the page shell around the form can be server.

The auth pages (login/register/reset/2fa/confirm-email) being `"use client"` is justified.

### 3.4 N+1 fetches at the household landing — HIGH ⚠️

[app/(household)/household/page.tsx:110](<app/(household)/household/page.tsx:110>) renders `<HouseholdBalanceBadge householdId={h.id} />` per card. Each badge calls `useHouseholdBalances(householdId)` client-side. **Result:** 1 server fetch for the household list + N client fetches for balances, fired in parallel on every visit.

Fix: add `fetchAllBalancesServer()` server helper that returns `Record<householdId, BalanceSummary>`, prefetch on the server page, hand the map down. The badge component still owns the React Query subscription but receives `initialData` keyed by householdId so it doesn't fire on mount.

### 3.5 `useEffect` for data fetching — 1 real offender — HIGH (for that one)

The Explore agent flagged several but most are legitimate (form seeding from a query result, debouncing, Sentry init, geolocation). The one real offender:

- [app/settings/sessions/page.tsx:56–70](app/settings/sessions/page.tsx:56) — manual `load()` in `useEffect`. No cache, no dedup, no stale-while-revalidate, no refetch on focus, no integration with the rest of the React Query graph. Convert to `useSessions()` in `hooks/use-identity.ts`.

The `useOverview(initialData)` / `useIncome(initialData)` pattern in `expenses-client.tsx` and `income-list.tsx` is **not** a double-fetch — React Query treats data passed via the `initialData` prop as fresh until `staleTime` expires, so no network request fires on mount. This is the correct SSR-hydration pattern. (Earlier I had this in the "double-fetch" bucket; corrected.)

### 3.6 No `loading.tsx`, no `<Suspense>` streaming, no server actions — INFORMATIONAL

The codebase has made a deliberate choice: no `revalidateTag` / `revalidatePath` / `'use server'` anywhere. All mutations are REST + React Query. All RSC fetches are `cache: "no-store"`.

This is **internally consistent and defensible** — one cache to reason about (React Query), no fan-out between Next's fetch cache and the query cache. The cost is no automatic streaming (every page waits for its slowest fetch before flushing) and no progressive form enhancement.

I'm not recommending you adopt server actions wholesale. But adding **one** `loading.tsx` per top-level route group + 2–3 `<Suspense>` boundaries around the slow fetches (`useHouseholdBalances`, `useNetPayBreakdown`, weather) would unlock the fast-LCP path without changing the architecture.

---

## 4. Caching & invalidation

### 4.1 What's right — keep it

- `lib/query-keys.ts` is the canonical key factory — hierarchical, typed, immutable. Used by every hook.
- `lib/cache-invalidation.ts` (90 lines, 7 helpers) is the canonical mutation→invalidation map. The doc comment at the top explicitly references the prior audit's lesson: **over-invalidation is preferable to silent stale data**.
- `enabled:` guards are correctly applied to **every** parameterized query (verified: 20+ hooks, 0 violations).
- Provider config at [components/layout/query-provider.tsx](components/layout/query-provider.tsx) — `staleTime: 30_000, retry: 1` — is sensible. Per-hook overrides to 60s for finance, 5min for tax/weather. No `refetchInterval`, no `refetchOnWindowFocus` overrides. Defaults are appropriate.

### 4.2 Predicate-based invalidation in `use-calendar.ts` — MED ⚠️

Confirmed: 3 sites at [hooks/use-calendar.ts:31, 56, 71](hooks/use-calendar.ts:31) use:

```ts
queryClient.invalidateQueries({
  predicate: (q) =>
    Array.isArray(q.queryKey) &&
    q.queryKey.includes(householdId) &&
    q.queryKey.includes("calendar"),
});
```

The string `"calendar"` here is a magic string that bypasses the `financeKeys` factory entirely. If `financeKeys.calendarEvents` is renamed (e.g., to `"calendar-events"`), the predicate silently stops matching and the cache silently goes stale. Replace with an explicit `invalidateHouseholdCalendar(qc, householdId)` helper in `lib/cache-invalidation.ts`.

### 4.3 Inline `qc.invalidateQueries` in `useUpdateHousehold` and admin hooks — LOW/MED

[hooks/use-household.ts:67–80](hooks/use-household.ts:67) (`useUpdateHousehold`) hand-rolls a minimal invalidation set (households + household + householdDetail, no contributions/dashboard). This is intentionally narrower than `invalidateAllHouseholds()` because a rename doesn't change financial projections — but the fact that it doesn't use a helper means **the decision lives in a hook file, not in `cache-invalidation.ts`**. Move it; even a `invalidateHouseholdMetadata()` helper with the doc-comment "rename/currency only — no projection invalidation needed" makes the invariant findable.

Similarly: `useBanUser` and `useChangeUserRole` in `hooks/use-identity.ts` invalidate `identityKeys.all` (a coarse blast that also wipes `identityKeys.me()`). Either tighten the scope or document the over-invalidation.

### 4.4 One inline string-array key — LOW

[hooks/use-forum.ts:126](hooks/use-forum.ts:126) — `useProfileComments` builds:

```ts
queryKey: [...forumKeys.profile(userId), "comments", page];
```

Add `profileComments: (userId, page) => […, "comments", page]` to `forumKeys` and import it.

### 4.5 `staleTime: Infinity` in `use-converter.ts` — LOW ✓

[app/(math)/convert/use-converter.ts:30,54](<app/(math)/convert/use-converter.ts:30>) — units catalog and conversion results. The unit catalog is SI/standard; conversion is `f(from,to,value)` with deterministic output. `Infinity` is correct. Add a brief doc-comment so the next reader doesn't "fix" it.

### 4.6 Server-side cache: 100% `no-store` — INFORMATIONAL

`lib/server-api-client.ts` hardcodes `cache: "no-store"` for both `serverFetch` and `parsedServerFetch`. This is by design (auth-cookie-bound; can't safely share across users). The places where it could be relaxed are:

- **Communities list** (`app/(forum)/page.tsx`) — public; rename/add is rare. `cache: "force-cache", next: { tags: ["communities"] }` + `revalidateTag("communities")` from a `createCommunity` mutation server action.
- **Math units catalog** — fully static. `next: { revalidate: false }`.
- **Weather** — public per-city, 5-min freshness already configured client-side; could be `next: { revalidate: 300, tags: ["weather", city] }`.

These three would each save a backend round-trip per page view at zero correctness risk. **Not urgent.** Mention in the long-term plan only.

---

## 5. Duplication & inconsistency

### 5.1 Currency formatters — 6 implementations, 1 canonical — HIGH ⚠️

Verified:

```
app/(finance)/expenses/expenses-derivations.ts:27   export const fmtUsdInt = …
app/(finance)/expenses/financial-summary.tsx:29     const fmt0 = …  (USD-only)
app/(finance)/income/page.tsx:21                    const fmt0 = …  (USD-only)
app/(household)/household/[id]/page.tsx:21          const fmt0 = …  (currency param)
lib/finance/editorial-copy.ts:8                     internal fmt0
lib/household/editorial-copy.ts:8                   internal fmt0
lib/formatting.ts                                   formatCurrency()  ← canonical
```

This is exactly the kind of drift you asked me to find. Three of these forgo the `currency` parameter and hardcode `$` — meaning if you ever support non-USD households end-to-end, the `(finance)/*` pages will display `$` for EUR balances. Centralize on `formatCurrency` from `lib/formatting.ts`; delete the rest; the call sites become `formatCurrency(amount, currency, { precision: 0 })` or similar.

### 5.2 Hand-rolled confirm-delete dialogs — MED

`<ConfirmDeleteDialog>` exists in editorial and is used correctly by 4 places. 3 places hand-roll it:

- [app/(household)/household/[id]/settings/danger-zone.tsx](<app/(household)/household/[id]/settings/danger-zone.tsx>) — inline state + conditional rendering.
- [app/(household)/household/[id]/expenses/[expenseId]/page.tsx](<app/(household)/household/[id]/expenses/[expenseId]/page.tsx>) — `ExpenseActions` subcomponent has its own confirm state.
- [app/settings/connections/connection-card.tsx](app/settings/connections/connection-card.tsx) — inline "Confirm remove" button.

### 5.3 Inline loading UI — MED

`<Spinner>`, `<LoadingSplash>`, `<ListWithLoadingAndEmpty>` all exist in editorial. Yet 4–5 components hand-roll `<div className="animate-spin border-2 border-ink-4 border-t-ink" />`:

- [app/(portfolio)/admin/page.tsx](<app/(portfolio)/admin/page.tsx>)
- [app/(finance)/income/income-detail-panel.tsx:30–34](<app/(finance)/income/income-detail-panel.tsx:30>)
- [app/(household)/household/[id]/expenses/[expenseId]/page.tsx:62–66](<app/(household)/household/[id]/expenses/[expenseId]/page.tsx:62>)
- [app/(forum)/search/page.tsx:56–61](<app/(forum)/search/page.tsx:56>)
- [app/(forum)/forum/g/[slug]/settings/members-tab.tsx](<app/(forum)/forum/g/[slug]/settings/members-tab.tsx>)

Plus 8+ bare `"Loading…"` text strings. Pick one (`<Spinner size="sm">` for inline, `<LoadingSplash>` for page-level, `<ListWithLoadingAndEmpty>` for list pages), delete the rest.

### 5.4 Bypass of API client — HIGH (for one), LOW (for two) ⚠️

- [app/(forum)/forum/g/[slug]/threads/[threadId]/thread-actions.tsx:73](<app/(forum)/forum/g/[slug]/threads/[threadId]/thread-actions.tsx:73>) and [report-button.tsx:59](<app/(forum)/forum/g/[slug]/threads/[threadId]/report-button.tsx:59>) — direct `fetch("/api/forum/...report")`. Two files, one feature (report). They duplicate each other AND bypass the API layer. Either extract to a `useReportContent()` hook or, since it's fire-and-forget, an `api.post` call with no body type.
- [lib/api/notifications.ts:29,36](lib/api/notifications.ts:29) — direct `fetch(..., { keepalive: true })`. The `keepalive` flag is the reason for the bypass (so the request survives a page navigation). This is **justified**, but worth a comment explaining why the centralized client isn't used.

### 5.5 Editorial barrel under-used — MED (consistency)

`components/editorial/index.ts` re-exports 38 things. **163 imports use deep paths; 56 use the barrel.** Pick one. The advantage of the barrel is rename-safety and discoverability; the cost is a tiny bundle hit in Next.js (mostly tree-shaken away). I'd choose the barrel and let the eslint rule `no-restricted-imports` enforce it for `@/components/editorial/*`.

### 5.6 `components/layout/page-breadcrumbs.tsx` is dead — LOW

The file is imported nowhere. Meanwhile, [app/(finance)/expenses/new/page.tsx](<app/(finance)/expenses/new/page.tsx>) and [app/(finance)/income/new/page.tsx](<app/(finance)/income/new/page.tsx>) hand-roll `<nav class="ed-breadcrumb">`. Either use the component or delete it; don't ship both.

### 5.7 Editorial copy — LOW

The `lib/{finance,forum,household,notifications}/editorial-copy.ts` files exist for centralizing display strings. The duplicate of `"Thanks for the report. Our moderators will review it shortly."` appearing in both `thread-actions.tsx` and `report-button.tsx` is the textbook case.

---

## 6. Tests

### 6.1 Inventory

| Surface                                                             | Source | Tested               | Note                    |
| ------------------------------------------------------------------- | ------ | -------------------- | ----------------------- |
| `schemas/*`                                                         | 3      | 3                    | ✅ 100%                 |
| `lib/utils.ts`, `lib/contributions.ts`                              | 2      | 2                    | ✅                      |
| `components/editorial/*`                                            | 38     | 1 (DeleteIconButton) | ❌ 2.6%                 |
| `components/layout/*`                                               | 10     | 0                    | ❌                      |
| `hooks/*`                                                           | 14     | 0                    | ❌ **highest risk**     |
| `lib/api/*`                                                         | 13     | 0                    | ❌                      |
| `lib/api-client.ts`, `cache-invalidation.ts`, `formatting.ts`, etc. | 11     | 0                    | ❌                      |
| `app/**/page.tsx`                                                   | 47     | 0                    | ❌ no integration tests |

**89 test cases across 6 files** vs. ~315 source files.

### 6.2 What's right — keep it

- Test infra is set up (Vitest, jsdom, RTL, jest-dom matchers, `tests/setup.ts` with `cleanup()`).
- The CI workflow (`.github/workflows/docker-publish.yml`) runs `npm test` and gates the build on it.
- The existing tests are **good**: semantic queries, fake timers for time-based logic, mocked callbacks (not over-mocked internals).

### 6.3 The two highest-leverage gaps

These are the tests that would catch real bugs in code you've already shipped:

1. **`lib/cache-invalidation.ts`** — 7 small functions. Test recipe: `const qc = new QueryClient(); qc.setQueryData(financeKeys.householdBalances("h1"), 42); invalidateHouseholdExpenseList(qc, "h1"); expect(qc.getQueryState(financeKeys.householdBalances("h1"))?.isInvalidated).toBe(true);`. ~30 minutes per helper, 3.5 hours total, catches every cascade typo.

2. **Mutation hooks** — pick the 5 highest-risk first: `useDeleteExpense`, `useMarkHouseholdExpensePaid`, `usePayContributionSplit`, `useDeleteHouseholdExpense`, `useRemoveMember`. Use `renderHook` + `QueryClientProvider`, mock the underlying `fetch`, assert the right helper was invoked. Catches the silent staleness bug class.

A shared `tests/test-utils/render-with-query-client.tsx` would prevent the 14-hook test suite from duplicating setup. Build it first.

### 6.4 Other targeted gaps worth filling

- **`lib/api-client.ts` error paths** — 3 fallback shapes (`.error`, `.message`, `.detail`); 204 handling; `ResponseValidationError` thrown shape. Pure-function tests with a mocked `fetch`.
- **`lib/formatting.ts`** — once `fmt0`/`fmtUsdInt` are consolidated here (§5.1), test the formatting paths (USD, EUR, zero, negative, integer-only mode).
- **`<ConfirmDeleteDialog>`** — opens, closes, calls onConfirm only on confirm-click, calls onClose on cancel.

### 6.5 Pre-commit gate — LOW

CI runs the tests; no local pre-commit hook. Adding `husky` + a pre-commit running `tsc --noEmit && eslint . && vitest run --changed` would catch ~80% of CI-failing PRs locally. This is opinion; some teams hate hooks.

---

## 7. Remediation plan — 4 phases

The phases are ordered by **risk × leverage** — earlier phases catch correctness bugs, later phases improve hygiene. Each phase is **independently shippable** and bounded so you don't have a 3-week chunk staring at you.

### Phase 1 — Wire the safety nets (1–2 days)

Goal: every mutation hook is tested; every cascade is verified; no silent staleness can ship.

1. Add `tests/test-utils/render-with-query-client.tsx`.
2. Write 7 tests for `lib/cache-invalidation.ts` (one per helper).
3. Write 5 tests for the highest-risk mutation hooks (§6.3).
4. Write tests for `lib/api-client.ts` error paths (3 fallback shapes, 204, `ResponseValidationError`).
5. Replace the `use-calendar.ts` predicate pattern with an explicit `invalidateHouseholdCalendar(qc, householdId)` helper (§4.2).
6. Add `useUpdateHousehold` invalidation to `cache-invalidation.ts` (as `invalidateHouseholdMetadata`) with the "no-projection-touch" justification in a doc comment (§4.3).

**Exit criterion:** `vitest run` shows ≥30 new test cases passing, all green.

### Phase 2 — Adopt the parsed API client (2–3 days)

Goal: every untyped `api.get<T>` becomes `api.parsed.get(schema)`; every untyped `serverFetch<T>` becomes `parsedServerFetch(schema)`.

1. Inventory the 27 sites from §1.1.
2. For each, decide: a schema already exists in `schemas/*` (use it) or it doesn't (write it, place in the appropriate `schemas/` file).
3. Migrate **module by module** (start with `lib/api/identity.ts` — smallest blast radius), run the test suite after each.
4. Delete the cast-narrowing helpers that become redundant in form code (§1.2 form-data casts).
5. Add an ESLint rule (or a custom lint) that flags `api.get<` / `api.post<` etc. — once the migration is done, no new untyped calls can sneak in.

**Exit criterion:** `rg "api\\.(get|post|put|patch|delete|upload)<" lib app components` returns 0.

### Phase 3 — Consolidate UI primitives & formatters (3–5 days)

Goal: one way to format money, one way to confirm a delete, one way to render a spinner.

1. **Formatters (§5.1):** delete the 5 `fmt0`/`fmtUsdInt`/`fmtCurrency` redefinitions; replace call sites with `formatCurrency(value, currency, { precision: 0 })` from `lib/formatting.ts`. Extend `formatting.ts` if needed (precision option, signed mode for `±$N`).
2. **Confirm-delete (§5.2):** convert the 3 hand-rolled dialogs to `<ConfirmDeleteDialog>`.
3. **Loading UI (§5.3):** convert inline spinners to `<Spinner>`; convert page-level to `<LoadingSplash>`; convert list pages to `<ListWithLoadingAndEmpty>`. Settle on one component per context.
4. **Report bypass (§5.4):** wrap the 2 fetch calls in a `useReportContent(targetId, kind)` hook so both `thread-actions` and `report-button` share one implementation.
5. **Editorial copy (§5.7):** move the 3–5 duplicated strings into `lib/{forum,identity}/editorial-copy.ts`.
6. **Barrel imports (§5.5):** add an eslint `no-restricted-imports` rule for `@/components/editorial/*` (suggest the barrel); auto-fix the existing 163 deep imports.
7. **Delete dead `page-breadcrumbs.tsx` or adopt it** in the 2 hand-rolled breadcrumb pages.

**Exit criterion:** `rg "fmt0|fmtUsdInt"` returns 0 outside `lib/formatting.ts`. Manual spot-check the 3 confirm flows still work.

### Phase 4 — Tighten the boundary and the design system (5–7 days)

Goal: fewer client-only pages, cleaner Tailwind, fewer touch-target violations.

1. **Server-ify the 4 client-only pages (§3.3):** `(forum)/search/page.tsx`, `(forum)/profile/[userId]/page.tsx`, `household/new/page.tsx`, `household/join/page.tsx`. Each becomes a server shell + small client island.
2. **Fix the household balance N+1 (§3.4):** add `fetchAllBalancesServer()`, prefetch in `app/(household)/household/page.tsx`, pass `initialData` map to `<HouseholdBalanceBadge>`.
3. **Convert `app/settings/sessions/page.tsx` `useEffect` to a `useSessions()` hook (§3.5).**
4. **`border-[var(--ink)]` → `.border-ink`** in the 7 sites (§2.2).
5. **Spacing normalization (§2.2):** either extend the Tailwind spacing scale to include `7`, `14`, etc., or normalize the 127 arbitrary-value spacing classes to scale values. Pick one.
6. **Touch targets (§2.6):** find every interactive element under `h-9` (36px) and bring it to `min-h-hit`.
7. **Inline `style={{}}` audit (§2.5):** move the focus-state styles in `settings-ui.tsx` and similar to globals.css `:focus` rules.
8. **(Optional) Add one `loading.tsx` per route group + 2–3 `<Suspense>` boundaries** around the slow fetches (§3.6).

**Exit criterion:** Lighthouse a11y score ≥95 on `/household`, `/forum`, `/expenses`. `rg "border-\\[var\\(--ink\\)\\]"` returns 0. JS bundle for `/forum/search` drops measurably.

### Phase 5 (later, optional) — Server-side caching for read-mostly endpoints (1 day)

Goal: trade some architectural simplicity for one round-trip saved per page view on three high-traffic endpoints (§4.6).

Only do this if performance monitoring shows the backend roundtrip is hurting LCP. Otherwise document the decision and move on.

---

## 8. What to deliberately NOT change

The previous audit clearly worked. These are the things that already pay off — don't disrupt them:

- The `api.parsed.*` / `parsedServerFetch` split (vs. raw `api.get<T>` / `serverFetch<T>`). Migrate the call sites; don't reorganize the client.
- `lib/query-keys.ts` as the single key factory and `lib/cache-invalidation.ts` as the single cascade map.
- `types/` (wire/projection) vs. `schemas/` (form input) split — they intentionally cover different domains.
- The editorial design tokens — no literal Tailwind palette colors anywhere, no `dark:` classes anywhere. This is the win.
- `<AppShellServer>` → `<AppShell>` → `<NotificationsProvider>` layering. The boundary is exactly where it should be.
- React Query as the single client cache (no `revalidateTag` / `revalidatePath`). Internally consistent. Don't half-adopt server actions.
- `consistent-type-imports`, `no-unused-vars`, `unused-imports/*`, `react/jsx-boolean-value: never`, `react/jsx-curly-brace-presence: never` in `.eslintrc.json`. These are doing real work.
- Vitest + RTL + jsdom infra (good); CI gate on `npm test` (good). Just need more tests, not different test infra.

---

## 9. Severity-ordered top-10 (if you only do ten things)

1. **Replace `useHouseholdBalances` per-card with a server-prefetched balance map** (§3.4). One change, eliminates N+1.
2. **Migrate the 27 untyped API call sites to `api.parsed.*` / `parsedServerFetch`** (§1.1). Catches the next backend rename at build time.
3. **Write tests for `lib/cache-invalidation.ts` and the 5 highest-risk mutation hooks** (§6.3). Catches silent staleness.
4. **Consolidate `fmt0`/`fmtUsdInt`/`fmtCurrency` onto `formatCurrency`** (§5.1). Fixes the cross-currency display bug latent in finance pages.
5. **Replace `use-calendar.ts` predicate invalidation with an explicit helper** (§4.2). Eliminates a silent-failure trap.
6. **Convert the 3 hand-rolled confirm-delete dialogs to `<ConfirmDeleteDialog>`** (§5.2). Pure DRY.
7. **`border-[var(--ink)]` → `.border-ink`** in the 7 sites (§2.2). Removes the memory-flagged footgun.
8. **Server-ify the 4 client-only pages** (`search`, `profile/[userId]`, `household/new`, `household/join`) (§3.3). Reduces JS bundle on every navigation.
9. **`useSessions` hook** replacing the `useEffect` fetch in `app/settings/sessions/page.tsx` (§3.5). Brings sessions into the React Query cache graph.
10. **Add `noUncheckedIndexedAccess` to tsconfig** and fix the fallout (§1.7). Catches a class of `arr[0].foo` bugs that strict mode misses.
