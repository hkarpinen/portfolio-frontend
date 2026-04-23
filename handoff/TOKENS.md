# Design Tokens Reference

All values come from `globals.css` CSS custom properties. Tailwind classes in `tailwind.config.ts` map directly to these vars. **Never hardcode hex or rgb values — always use the token.**

---

## Colors

### Backgrounds (layered depth)
| Token | Dark value | Light value | Usage |
|---|---|---|---|
| `--bg` | `oklch(10% 0.018 255)` | `oklch(97% 0.005 255)` | Page/html background |
| `--bg-2` | `oklch(13% 0.022 255)` | `oklch(93% 0.008 255)` | Section backgrounds, alternating rows |
| `--bg-3` | `oklch(16% 0.022 255)` | `oklch(90% 0.010 255)` | Subtle tinted areas |

### Surfaces (cards & panels)
| Token | Dark | Light | Usage |
|---|---|---|---|
| `--surface` | `oklch(14% 0.025 255)` | `oklch(100% 0 0)` | Card, modal, sidebar backgrounds |
| `--surface-2` | `oklch(18% 0.022 255)` | `oklch(97% 0.005 255)` | Input fields, inner cards, stat rows |
| `--surface-3` | `oklch(22% 0.020 255)` | `oklch(94% 0.008 255)` | Hover states, badge backgrounds, pills |

### Borders
| Token | Dark | Light | Usage |
|---|---|---|---|
| `--border` | `oklch(26% 0.025 255)` | `oklch(88% 0.010 255)` | Default card/input borders |
| `--border-2` | `oklch(32% 0.022 255)` | `oklch(82% 0.014 255)` | Stronger borders, active separators |

### Text
| Token | Dark | Light | Usage |
|---|---|---|---|
| `--text` | `oklch(95% 0.005 255)` | `oklch(13% 0.020 255)` | Primary text, headings |
| `--text-2` | `oklch(68% 0.010 255)` | `oklch(36% 0.015 255)` | Secondary text, descriptions |
| `--text-3` | `oklch(46% 0.010 255)` | `oklch(56% 0.010 255)` | Muted text, placeholders, labels |

### Accent (primary action color)
Both accents share the same chroma (0.22) and lightness — only hue differs. This ensures visual harmony.

| Token | Hue | Usage |
|---|---|---|
| `--accent` | 252 (electric blue) | Primary buttons, links, active states, focus rings |
| `--accent-hi` | 252 (brighter) | Button hover state |
| `--accent-v` | 292 (violet) | Secondary accent, gradient end, badges |
| `--accent-glow` | 252 @ 30% alpha | Box shadow on hover for primary elements |
| `--accent-subtle` | 252 @ 10% alpha | Badge backgrounds, input focus tint, icon backgrounds |
| `--accent-v-subtle` | 292 @ 10% alpha | Violet badge backgrounds |

### Semantic
| Token | Usage |
|---|---|
| `--success` / `--success-s` | Paid status, positive trends, 2FA enabled. `-s` = 12% alpha background tint |
| `--warning` / `--warning-s` | Due dates, pending states, password strength fair |
| `--danger` / `--danger-s` | Errors, destructive actions, unpaid status |

---

## Typography

### Font families
```css
font-family: 'Plus Jakarta Sans', sans-serif;  /* --ff-display: headings, labels, brand */
font-family: 'Inter', sans-serif;              /* --ff-body: body text, UI, inputs */
```

### Type scale
| Class | Size | Line height | Usage |
|---|---|---|---|
| `text-xs` | 11px | 16px | Labels, badges, timestamps, meta |
| `text-sm` | 13px | 18px | UI text, form labels, secondary |
| `text-base` | 14px | 20px | Body text, list items, descriptions |
| `text-md` | 16px | 24px | Larger body, card text |
| `text-lg` | 18px | 28px | Subheadings |
| `text-xl` | 22px | 30px | Section titles |
| `text-2xl` | 28px | 36px | Page headings |
| `text-3xl` | 36px | 44px | Large headings |
| `text-4xl` | 48px | 56px | Hero headings |
| `text-5xl` | 64px | 72px | Display / landing hero |

### Font weight conventions
- **900 / black** — Landing hero, display text
- **800 / extrabold** — Page headings (`<h1>`), stat values
- **700 / bold** — Card titles (`<h2>`, `<h3>`), nav labels (active)
- **600 / semibold** — Form labels, important body, button text
- **500 / medium** — Secondary labels, badge text, meta
- **400 / normal** — Body text, descriptions, nav labels (inactive)

### Letter spacing conventions
- `-0.03em` (`tracking-tighter`) — Display / hero headlines (64–80px)
- `-0.025em` (`tracking-tight`) — Large headings (28–48px)
- `0.06em` (`tracking-wider`) — Uppercase section labels, meta
- `0.1em` (`tracking-widest`) — Nav section dividers ("MODULES", "ACCOUNT")

