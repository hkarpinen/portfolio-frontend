# Next.js Client Boundary Audit Prompt

You are an expert Next.js App Router architect. Audit this codebase for unnecessary `"use client"` directives and related anti-patterns, then fix every issue you find.

---

## Anti-patterns to identify and fix

### 1. `"use client"` caused solely by hover/focus JS handlers

**Pattern:**
```tsx
"use client";
// No useState, no hooks — only reason for "use client" is hover handlers
<div
  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--accent)"}
  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--surface)"}
>
```

**Fix:** Remove `"use client"`. Replace every `onMouseEnter`/`onMouseLeave`/`onFocus`/`onBlur` style mutation with:
- A CSS class + `:hover`/`:focus` rule in a co-located `<style>` block or `globals.css`
- Tailwind `hover:` / `focus:` utility classes where the design system permits

```tsx
// Before: JS mutation
onMouseEnter={e => { el.style.transform = "translateY(-2px)"; el.style.boxShadow = "var(--shadow-md)"; }}
// After: CSS class
className="my-card"
// globals.css or <style>:
// .my-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
```

---

### 2. `useState` used only to drive a CSS value

**Pattern:**
```tsx
const [hovered, setHovered] = useState(false);
<div
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  style={{ boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)" }}
>
```

**Fix:** Remove the `useState`. Apply the hover state purely in CSS. If the component has no other client requirements, remove `"use client"` entirely.

---

### 3. Server component wrapper that only passes session props to a client component

**Pattern:**
```tsx
// page.tsx (server)
export default async function Page() {
  const session = await getSession();
  return <MyComponent displayName={session?.displayName} avatarUrl={session?.avatarUrl} />;
}

// my-component.tsx
"use client";
export function MyComponent({ displayName, avatarUrl }: Props) { ... }
```

**Fix:** If `MyComponent`'s only reason for being a client component is the hover/JS patterns above, convert it to an async server component that calls `getSession()` directly. Delete the wrapper `page.tsx` and re-export `MyComponent as default`.

```tsx
// my-component.tsx (now a server component)
import { getSession } from "@/lib/auth/session";
export async function MyComponent() {
  const session = await getSession();
  ...
}
// page.tsx (now trivial — or deleted entirely)
export { MyComponent as default } from "./my-component";
```

---

### 4. Monolithic client component containing a tiny interactive island

**Pattern:**
```tsx
"use client";
// 400+ line component where the ONLY interactive piece is a hamburger menu toggle
export function LandingPage(...) {
  const [menuOpen, setMenuOpen] = useState(false);
  // hundreds of lines of static JSX
}
```

**Fix:** Extract the interactive island into its own small `"use client"` component. The outer component becomes a server component.

```tsx
// mobile-nav.tsx
"use client";
export function MobileNav({ displayName, initials }: Props) {
  const [open, setOpen] = useState(false);
  return <>...</>;
}

// landing-page.tsx (now a server component)
import { MobileNav } from "./mobile-nav";
export async function LandingPage() {
  const session = await getSession();
  return (
    <header>
      ...static desktop nav...
      <MobileNav displayName={session?.displayName} initials={...} />
    </header>
  );
}
```

---

### 5. Inline `<style>` JSX in a client component just for media queries or hover

**Pattern:**
```tsx
"use client";
// File is client only for hover handlers — not even for the <style> tag
export default function Page() {
  return (
    <>
      ...JSX...
      <style>{`@media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }`}</style>
    </>
  );
}
```

**Fix:** Move the `<style>` content to `globals.css`. Remove `"use client"` once hover handlers are also eliminated.

---

### 6. `useEffect` used to trigger an API call on mount

**Pattern:**
```tsx
"use client";
useEffect(() => {
  fetch("/api/something").then(r => r.json()).then(setData);
}, []);
```

This runs on the client after hydration, meaning the user sees a loading spinner even though the data could have been available on the first byte.

**Fix:** If the component doesn't need interactivity, make it an async server component and fetch directly:
```tsx
// server component — no useEffect, no loading state
export default async function Page() {
  const data = await fetchSomething();  // runs on the server
  return <MyView data={data} />;
}
```
If the data depends on client state (user interaction, filters), use React Query / SWR's `initialData` pattern: fetch on the server, pass as `initialData` to the client hook to avoid the flash.

