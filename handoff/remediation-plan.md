# Frontend Remediation Plan — Sonnet Subagent Waves

Companion to [`handoff/tailwind-audit.md`](./tailwind-audit.md). That document covers spacing/type scale documentation, checkboxes, spinners, body-copy `text-sm`, the 900px breakpoint, semantic-alias colors, dead `theme.extend` entries, and `ed-input` icon padding (Waves 0–7 in that file). **Those waves are not repeated here** — execute them in parallel with these.

This plan covers what that audit doesn't: **dead code, duplicated component logic, and legacy styling patterns beyond the Tailwind config**. Every wave is sized for one Sonnet subagent.

---

## Executive summary

| Area | Severity | Top finding |
|---|---|---|
| Dead code | Low volume, high confidence | `hooks/use-plaid.ts` is a 173-line duplicate of `use-connections.ts` with 0 imports; `components/layout/nav-auth.tsx` is orphaned (only its own test imports it); `handoff 8/` is 1.3 MB / 77 untracked reference files |
| Duplicated logic | High volume | 52 hand-written money-format call sites, 15+ ad-hoc date formatters, 20+ copy-pasted "loading / empty / list" blocks, two near-identical vote-button components, 10+ avatar-initial inline implementations |
| Legacy styling (beyond Tailwind audit) | High volume | 115+ raw `<button>` elements bypassing `<Button>`/`ed-button`; 44+ raw form inputs bypassing `ed-input`; 121+ arbitrary px values; 20+ `text-[0.7Xrem]` workarounds for the halved scale |

Total estimated effort: **~25–35 hours of Sonnet work** spread across 13 waves. Most waves are mechanical find/replace; a few introduce small shared components in `components/editorial/`.

---

## Decisions locked in

1. **`handoff 8/` directory (1.3 MB, 77 files, untracked)** — **leave in place**. Do not delete, move, or `.gitignore`.

2. **`public/cv.pdf` and `public/hank_headshot.jpeg`** — **keep and wire up**. Both are currently unreferenced in code, but the CSS in [globals.css:1945-1952](app/globals.css:1945) already defines `.ed-about-headshot` with `object-fit: cover` waiting for an image. Wave 14 (below) adds the wiring.

3. **Next.js boilerplate SVGs** (`public/{file,globe,next,vercel,window}.svg`) — delete in Wave 0. Zero references, no design value.

---

## Wave order

