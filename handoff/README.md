# Portfolio Design System — Agent Handoff

This folder is the design source of truth for the Portfolio full-stack app.
Use it the same way you'd use a Figma MCP server — read these files as context
before implementing any screen or component.

---

## Files in this package

| File | What it contains |
|---|---|
| `TOKENS.md` | Every color, spacing, radius, type, shadow, and motion token with dark/light values and usage rules |
| `COMPONENTS.md` | Full component API — variants, sizes, states, anatomy, and styling rules for every UI element |
| `SCREENS.md` | Complete screen map — every route, layout structure, component composition, and responsive behavior |
| `tailwind.config.ts` | Drop-in Tailwind config with all tokens mapped to CSS custom properties |
| `globals.css` | CSS custom properties for dark/light themes, base reset, utility classes, and keyframes |

The live interactive prototype is at `../Portfolio App.html` — open it in a browser
to see every screen rendered at full fidelity. Navigate all modules from the landing page.

---

## How to use this as an agent

### Starting a new screen
1. Read `SCREENS.md` — find the route, note the layout type (simple / medium / complex), sidebar presence, and mobile behavior
2. Read `COMPONENTS.md` — identify which components are used on that screen
3. Read `TOKENS.md` — check the relevant token section (colors, spacing, motion) for that component type
4. Reference `../Portfolio App.html` source for exact inline style values if needed

### Implementing a component from scratch
1. Find it in `COMPONENTS.md` — read the anatomy, variants, sizes, and states
2. Check `TOKENS.md` → Colors for the correct CSS custom property names
3. Check `TOKENS.md` → Motion for the correct easing curve and duration
4. **Never hardcode colors** — always use `var(--token-name)`
5. **Always implement all states**: hover, active, disabled, focus-visible, loading

### Setting up a new Next.js project
```bash
# 1. Copy tailwind.config.ts to project root
# 2. Copy globals.css to app/globals.css (or styles/globals.css)
# 3. Add font imports to app/layout.tsx:
```
```tsx
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300','400','500','600','700','800','900'],
  variable: '--font-display',
})
const inter = Inter({
  subsets: ['latin'],
  weight: ['300','400','500','600'],
  variable: '--font-body',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" className={`${jakarta.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### Theme switching
Toggle `data-theme="dark"` / `data-theme="light"` on `<html>`. All CSS custom properties
update automatically. Store preference in `localStorage` key `"theme"`.

---

## Critical rules for the agent

### Colors
- ✅ `var(--accent)` — primary blue action color
- ✅ `var(--text-2)` — secondary text
- ✅ `var(--surface)` — card background
- ❌ Never `#3E7BFA`, `rgb(...)`, or hardcoded hex values
- ❌ Never Tailwind color classes like `bg-blue-500` — use the mapped tokens

### Typography
- Headings, labels, brand text → `font-family: var(--ff-display)` (Plus Jakarta Sans)
- All other UI text → `font-family: var(--ff-body)` (Inter)
- Minimum body font size: **13px**. Absolute minimum (meta/labels): **11px**

### Spacing
- Use the 4px grid. Common values: 8, 12, 16, 20, 24, 32, 48px
- Card padding: 20px default, 16px compact
- Page padding: 28px 32px desktop, 16px mobile

### Interactivity
Every clickable element needs:
- `hover` state (background shift, color change, or shadow)
- `active` state (`scale(0.97)` for buttons)
- `disabled` state (`opacity: 0.5`, `cursor: not-allowed`)
- `focus-visible` ring: `2px solid var(--accent)`, `outline-offset: 2px`

### Motion
- Entrances: `cubic-bezier(0.16, 1, 0.3, 1)` (spring), 220–380ms
- Color/border transitions: `cubic-bezier(0.4, 0, 0.2, 1)`, 110ms
- Never animate `width` or `height` — use `transform` and `opacity` only
- All page mounts get `animation: fadeUp 320ms spring both`

### Layout
- App shell: sidebar (220px / 60px collapsed) + topbar (56px) + scrollable main
- Hide sidebar on `< 768px`, show bottom nav instead
- Main content max-width: 1200px, centered
- Two-column grids (`1fr 280px`) collapse to `1fr` on mobile
- Touch targets: minimum 44×44px

### Accessibility
- All inputs have visible labels (never placeholder-only)
- Color is never the only differentiator — pair with icon or text
- Focus ring always visible on keyboard navigation
- Semantic HTML: `<button>` for actions, `<a>` for navigation, `<nav>` for nav regions

---

## Module overview

| Module | Routes | Key screens |
|---|---|---|
| **Landing** | `/` | Animated hero, features, testimonials, CTA |
| **Auth** | `/login` `/register` `/confirm-email` | Form screens with validation |
| **Portfolio** | `/portfolio` `/portfolio/contact` | About page, contact form |
| **Bills** | `/bills` + 7 sub-routes | Households, bill splits, contributions, income |
| **Forum** | `/forum` + 6 sub-routes | Feed, communities, threads, mod tools |
| **Settings** | `/settings` + 2 sub-routes | Profile, security (2FA), notifications |

---

## Color reference (quick lookup)

```css
/* Backgrounds */
--bg          /* page */
--bg-2        /* section */
--surface     /* card */
--surface-2   /* input, inner card */
--surface-3   /* hover, pill */

/* Borders */
--border      /* default */
--border-2    /* strong */

/* Text */
--text        /* primary */
--text-2      /* secondary */
--text-3      /* muted */

/* Actions */
--accent          /* primary blue */
--accent-hi       /* hover blue */
--accent-v        /* violet */
--accent-subtle   /* 10% alpha blue — icon bg, badge bg */
--accent-glow     /* 30% alpha blue — hover shadow */

/* Semantic */
--success  --success-s   /* green, green tint */
--warning  --warning-s   /* amber, amber tint */
--danger   --danger-s    /* red, red tint */

/* Elevation */
--shadow-sm  --shadow-md  --shadow-lg  --shadow-glow
```

---

## Delight layer (micro-interactions)

These small touches make the UI feel premium — implement them:

1. **Button press**: `transform: scale(0.97)` on `mousedown`, instant snap back
2. **Card hover glow**: `box-shadow: var(--shadow-glow)` + border `→ var(--accent)` on hover for featured cards
3. **Page entrance**: every page mount animates in with `fadeUp` (Y+16px → 0, opacity 0→1, 320ms spring)
4. **Skeleton shimmer**: use the `shimmer` keyframe (not a spinner) for all content loading states
5. **Toggle spring**: toggle knob position transition uses `cubic-bezier(0.16,1,0.3,1)` for a satisfying snap
6. **Modal backdrop blur**: `backdrop-filter: blur(4px)` on modal overlay — subtle depth
7. **Gradient mesh hero**: 3 large radial blobs animating at 14–22s — imperceptibly slow, infinitely alive
8. **Gradient text**: `background-clip: text` on display headlines, always `--accent → --accent-v`
9. **Dot grid**: `radial-gradient` 1px dots at 28×28px, opacity 0.35–0.5, layered under hero sections
10. **Notification dot**: 6px dot on bell icon, positioned `top: 5px right: 5px`, `--accent` fill, `1.5px solid --surface` border to cut out cleanly