---

### 7. Sequential `await` in a server component when fetches are independent

**Pattern:**
```tsx
export default async function Page() {
  const user    = await getUser();     // 200 ms
  const posts   = await getPosts();    // 200 ms — waits needlessly for getUser
  const sidebar = await getSidebar();  // 200 ms — waits needlessly for both
  // total: ~600 ms
}
```

**Fix:** Use `Promise.all` for independent fetches — they run in parallel:
```tsx
export default async function Page() {
  const [user, posts, sidebar] = await Promise.all([
    getUser(),
    getPosts(),
    getSidebar(),
  ]);
  // total: ~200 ms
}
```

---

### 8. Prop-drilling session / auth data through multiple component layers

**Pattern:**
```tsx
// layout.tsx
const session = await getSession();
return <Page session={session} />;

// page.tsx
export function Page({ session }: { session: Session }) {
  return <Widget session={session} />;  // drilling down...
}
```

**Fix:** Any server component can call `getSession()` directly. When wrapped in `React.cache`, it deduplicates to a single upstream request per render pass — no prop drilling needed:
```tsx
// widget.tsx — call getSession() here, cache handles deduplication
export async function Widget() {
  const session = await getSession();
  ...
}
```

---

### 9. `useSearchParams()` not wrapped in `<Suspense>`

**Pattern:**
```tsx
"use client";
export default function Page() {
  const searchParams = useSearchParams();  // ⚠ causes the whole page to opt out of static rendering
  ...
}
```

Next.js requires `useSearchParams()` to be inside a `<Suspense>` boundary, or it opts the entire route out of static generation and causes a runtime warning/error in some versions.

**Fix:** Extract the component that reads `searchParams` and wrap the usage in `<Suspense>`:
```tsx
function SearchContent() {
  const searchParams = useSearchParams();
  ...
}

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <SearchContent />
    </Suspense>
  );
}
```

---

### 10. Missing `loading.tsx` / `<Suspense>` for async server components

**Pattern:**
```tsx
// page.tsx — fetches data but no loading UI defined
export default async function Page() {
  const data = await fetchSlowThing();  // user stares at a blank page
  return <View data={data} />;
}
// No loading.tsx in this route segment
```

**Fix:** Add a `loading.tsx` next to `page.tsx` for route-level streaming, or wrap slow sub-trees in `<Suspense fallback={<Skeleton />}>`:
```
app/(forum)/communities/
  page.tsx
  loading.tsx   ← renders instantly while page.tsx streams in
```
```tsx
// Or inline with Suspense for partial loading:
export default async function Page() {
  return (
    <>
      <StaticHeader />
      <Suspense fallback={<FeedSkeleton />}>
        <AsyncFeed />   {/* slow fetch isolated here */}
      </Suspense>
    </>
  );
}
```

---

### 11. Context providers placed too high in the tree

**Pattern:**
```tsx
// layout.tsx (root)
export default function RootLayout({ children }) {
  return (
    <ThemeProvider>         {/* forces entire app to client-render */}
      <AuthProvider>        {/* even static marketing pages */}
        <QueryProvider>
          {children}
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

**Fix:** Push context providers as deep into the tree as their actual consumers. Create a thin `"use client"` provider wrapper and keep the layout itself a server component:
```tsx
// providers.tsx
"use client";
export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