---

## Border Radius
| Token | Value | Usage |
|---|---|---|
| `rounded-xs` | 4px | Tiny pills, small badges |
| `rounded-sm` | 8px | Buttons (sm), inputs, small cards |
| `rounded-md` | 12px | Buttons (default), inputs (default), icon containers |
| `rounded-lg` | 16px | Cards, modals header, sidebar items |
| `rounded-xl` | 24px | Cards (feature), modals, drawers |
| `rounded-2xl` | 32px | Hero sections, large banners |
| `rounded-full` | 9999px | Avatars, badges, toggle track |

---

## Spacing Scale (4px grid)
| Class | Value | Notes |
|---|---|---|
| `p-2` | 4px | Icon padding, tight gaps |
| `p-4` | 8px | Small gaps, icon button padding |
| `p-6` | 12px | Compact card padding, nav item padding |
| `p-8` | 16px | Default gap, button padding |
| `p-10` | 20px | Card padding (compact) |
| `p-12` | 24px | Card padding (default), section gaps |
| `p-16` | 32px | Between cards, modal padding |
| `p-20` | 40px | Section padding (mobile) |
| `p-24` | 48px | Section padding (desktop) |
| `p-32` | 64px | Large section gaps |
| `p-40` | 80px | Hero section padding |

---

## Elevation / Shadow
| Token | Value | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 4px oklch(0%...)` | Default card shadow |
| `shadow-md` | `0 4px 20px oklch(0%...)` | Hovered cards, dropdowns, popovers |
| `shadow-lg` | `0 12px 48px oklch(0%...)` | Modals, drawers, floating panels |
| `shadow-glow` | `0 0 40px var(--accent-glow)` | Hover glow on featured cards, CTAs |

---

## Motion

### Easing curves
| Name | Value | Usage |
|---|---|---|
| `ease-spring` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, modals, toasts, dropdowns |
| `ease-out` | `cubic-bezier(0.2, 0, 0, 1)` | Hover states, quick transitions |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Color/border transitions |

### Durations
| Token | Value | Usage |
|---|---|---|
| `duration-fast` | 110ms | Micro-interactions (hover color, border) |
| `duration-mid` | 220ms | Dropdown open, badge appear |
| `duration-slow` | 380ms | Page entrance, modal open, card hover |
| `duration-page` | 500ms | Full page transitions |

### Motion principles
1. **Entrances use spring** — `cubic-bezier(0.16,1,0.3,1)` gives a natural overshoot feel
2. **Exit faster than entrance** — fade out at ~60% of entrance duration
3. **Stagger lists** — 60–80ms delay increment per item (`animationDelay`)
4. **Scale + fade for modals** — `scaleIn` (0.95 → 1.0) + `fadeIn` simultaneously
5. **No layout animations** — never animate width/height; use opacity + transform only
6. **Respect `prefers-reduced-motion`** — wrap all animations in a media query check

### Delight layer
- **Gradient mesh hero** — 3 large radial blobs animating slowly via `meshMove` keyframes (14–22s, looping). Blur them heavily. Never fast.
- **Dot grid texture** — `radial-gradient` 1px dots at 28×28px grid. Opacity 0.35–0.5. Layer under everything.
- **Accent glow on hover** — `box-shadow: var(--shadow-glow)` on cards + primary buttons on hover. Instant on, 300ms off.
- **Skeleton shimmer** — `shimmer` keyframe on loading states, 1.6s infinite. Never use a spinner for content loading.
- **Button press** — `scale(0.97)` on `mousedown`, snaps back on `mouseup`.
- **Page transitions** — `fadeUp` (Y+16px → Y0, opacity 0→1, 320ms spring) on every page mount.

---

## Breakpoints
| Name | Min-width | Targets |
|---|---|---|
| `xs` | 360px | Small Android phones |
| `sm` | 390px | iPhone 14/15 |
| `md` | 768px | iPad portrait, small tablets |
| `lg` | 1024px | iPad landscape, small laptops |
| `xl` | 1280px | Desktop |
| `2xl` | 1440px | Wide desktop |

### Responsive layout rules
- **Sidebar**: hidden on `< lg`, bottom nav on `< lg`, collapsed (60px) default on `lg`, expanded (220px) on `xl+`
- **Grid columns**: 1 col on `xs–sm`, 2 col on `md`, 3–4 col on `lg+`
- **Card padding**: `p-10` on mobile, `p-12` on `md+`
- **Hero font**: clamp from 40px (mobile) to 80px (desktop) — never fixed
- **Touch targets**: minimum 44×44px for all interactive elements
- **Font size floor**: 13px for body, 11px for absolute minimum (labels only)