Run **Wave 0** first (it's quick and unblocks everything). After that, the waves are independent and can run in parallel up to your concurrency limit.

```
Wave 0 ─ dead code purge        (blocking — touches files other waves may also touch)
  │
  ├─ Wave 1 ─ lib/formatting.ts + money/date bulk replace
  ├─ Wave 2 ─ lib/error-messages.ts + bulk replace
  ├─ Wave 3 ─ <UserInitials> + bulk replace
  ├─ Wave 4 ─ <ConfirmDeleteDialog>
  ├─ Wave 5 ─ <VoteControl> + useVoteOptimistic
  ├─ Wave 6 ─ <ListWithLoadingAndEmpty>
  ├─ Wave 7 ─ useFormSubmit hook
  ├─ Wave 8 ─ raw <button> → <Button>
  ├─ Wave 9 ─ raw <input>/<select>/<textarea> → <Input>/ed-input
  ├─ Wave 10 ─ arbitrary border-[var(--X)] → named utilities
  ├─ Wave 11 ─ arbitrary text-[0.7Xrem] → named scale
  ├─ Wave 12 ─ z-index scale + bulk replace
  ├─ Wave 13 ─ hand-rolled tabs → <EditorialTabs>
  └─ Wave 14 ─ wire CV + headshot into /about
```

Waves 8 and 9 will touch many of the same files as the existing audit's Waves 1 and 7. **Run the existing audit's Wave 0 (CLAUDE.md spacing doc) first**, then this Wave 0, then the rest can run concurrently with care: don't dispatch Wave 8 and audit-Wave 1 on the same files in parallel.

---

## Wave 0 — Dead code purge (BLOCKING)

**Owner**: 1 Sonnet subagent. **Effort**: 30 min. **Risk**: low.

### Goal
Delete files with zero runtime consumers. Keeps later waves from accidentally migrating dead code.

### Files to delete (high confidence — verified 0 production imports)

1. **`hooks/use-plaid.ts`** — 173 lines, 0 imports anywhere. The 7 exported hooks (`usePlaidLink`, `usePlaidItems`, `useSyncPlaidItem`, `useUnlinkPlaidItem`, `useRecurringStreams`, `useRefreshRecurring`, `useAcceptRecurring`) all have working duplicates in `hooks/use-connections.ts` (which has 3 active import sites: [connection-card.tsx](app/settings/connections/connection-card.tsx:4), [connections/page.tsx](app/settings/connections/page.tsx:3), [plaid-income-suggestions.tsx](app/\(finance\)/income/plaid-income-suggestions.tsx:4)). The `plaidKeys` export is replaced by `connectionKeys`.
2. **`components/layout/nav-auth.tsx`** — referenced only by its own test file.
3. **`components/layout/nav-auth.module.css`** — companion to above.
4. **`tests/components/nav-auth.test.tsx`** — test for deleted component.
5. **`public/file.svg`**, **`public/globe.svg`**, **`public/next.svg`**, **`public/vercel.svg`**, **`public/window.svg`** — Next.js boilerplate, 0 references in `app/`, `components/`, `globals.css`, or `next.config.mjs`.

### Verification (mandatory before commit)

```bash
# After deletion, these must each return zero matches:
grep -rn "use-plaid"        app components hooks lib tests
grep -rn "nav-auth"         app components hooks lib tests
grep -rn "plaidKeys"        app components hooks lib tests
grep -rn "file\\.svg\\|globe\\.svg\\|next\\.svg\\|vercel\\.svg\\|window\\.svg" app components globals.css public next.config.mjs
```

Then: `npm run build && npm test`. Both must pass.

### Out of scope
Do NOT delete `public/cv.pdf` or `public/hank_headshot.jpeg` — those are user content. Do NOT delete `handoff 8/` — that's a user decision (see Confirmation section above). Do NOT touch the `escapeHtml` helper in [lib/utils.ts](lib/utils.ts) even though it's only used in the same file — it's a private helper, fine where it is.

---

## Wave 1 — Money & date formatters (bulk extraction)

**Effort**: 2 hours. **Risk**: low. **Files touched**: ~35.

### Goal
Replace 52 hand-written money-format calls and 15+ date-format calls with three shared functions. Eliminates a whole class of inconsistency bugs (currency code placement, decimal precision, locale).

### Step 1 — Create `lib/formatting.ts`

```ts
// lib/formatting.ts
export function formatCurrency(amount: number, currency = "USD"): string {
  return `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatShortDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatFullDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
```

### Step 2 — Bulk replace

Use grep + manual review to swap each site. Do NOT use sed — many call sites have surrounding `${}` template syntax that needs to be unwrapped.

**Find**: `\.toFixed\(2\)` → wrap the numeric expression in `formatAmount(...)`.
**Find**: `\.toLocaleString\("en-US",\s*\{\s*minimumFractionDigits:\s*2` blocks → `formatAmount(...)` or `formatCurrency(amount, currency)`.
**Find**: `\.toLocaleDateString\("en-US",\s*\{\s*month:\s*"short"` blocks → `formatShortDate(...)`.

**Known target files** (sourced from the duplication audit):
- [app/(finance)/expenses/add-expense-form.tsx](app/\(finance\)/expenses/add-expense-form.tsx)
- [app/(finance)/expenses/expenses-client.tsx](app/\(finance\)/expenses/expenses-client.tsx)
- [app/(finance)/income/deduction-chip.tsx](app/\(finance\)/income/deduction-chip.tsx)
- [app/(finance)/income/income-list.tsx](app/\(finance\)/income/income-list.tsx)
- [app/(household)/household/[id]/expenses-list.tsx](app/\(household\)/household/\[id\]/expenses-list.tsx)
- [app/(household)/household/[id]/expenses/[expenseId]/expense-splits.tsx](app/\(household\)/household/\[id\]/expenses/\[expenseId\]/expense-splits.tsx)
- [app/(household)/contributions/period-card.tsx](app/\(household\)/contributions/period-card.tsx)
- [app/(forum)/forum/community-card.tsx](app/\(forum\)/forum/community-card.tsx) (dates)
- [app/settings/connections/connection-card.tsx](app/settings/connections/connection-card.tsx) (dates)

After the wave, this grep should return **only** `lib/formatting.ts`:
```bash
grep -rn "minimumFractionDigits:\\s*2" app components
```

### Verification
- `npm run build && npm test` pass.
- `/expenses`, `/income`, `/household/[id]/expenses`, `/household/[id]/contributions`, `/forum`, `/settings/connections` render with identical money/date formatting (visual screenshot diff).

### Out of scope
Do NOT touch `timeAgo()` in [lib/utils.ts](lib/utils.ts) — it's already correctly centralized. Do NOT introduce a new date library (no `date-fns`, no `dayjs`) — keep the native `Intl` API.

---

## Wave 2 — Error message constants

**Effort**: 30 min. **Risk**: trivial. **Files touched**: ~12.

### Goal
The string `"Something went wrong. Please try again."` appears verbatim in 10+ form catch blocks. Centralize it.

### Step 1 — Create `lib/error-messages.ts`

```ts
// lib/error-messages.ts
export const ERROR = {
  DEFAULT: "Something went wrong. Please try again.",
  NETWORK: "Couldn't reach the server. Check your connection.",
  VALIDATION: "Some fields need attention.",
} as const;
```

### Step 2 — Bulk replace

**Find**: literal string `"Something went wrong. Please try again."` and `"Something went wrong."` in TSX.
**Replace with**: `ERROR.DEFAULT` (add import).

**Known sites**: [login-form.tsx:45](app/\(auth\)/login/login-form.tsx:45), [add-expense-form.tsx:67](app/\(finance\)/expenses/add-expense-form.tsx:67), [new-community-form.tsx:75](app/\(forum\)/forum/new/new-community-form.tsx:75), [add-income-form.tsx](app/\(finance\)/income/add-income-form.tsx), and ~6 more — grep for the exact string.

### Verification
```bash
grep -rn '"Something went wrong' app components | grep -v error-messages.ts
```
Must return zero results.

### Out of scope
Do NOT also try to extract field-level validation messages — those vary per form and zod owns them.

---

## Wave 3 — `<UserInitials>` component

**Effort**: 2 hours. **Risk**: low. **Files touched**: ~10.

### Goal
Avatar/initials rendering is hand-rolled in ~10 sites with subtly different markup. `getInitials()` is already shared (good), but the surrounding `<div className="bg-red-soft text-red flex items-center justify-center font-bold font-serif">{getInitials(name)}</div>` block is copy-pasted. Sizes vary (28px, 32px, 40px) per site.

### Step 1 — Create `components/editorial/user-initials.tsx`

```tsx
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";
const SIZE_CLASS: Record<Size, string> = {
  sm: "w-7 h-7 text-[0.66rem]",   // 14px × 14px (halved scale; verify against design)
  md: "w-9 h-9 text-xs",          // 18px × 18px
  lg: "w-12 h-12 text-base",      // 24px × 24px
};

export function UserInitials({
  name,
  avatarUrl,
  size = "md",
  className,
}: {
  name?: string | null;
  avatarUrl?: string | null;
  size?: Size;
  className?: string;
}) {
  const classes = cn(
    "flex items-center justify-center shrink-0 font-bold font-serif",
    SIZE_CLASS[size],
    className,
  );

  if (avatarUrl) {
    return <img src={avatarUrl} alt="" className={cn("object-cover", classes)} />;
  }

  return (
    <div className={cn("bg-red-soft text-red", classes)}>
      {getInitials(name ?? "")}
    </div>
  );
}
```

### Step 2 — Bulk replace

**Pattern to find** (regex): inline avatar/initials markup, typically:
```tsx
<div className="...bg-red-soft text-red...">{getInitials(name)}</div>
```

**Known sites**:
- [app/(forum)/forum/community-card.tsx:34-45](app/\(forum\)/forum/community-card.tsx:34)
- [app/(household)/household/[id]/expenses/[expenseId]/expense-splits.tsx:114-123](app/\(household\)/household/\[id\]/expenses/\[expenseId\]/expense-splits.tsx:114)
- [app/(forum)/forum/g/[slug]/settings/members-tab.tsx](app/\(forum\)/forum/g/\[slug\]/settings/members-tab.tsx)
- [app/(forum)/page.tsx:118-119](app/\(forum\)/page.tsx:118)
- Also check [components/layout/sidebar-nav.tsx](components/layout/sidebar-nav.tsx) (existing `<Avatar>`) and [components/editorial/community-avatar.tsx](components/editorial/community-avatar.tsx) — consider whether to keep them as-is (they're domain-specific) or unify with `<UserInitials>`. **Default: leave both; `<UserInitials>` is just for hand-rolled sites.**

### Verification
- Visual diff at 1280px and 375px on `/forum`, `/forum/[slug]`, `/forum/[slug]/settings`, `/household/[id]/expenses/[expenseId]`.
- `preview_inspect` confirms avatar dimensions match prior render within ±2px.

### Out of scope
Do NOT replace the sidebar `<Avatar>` (it has logout/menu behaviors). Do NOT add gravatar fallback or color-from-username logic — keep `bg-red-soft`.

---

## Wave 4 — `<ConfirmDeleteDialog>` component

**Effort**: 3 hours. **Risk**: medium (refactors 4 destructive flows — verify each). **Files touched**: ~6.

### Goal
Two divergent delete-confirmation UX patterns exist:
- **Type A — type-the-name**: [delete-confirm.tsx](app/\(forum\)/forum/g/\[slug\]/settings/delete-confirm.tsx) (community delete).
- **Type B — inline toggle**: [expenses-list.tsx:123-141](app/\(household\)/household/\[id\]/expenses-list.tsx:123) (expense delete), [chores/page.tsx](app/\(household\)/household/\[id\]/chores/page.tsx) (chore delete), [leave-household.tsx](app/\(household\)/household/\[id\]/settings/leave-household.tsx) (leave household).

### Step 1 — Create `components/editorial/confirm-delete-dialog.tsx`

```tsx
"use client";
import { Modal } from "@/components/editorial/modal";
import { Button } from "@/components/editorial/button";
import { useState } from "react";

type ConfirmTextProps = {
  /** When set, requires the user to type this exact string before confirm enables. */
  expectedText: string;
  label: string;
};

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel = "Delete",
  isPending,
  onConfirm,
  requireText,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body?: string;
  confirmLabel?: string;
  isPending: boolean;
  onConfirm: () => void;
  requireText?: ConfirmTextProps;
}) {
  const [typed, setTyped] = useState("");
  const canConfirm = requireText ? typed === requireText.expectedText : true;

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      {body && <p className="text-base text-ink-2 mb-4">{body}</p>}
      {requireText && (
        <label className="block mb-4">
          <span className="ed-label">{requireText.label}</span>
          <input
            className="ed-input mt-1"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={requireText.expectedText}
          />
        </label>
      )}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={!canConfirm || isPending}>
          {isPending ? "Deleting…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
```

### Step 2 — Refactor call sites

Replace each of the four call sites with `<ConfirmDeleteDialog>`. For Type B (inline toggle) sites, the dialog `open` state replaces the `confirming` boolean already there.

**Files**:
- [app/(forum)/forum/g/[slug]/settings/delete-confirm.tsx](app/\(forum\)/forum/g/\[slug\]/settings/delete-confirm.tsx) — delete this file, inline into [settings page](app/\(forum\)/forum/g/\[slug\]/settings/) using the new component with `requireText={{ expectedText: community.name, label: "Type the community name to confirm" }}`.
- [app/(household)/household/[id]/expenses-list.tsx:123-141](app/\(household\)/household/\[id\]/expenses-list.tsx:123) — extract delete row into ConfirmDeleteDialog usage.
- [app/(household)/household/[id]/chores/page.tsx](app/\(household\)/household/\[id\]/chores/page.tsx) — same.
- [app/(household)/household/[id]/settings/leave-household.tsx](app/\(household\)/household/\[id\]/settings/leave-household.tsx) — same.
- Also check `/settings/security` danger-zone "Delete Account" — likely a 5th candidate.

### Verification
Each destructive flow must:
1. Open the dialog when "Delete" is clicked.
2. For Type A flows, the confirm button stays disabled until the name matches exactly.
3. Cancel button closes without firing the mutation.
4. Confirm fires the mutation, button shows "Deleting…", dialog closes on success.

Run through each manually with `preview_click` + `preview_fill`.

### Out of scope
Do NOT change which routes are protected by confirmation. Do NOT add a `requireDoubleTap` or undo-toast pattern — keep the UX the same as today, just consolidated.

---

## Wave 5 — `<VoteControl>` + `useVoteOptimistic`

**Effort**: 2 hours. **Risk**: medium (thread + comment voting is core forum UX). **Files touched**: 3.

### Goal
[vote-buttons.tsx](app/\(forum\)/forum/g/\[slug\]/threads/\[threadId\]/vote-buttons.tsx) (110 lines) and [comment-vote.tsx](app/\(forum\)/forum/g/\[slug\]/threads/\[threadId\]/comment-vote.tsx) (84 lines) have 85% identical optimistic-update logic.

### Step 1 — Extract the hook

Create `hooks/use-vote-optimistic.ts`:

```ts
"use client";
import { useState } from "react";
import { useCastVote } from "@/hooks/use-forum";

export function useVoteOptimistic({
  threadId,
  targetType,
  targetId,
  initialScore,
  initialVote = null,
}: {
  threadId: string;
  targetType: "thread" | "comment";
  targetId: string;
  initialScore: number;
  initialVote?: 1 | -1 | null;
}) {
  const [score, setScore] = useState(initialScore);
  const [voted, setVoted] = useState<1 | -1 | null>(initialVote);
  const { mutate: cast } = useCastVote(threadId);

  function vote(direction: 1 | -1) {
    const delta = voted === null ? direction : direction === voted ? -direction : direction * 2;
    const nextVote = direction === voted ? null : direction;
    const previousVote = voted;
    const previousScore = score;
    setScore((s) => s + delta);
    setVoted(nextVote);
    cast(
      { targetType, targetId, direction: nextVote },
      {
        onError: () => {
          setScore(previousScore);
          setVoted(previousVote);
        },
      },
    );
  }

  return { score, voted, vote };
}
```

Verify the exact `useCastVote` signature in [hooks/use-forum.ts](hooks/use-forum.ts) first — the snippet above assumes one common shape but the actual hook may differ.

### Step 2 — Create `<VoteControl>`

```tsx
// components/editorial/vote-control.tsx
"use client";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useVoteOptimistic } from "@/hooks/use-vote-optimistic";
import { cn } from "@/lib/utils";

export function VoteControl({
  threadId,
  targetType,
  targetId,
  initialScore,
  initialVote,
  orientation = "column",
  size = 14,
}: {
  threadId: string;
  targetType: "thread" | "comment";
  targetId: string;
  initialScore: number;
  initialVote?: 1 | -1 | null;
  orientation?: "row" | "column";
  size?: number;
}) {
  const { score, voted, vote } = useVoteOptimistic({
    threadId, targetType, targetId, initialScore, initialVote,
  });

  return (
    <div className={cn(
      "inline-flex items-center gap-1",
      orientation === "column" && "flex-col",
    )}>
      <button
        type="button"
        onClick={() => vote(1)}
        className={cn("min-h-hit min-w-hit grid place-items-center",
          voted === 1 ? "text-red" : "text-ink-3 hover:text-ink")}
        aria-label="Upvote"
      >
        <ChevronUp width={size} height={size} />
      </button>
      <span className="font-mono text-xs text-ink-2 tabular-nums">{score}</span>
      <button
        type="button"
        onClick={() => vote(-1)}
        className={cn("min-h-hit min-w-hit grid place-items-center",
          voted === -1 ? "text-ink" : "text-ink-3 hover:text-ink")}
        aria-label="Downvote"
      >
        <ChevronDown width={size} height={size} />
      </button>
    </div>
  );
}
```

### Step 3 — Replace both call sites and delete the two old files.

### Verification
- Open a thread, upvote it, refresh — vote persists.
- Click upvote twice — vote toggles off, score returns.
- Click upvote then downvote — score changes by 2, vote flips.
- Repeat for a comment.
- Throttle network and trigger an upvote error — confirm rollback.

### Out of scope
Do NOT change the vote API contract. Do NOT add long-press / animation effects.

---

## Wave 6 — `<ListWithLoadingAndEmpty>` component

**Effort**: 3 hours. **Risk**: medium (touches list scaffolding on 20+ routes). **Files touched**: ~12 (do a focused first pass; remaining sites can follow in a Wave 6b).

### Goal
The scaffold

```tsx
if (isLoading && items.length === 0) return <p className="ed-hint">Loading…</p>;
if (items.length === 0) return <EmptyState ... />;
return <div>{items.map(...)}</div>;
```

repeats nearly verbatim across 20+ list views.

### Step 1 — Create the component

```tsx
// components/editorial/list-with-loading-and-empty.tsx
"use client";
import { ReactNode } from "react";
import { EmptyState, type EmptyStateProps } from "@/components/editorial/empty-state";

export function ListWithLoadingAndEmpty<T>({
  items,
  isLoading,
  empty,
  loadingHint = "Loading…",
  children,
  className,
}: {
  items: T[];
  isLoading: boolean;
  empty: EmptyStateProps;
  loadingHint?: string;
  children: (item: T, index: number) => ReactNode;
  className?: string;
}) {
  if (isLoading && items.length === 0) {
    return <p className="ed-hint">{loadingHint}</p>;
  }
  if (items.length === 0) {
    return <EmptyState {...empty} />;
  }
  return <div className={className}>{items.map((item, i) => children(item, i))}</div>;
}
```

Confirm the `EmptyStateProps` shape by reading [components/editorial/empty-state.tsx](components/editorial/empty-state.tsx) before writing the import.

### Step 2 — First-pass file list (10 files max for this wave)

- [app/(forum)/forum/forum-feed.tsx](app/\(forum\)/forum/forum-feed.tsx)
- [app/(forum)/forum/communities/page.tsx](app/\(forum\)/forum/communities/page.tsx)
- [app/(forum)/forum/g/[slug]/mod-log/page.tsx](app/\(forum\)/forum/g/\[slug\]/mod-log/page.tsx)
- [app/(forum)/forum/g/[slug]/settings/members-tab.tsx](app/\(forum\)/forum/g/\[slug\]/settings/members-tab.tsx)
- [app/(finance)/income/income-list.tsx](app/\(finance\)/income/income-list.tsx)
- [app/(household)/household/[id]/expenses-list.tsx](app/\(household\)/household/\[id\]/expenses-list.tsx)
- [app/(household)/household/[id]/chores/page.tsx](app/\(household\)/household/\[id\]/chores/page.tsx)
- [app/(household)/household/page.tsx](app/\(household\)/household/page.tsx) (household list)
- [app/settings/sessions/page.tsx](app/settings/sessions/page.tsx) (session list)
- Stop at 10. Open a follow-up issue for the rest.

### Verification
Each touched route: load it, see the spinner; force `data = []`, see the empty state; load real data, see the list. `preview_snapshot` to confirm DOM structure is unchanged.

### Out of scope
Do NOT add infinite-scroll, pagination, or skeleton loaders in this wave. Do NOT touch routes with paginated lists like `/admin` user table (different shape — pagination needs its own abstraction).

---

## Wave 7 — `useFormSubmit` hook

**Effort**: 2 hours. **Risk**: medium. **Files touched**: ~6.

### Goal
6 forms have this near-identical block:

```tsx
const [serverError, setServerError] = useState<string | null>(null);
const onSubmit = handleSubmit(async (values) => {
  try {
    setServerError(null);
    await mutate(values);
    router.push("/somewhere");
  } catch (e) {
    setServerError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
  }
});
```

### Step 1 — Create `hooks/use-form-submit.ts`

```ts
"use client";
import { useState } from "react";
import { ApiError } from "@/lib/api-client"; // verify exact import path
import { ERROR } from "@/lib/error-messages";

export function useFormSubmit<TValues, TResult>(
  fn: (values: TValues) => Promise<TResult>,
  options: { onSuccess?: (result: TResult) => void } = {},
) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function submit(values: TValues) {
    setServerError(null);
    setIsPending(true);
    try {
      const result = await fn(values);
      options.onSuccess?.(result);
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : ERROR.DEFAULT);
    } finally {
      setIsPending(false);
    }
  }

  return { submit, serverError, isPending, clearError: () => setServerError(null) };
}
```

### Step 2 — Refactor target forms

- [login-form.tsx](app/\(auth\)/login/login-form.tsx)
- [add-expense-form.tsx](app/\(finance\)/expenses/add-expense-form.tsx)
- [add-income-form.tsx](app/\(finance\)/income/add-income-form.tsx)
- [new-community-form.tsx](app/\(forum\)/forum/new/new-community-form.tsx)
- [settings-form.tsx](app/\(household\)/household/\[id\]/settings/settings-form.tsx) (household settings)
- [password-section.tsx](app/settings/security/password-section.tsx)

Each becomes:

```tsx
const { submit, serverError, isPending } = useFormSubmit(
  async (values) => mutateAsync(values),
  { onSuccess: () => router.push("/...") }
);
const onSubmit = handleSubmit(submit);
```

### Verification
Each form: submit valid input → success path; submit input that triggers a 400 from the API → `serverError` populated and displayed in the existing alert; mid-submit, button disabled while `isPending`.

### Out of scope
Do NOT replace `react-hook-form`'s built-in submit handling. Do NOT move field-level validation into the hook.

---

## Wave 8 — Raw `<button>` → `<Button>`

**Effort**: 4 hours. **Risk**: medium (large file count). **Files touched**: ~30.

### Goal
115+ raw `<button>` elements in `app/` and `components/` (excluding `components/editorial/`) bypass the `<Button>` component, leading to inconsistent padding, hit targets, and hover states.

### Approach
Do NOT attempt all 115 sites in one wave. Split into three sub-waves by directory:

- **8a** — `app/settings/**` (~20 sites): [connections/page.tsx](app/settings/connections/page.tsx), [two-factor-section.tsx](app/settings/security/two-factor-section.tsx), [sessions/page.tsx](app/settings/sessions/page.tsx), etc.
- **8b** — `app/(forum)/**` (~35 sites): member action buttons, mod-queue actions, vote buttons (do AFTER Wave 5), thread-actions, etc.
- **8c** — `app/(finance)/**` + `app/(household)/**` + `app/(portfolio)/admin/**` + `app/landing-page.tsx` (~60 sites).

For each sub-wave:

1. Grep `<button` in the target directory.
2. For each match, decide:
   - **Replace with `<Button>`** if it's a labeled action button.
   - **Replace with `<IconButton>`** (create this in [components/editorial/](components/editorial/) if it doesn't exist — single-icon buttons with `min-h-hit min-w-hit` and an `aria-label`).
   - **Leave raw** if it's a Radix-managed trigger (e.g. `<Popover.Trigger asChild>`), an `<ed-button>`-classed one, or genuinely tiny inline-text "show/hide" toggle inside a labeled control.
3. Choose the variant: `primary | secondary | ghost | danger | link` based on the existing classes.
4. Preserve `disabled`, `type="submit"`, and `aria-*` attributes.

### Step 1 (pre-work) — Audit/expand `<Button>`

Read [components/editorial/button.tsx](components/editorial/button.tsx). Make sure it supports: `variant`, `size`, `disabled`, `type`, `loading`, an `asChild` Radix Slot pattern for `<Link>` wrappers. If `asChild` isn't there, add it (Radix `<Slot>`). Otherwise some Link-wrapped buttons will resist migration.

### Verification (per sub-wave)
- Visual diff on every touched route.
- All buttons meet `min-h-hit` (≥44px tap target).
- `preview_inspect` confirms `padding`, `font-weight`, `border-radius` are consistent across primary buttons on at least 3 different pages.

### Out of scope
Do NOT consolidate variant CSS in `globals.css` in this wave — keep `<Button>`'s existing visual contract. Do NOT touch checkboxes/radios (existing audit Wave 1 owns those). Do NOT delete `ed-button` CSS class — it's still consumed by `<Button>` internally.

---

## Wave 9 — Raw form inputs → `<Input>` / `ed-input`

**Effort**: 3 hours. **Risk**: medium. **Files touched**: ~20.

### Goal
44+ raw `<input>`, `<textarea>`, `<select>` elements bypass `ed-input` / `ed-textarea` / `ed-select`. Worst offenders are deduction forms and modal inputs.

### Approach
Same split-by-area pattern as Wave 8:

- **Worst single file**: [add-deduction-form.tsx](app/\(finance\)/income/add-deduction-form.tsx) — has 6 raw fields and a module-scope `fieldCls` constant at line 7. Delete `fieldCls` and replace every `<input>`/`<select>` with `<Input>` or `<Select>` (whichever is the editorial component — verify both exist; create `<Select>` if missing).
- **Modal**: [manage-deductions-modal.tsx](app/\(finance\)/income/manage-deductions-modal.tsx) — 3 raw inputs/selects.
- **Forum forms**: [report-button.tsx](app/\(forum\)/forum/g/\[slug\]/threads/\[threadId\]/report-button.tsx), [delete-confirm.tsx](app/\(forum\)/forum/g/\[slug\]/settings/delete-confirm.tsx) (gone after Wave 4), [location-search.tsx](app/\(geography\)/weather/location-search.tsx).

For each:
1. Replace the raw element with the editorial component.
2. If the editorial component doesn't expose a prop you need (e.g., `step` on number inputs), add the prop pass-through — don't fall back to raw.
3. Strip the now-redundant `className="h-[40px] ... border ..."` overrides.

### Pre-work — Ensure these editorial components exist

Check `components/editorial/` for: `<Input>`, `<Textarea>`, `<Select>`. The Tailwind audit already mentions `<Input>` exists (with the `iconLeft` prop). If `<Select>` or `<Textarea>` are missing, create them as thin wrappers applying `ed-select` / `ed-textarea`.

### Verification
- Tab through each touched form — focus rings consistent.
- Field heights uniform at `min-h-hit` (44px) or `40px` for compact density (consistent within a single form).
- `preview_inspect` confirms `padding-left`, `padding-right`, `font-size`, `line-height` match the editorial baseline.

### Out of scope
Do NOT migrate checkboxes/radios (existing audit Wave 1 owns those). Do NOT touch search inputs (Wave 13 of this plan covers tabs-and-search consolidation if needed).

---

## Wave 10 — Arbitrary `border-[var(--X)]` → named utilities

**Effort**: 2 hours. **Risk**: low. **Files touched**: ~15.

### Goal
35+ sites use `border-[var(--accent-border)]`, `border-[var(--rule-soft)]`, `border-[var(--rule)]`, `border-[var(--ink-3)]` in arbitrary Tailwind syntax. These should map to named utilities.

### Step 1 — Add utilities to `tailwind.config.ts`

Inside `theme.extend.borderColor`:

```ts
borderColor: {
  rule: "var(--rule)",
  "rule-soft": "var(--rule-soft)",
  "accent-border": "var(--accent-border)",
  // Keep existing entries (ink, ink-2, ink-3, ink-4, red, etc.)
},
```

(Check what's already there first; do not duplicate.)

### Step 2 — Bulk replace

**Find**: `border-\[var\(--rule\)\]` → `border-rule`
**Find**: `border-\[var\(--rule-soft\)\]` → `border-rule-soft`
**Find**: `border-\[var\(--accent-border\)\]` → `border-accent-border`
**Find**: `border-\[var\(--ink-3\)\]` → `border-ink-3` (already exists)

Files (from styling audit):
- [add-deduction-form.tsx:69](app/\(finance\)/income/add-deduction-form.tsx:69)
- [manage-deductions-modal.tsx:191](app/\(finance\)/income/manage-deductions-modal.tsx:191)
- [manage-deductions-modal.tsx:206](app/\(finance\)/income/manage-deductions-modal.tsx:206)
- [income-detail-panel.tsx:107](app/\(finance\)/income/income-detail-panel.tsx:107)
- [thread-row.tsx:21](app/\(forum\)/forum/thread-row.tsx:21)
- [expenses/[expenseId]/page.tsx:152](app/\(household\)/household/\[id\]/expenses/\[expenseId\]/page.tsx:152)
- ~10 more — grep `border-\[var` to find them all.

### Verification
```bash
grep -rn "border-\\[var(" app components
```
Must be empty after the wave. `npm run build` passes; visual diff confirms borders unchanged.

### Out of scope
Do NOT also touch `bg-[var(--X)]` or `text-[var(--X)]` — those are usually intentional for one-off vars that don't deserve a utility name.

---

## Wave 11 — Arbitrary `text-[0.7Xrem]` → named scale

**Effort**: 1.5 hours. **Risk**: low. **Files touched**: ~12.

### Goal
20+ sites use `text-[0.72rem]` or `text-[0.78rem]` as workarounds for the halved type scale. These match exactly the named tokens (`text-xs = 0.72rem`, `text-sm = 0.78rem`), so replacement is mechanical.

### Approach
**Must wait** for the existing audit's **Wave 0 (CLAUDE.md spacing/type doc)** to land first, so the named scale is documented before this sweep makes it the canonical answer.

**Find / replace**:
- `text-\[0\.72rem\]` → `text-xs`
- `text-\[0\.78rem\]` → `text-sm`
- `text-\[0\.66rem\]` → keep as arbitrary (no named token at that size; document it if used >3 times)
- `text-\[1rem\]` → `text-md` (already custom in the scale)
- `text-\[0\.875rem\]` → `text-base`

Files: [landing-page.tsx:196,242,252](app/landing-page.tsx:196), [sessions/page.tsx](app/settings/sessions/page.tsx), [notifications/page.tsx:155](app/settings/notifications/page.tsx:155), [admin/page.tsx:135,163](app/\(portfolio\)/admin/page.tsx:135), [deduction-chip.tsx:67](app/\(finance\)/income/deduction-chip.tsx:67), plus a `grep -rn 'text-\['` sweep.

### Verification
```bash
grep -rnE 'text-\[0\.(72|78|875|66)rem\]' app components
```
Must be empty (except for the 0.66rem cases if you chose to keep them).

### Out of scope
Do NOT also touch `leading-[…]` or `tracking-[…]` arbitrary values. The existing audit's Wave 3 (body-copy `text-sm` → `text-base`) is the better tool for re-sizing intent, not just unifying tokens.

---

## Wave 12 — z-index scale

**Effort**: 1 hour. **Risk**: low. **Files touched**: 5 + config.

### Goal
5 hardcoded arbitrary z-index values exist with no documented scale. Modals can collide with notification toasts because nobody knows the layering contract.

### Step 1 — Add a scale to `tailwind.config.ts`

```ts
zIndex: {
  base: "1",
  sticky: "10",
  topbar: "20",
  sidebar: "30",
  dropdown: "50",
  notifications: "100",
  sidebar_overlay: "150",   // sidebar drawer over content
  sidebar_nav: "160",        // nav itself above its overlay
  modal: "200",
},
```

### Step 2 — Replace

- [app-shell.tsx:156](components/layout/app-shell.tsx:156): `z-[150]` → `z-sidebar_overlay`
- [app-shell.tsx:160](components/layout/app-shell.tsx:160): `z-[160]` → `z-sidebar_nav`
- [notifications-toaster.tsx:79](components/layout/notifications-toaster.tsx:79): `z-[100]` → `z-notifications`
- [modal.tsx:21](components/editorial/modal.tsx:21): `z-[200]` → `z-modal`
- [manage-deductions-modal.tsx:142](app/\(finance\)/income/manage-deductions-modal.tsx:142): `z-[1]` → `z-base`

### Verification
- Open the sidebar drawer over the topbar — sidebar wins.
- Open a modal while a notification toast is visible — modal wins.
- Open a Plaid modal — appears above everything.

### Out of scope
Do NOT touch Radix-managed z-indices (Popover/Dialog set their own).

---

## Wave 13 — Hand-rolled tabs → `<EditorialTabs>` (or `<LinkTabs>`)

**Effort**: 2 hours. **Risk**: low. **Files touched**: 3.

### Goal
`<EditorialTabs>` exists in [components/editorial/tabs.tsx](components/editorial/tabs.tsx) and is used correctly on settings pages. Three call sites hand-roll tab navigation:
- [app/(forum)/page.tsx:75-86](app/\(forum\)/page.tsx:75) — Feed / Hot / Communities tabs (uses `<Link>` + `aria-current` manually).
- [app/(finance)/expenses/expenses-client.tsx](app/\(finance\)/expenses/expenses-client.tsx) — Schedule / Manage tabs.
- [app/(math)/convert/converter-client.tsx](app/\(math\)/convert/converter-client.tsx) — unit category tabs.

### Step 1 — Decide: state-based tabs or link-based tabs?

Read [tabs.tsx](components/editorial/tabs.tsx). It likely wraps Radix `Tabs.Root` (state-based, no URL change). The forum tabs use `<Link>` because each tab is a route. **Decision**:
- For `expenses-client.tsx` and `converter-client.tsx`: convert to `<EditorialTabs>` (state-based; no SEO concerns since these are signed-in pages).
- For `app/(forum)/page.tsx`: keep the link-based pattern but extract a `<LinkTabs>` variant in `components/editorial/` that takes `{ label, href }[]` and renders the same visual as `<EditorialTabs>` but with `<Link>` children + `aria-current="page"` resolved from `usePathname()`.

### Step 2 — Create `<LinkTabs>` if needed

```tsx
// components/editorial/link-tabs.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function LinkTabs({ items, className }: {
  items: { label: string; href: string }[];
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <nav className={cn("ed-tabs", className)} role="tablist">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("ed-tab", active && "ed-tab--active")}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

(Use the `ed-tab*` classes already in [globals.css](app/globals.css). Verify the class names match.)

### Verification
- Active tab state matches before/after the migration on each of the three pages.
- Keyboard `←/→` navigation works on the state-based tabs (Radix gives this for free).
- Mobile widths still render the tab strip without overflow.

### Out of scope
Do NOT redesign the tab visual. Do NOT move tab state into the URL for `expenses-client` (existing behavior is in-component state; preserve it).

---

## Wave 14 — Wire CV + headshot into `/about`

**Effort**: 1 hour. **Risk**: low. **Files touched**: 1 (plus a small CSS check).

### Goal
[public/cv.pdf](public/cv.pdf) and [public/hank_headshot.jpeg](public/hank_headshot.jpeg) are unreferenced anywhere in the app. The `.ed-about-headshot` CSS class is already defined at [globals.css:1945-1952](app/globals.css:1945) (sets `object-fit: cover` on a child `img`) but [app/(portfolio)/about/page.tsx](app/\(portfolio\)/about/page.tsx) never renders it.

### Step 1 — Add the headshot to the page head

Read [about/page.tsx](app/\(portfolio\)/about/page.tsx) end-to-end first (152 lines). The existing `EditionalPageHead` / `Btn` / `Card` setup uses a two-column split below the page head. Insert the headshot inside the page head OR as the leading element of the aside, depending on how `.ed-about-headshot` is sized in CSS.

```tsx
import Image from "next/image";

// Inside the JSX, in whichever column the CSS expects:
<div className="ed-about-headshot">
  <Image
    src="/hank_headshot.jpeg"
    alt="Hank Karpinen"
    width={320}
    height={320}
    priority
  />
</div>
```

**Verify** the actual width/height by inspecting the rendered `.ed-about-headshot` container; pass dimensions that match its aspect ratio. If `.ed-about-headshot` is currently sized via CSS only (no explicit width/height in the JSX), `Image` with `fill` may be the better choice — read the CSS rule fully before deciding.

### Step 2 — Add a CV download button to the page head

The page head currently has "one primary action" (per the JSDoc at line 9–11). Add a secondary action linking to the CV:

```tsx
<Btn variant="secondary" asChild>
  <a href="/cv.pdf" download="Hank-Karpinen-CV.pdf">
    Download CV
  </a>
</Btn>
```

If `<Btn>` doesn't support `asChild`, render the link directly with the matching `ed-btn` classes (the audit's Wave 8 will normalize this elsewhere — don't get blocked here).

### Step 3 — Sticky contact strip (matches FRONTEND-INVENTORY Issue 8)

This wave also resolves Issue 8 of [FRONTEND-INVENTORY.md](../../FRONTEND-INVENTORY.md) ("About is structurally isolated from the employer CTA"). Add a bottom-of-page strip:

```tsx
<div className="ed-about-footer mt-12 border-t border-rule py-6">
  <p className="font-mono uppercase text-xs tracking-[0.22em] text-ink-2">
    Open to full-stack roles ·{" "}
    <Link href="/contact" className="text-red underline">Get in touch</Link>
    {" "}·{" "}
    <a href="mailto:hank@thestack.dev" className="text-red underline">hank@thestack.dev</a>
    {" "}·{" "}
    <a href="/cv.pdf" download className="text-red underline">Download CV</a>
  </p>
</div>
```

Replace `hank@thestack.dev` with the real address — check [/contact page](app/\(portfolio\)/contact/page.tsx) for the canonical email.

### Verification
- `/about` renders the headshot at the documented `.ed-about-headshot` size (verify `width` × `height` via `preview_inspect`).
- Clicking "Download CV" triggers a `cv.pdf` download (browser default name `Hank-Karpinen-CV.pdf`).
- The bottom strip mailto and `/contact` links work.
- Lighthouse a11y score for `/about` doesn't drop (alt text present, contrast OK).
- `npm run build` passes; the `Image` import doesn't break in Next.js Image config (may need a config entry if remote loader, but `/public/` images are fine by default).

### Out of scope
Do NOT replace the existing project-card grid or skills sidebar. Do NOT add a CMS-style edit flow for the bio. Do NOT swap `cv.pdf` for a generated-on-demand resume.

---

## Cross-cutting reminders for every wave

1. **No "Claude in Chrome" or raw `npm run dev`** for verification — use `preview_start` / `preview_inspect` / `preview_snapshot`. See [CLAUDE.md](CLAUDE.md) once it's updated with the spacing-scale doc (existing audit Wave 0).
2. **Run `npm run build && npm test`** at the end of every wave before declaring done.
3. **Don't expand scope** — if a wave's file list catches a "while I'm here, this should also be…" case that doesn't match the wave's pattern, flag it as a follow-up issue rather than fixing inline.
4. **Halved spacing scale** (`w-4 = 8px`, etc.) — the existing audit's Wave 0 (CLAUDE.md) MUST be in place before any wave that adds new sizing classes.
5. **Match the surrounding code's idiom** — if a file uses `cn(...)` for class merging, keep using it; if it uses string concatenation, keep that.

---

## Out of scope for this whole plan

These are real issues, but they're strategic decisions, not Sonnet-sized tasks:

1. **Reverting the halved spacing scale** — would touch every component. Already flagged in the existing audit's Long-term section.
2. **Migrating editorial palette to semantic names** (`bg-paper` → `bg-surface` everywhere) — multi-day refactor; pick a direction and commit.
3. **Onboarding flows** — covered in `FRONTEND-INVENTORY.md` UX audit (Issue 6). Different track.
4. **Test coverage gaps** — only one orphan test (`nav-auth.test.tsx`) is touched here. A broader testing pass is separate work.

---

## Done criteria

After Wave 0 + Waves 1–13 are merged, the following greps must return zero results in `app/` + `components/`:

```bash
grep -rn "use-plaid"                           # Wave 0
grep -rn "nav-auth"                            # Wave 0
grep -rn 'minimumFractionDigits:\s*2' \
  | grep -v "lib/formatting.ts"                # Wave 1
grep -rn '"Something went wrong' \
  | grep -v "lib/error-messages.ts"            # Wave 2
grep -rnE 'border-\[var\('                     # Wave 10
grep -rnE 'text-\[0\.(72|78|875)rem\]'         # Wave 11
grep -rnE '\bz-\[[0-9]+\]'                     # Wave 12
grep -rn "hank_headshot\|cv\\.pdf" \
  app/\(portfolio\)/about/page.tsx              # Wave 14 — must return ≥1 each
```

And `npm run build && npm test` must remain green.