// layout.tsx (stays a server component)
import { Providers } from "./providers";
export default function Layout({ children }) {
  return <Providers>{children}</Providers>;
}
```

---

### 12. Importing server-only modules in client components

**Pattern:**
```tsx
"use client";
import { db } from "@/lib/db";           // Prisma / DB client
import { getServerSecret } from "@/lib/secrets";  // env vars, private keys
```

These imports will either crash at runtime (Node-only APIs) or leak secrets to the browser bundle.

**Fix:** Add the [`server-only`](https://www.npmjs.com/package/server-only) package to modules that must never reach the client:
```tsx
// lib/db.ts
import "server-only";   // ← build-time error if imported from a client component
import { PrismaClient } from "@prisma/client";
```
Also: never pass non-serializable values (class instances, functions, Promises) as props from server to client components.

---

### 13. Using `<a href>` instead of `<Link>` for internal navigation

**Pattern:**
```tsx
<a href="/communities">Forum</a>
```

Raw `<a>` tags cause a full browser navigation (page reload), losing all React state and bypassing the Next.js client-side router.

**Fix:**
```tsx
import Link from "next/link";
<Link href="/communities">Forum</Link>
```
Use `<a>` only for external URLs (`target="_blank"`) or file downloads.

---

### 14. Calling `cookies()` / `headers()` unnecessarily, opting out of caching

**Pattern:**
```tsx
// layout.tsx (called on every route, even fully static ones)
const cookieStore = cookies();   // ← opts the entire route out of static caching
const theme = cookieStore.get("theme")?.value ?? "dark";
```

In Next.js, calling `cookies()` or `headers()` anywhere in a render tree makes the entire route dynamic (no static generation, no full-route cache).

**Fix:** Only call `cookies()`/`headers()` where truly needed. For values known at build time, use static defaults. For per-user data, push the call as deep into the tree as possible so only that sub-tree becomes dynamic:
```tsx
// Move cookie read into the specific component that needs it,
// not into a root layout that wraps static pages too.
```

---

## Audit procedure

1. **Collect all files with `"use client"`:**
   ```
   grep -rn '"use client"' app/ components/ --include="*.tsx" -l
   ```

2. **For each file, check whether `"use client"` is justified.** A file genuinely needs `"use client"` only if it uses:
   - `useState` / `useReducer` / `useRef` (beyond `useRef` for DOM reads)
   - `useEffect` / `useLayoutEffect`
   - Browser-only APIs (`window`, `document`, `localStorage`, etc.)
   - Event handlers that mutate state (forms, clicks that trigger state changes)
   - Client-side hooks (`useRouter`, `usePathname`, `useQuery`, etc.)
   - Context providers/consumers that depend on the above

3. **Identify and fix each anti-pattern from the list above.**

4. **For files that legitimately need `"use client"`, still clean up:**
   - Replace `onMouseEnter`/`onMouseLeave`/`onFocus`/`onBlur` style mutations with CSS classes
   - Replace `useState(hovered)` patterns with CSS `:hover`

5. **Find sequential server fetches:**
   ```
   grep -rn "await get\|await fetch" app/ --include="*.tsx" -A1 | grep -B1 "await get\|await fetch"
   ```
   Any two consecutive `await` calls on independent data should become `Promise.all`.

6. **Find `useEffect` data fetching:**
   ```
   grep -rn "useEffect" app/ --include="*.tsx" -l
   ```
   For each hit, check if the effect is fetching data that could be a server component fetch instead.

7. **Find `useSearchParams` without Suspense:**
   ```
   grep -rn "useSearchParams" app/ --include="*.tsx"
   ```
   Verify each call site is inside a component that is rendered within `<Suspense>`.

8. **Find internal `<a>` tags:**
   ```
   grep -rn "<a href" app/ components/ --include="*.tsx" | grep -v "target=\|http\|mailto\|//"
   ```
   All internal links should use `<Link>`.

9. **Find server-only module imports in client files:** Look for DB clients, secret accessors, or Node-only imports in any file with `"use client"`.

10. **Verify nothing is broken:** Run `tsc --noEmit` and confirm zero errors.

---

## Rules

- **Do not** remove `"use client"` from files that genuinely need it (forms, mutation hooks, router, context).
- **Do not** introduce new client components. Shrink the client boundary.
- **Do** prefer a co-located `<style>` block for component-scoped CSS over modifying `globals.css`, unless the rule is truly global.
- **Do** use CSS custom properties (`var(--accent)`) freely in `<style>` blocks — they work in server components.
- **Do** keep all visual behaviour identical. This is a refactor, not a redesign.
- **Do** use `Promise.all` for any two or more independent `await` calls in the same server component.
- **Do** add `import "server-only"` to any module that contains DB access, private env vars, or server-side secrets.
- After converting a component to a server component, **delete any wrapper `page.tsx`** that existed solely to call `getSession()` and pass props down.
