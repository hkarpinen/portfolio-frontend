# Component Inventory

All components follow these universal rules:
- Use `--ff-display` (Plus Jakarta Sans) for headings, labels, brand text
- Use `--ff-body` (Inter) for all UI text, inputs, descriptions
- All interactive elements have hover, active, disabled, focus-visible states
- All transitions use `duration-fast` (110ms) for color/border, `duration-slow` (380ms) for entrance
- Never hardcode colors — always reference CSS custom properties

---

## Button

### Variants
| Variant | Background | Text | Border | Use when |
|---|---|---|---|---|
| `primary` | `--accent` → `--accent-hi` on hover | white | none | Primary CTA, form submit |
| `secondary` | `--surface-2` → `--surface-3` | `--text` | `--border` | Secondary actions |
| `ghost` | transparent → `--accent-subtle` | `--text-2` → `--accent` | none | Tertiary, nav actions |
| `danger` | `--danger` | white | none | Destructive actions |
| `outline` | transparent → `--accent-subtle` | `--accent` | `--accent` | Emphasis without fill |
| `success` | `--success` | white | none | Confirmation states |

### Sizes
| Size | Height | Padding | Font | Radius |
|---|---|---|---|---|
| `xs` | 26px | `4px 10px` | 11px | `rounded-sm` |
| `sm` | 30px | `6px 12px` | 12px | `rounded-sm` |
| `md` | 36px | `8px 16px` | 13px | `rounded-md` |
| `lg` | 42px | `10px 22px` | 14px | `rounded-md` |
| `xl` | 50px | `13px 28px` | 15px | `rounded-lg` |
| `icon` | 34×34px | `7px` | — | `rounded-md` |
| `icon-sm` | 28×28px | `5px` | — | `rounded-sm` |

### States
- **Hover**: background shift + `shadow-glow` on primary
- **Active/press**: `scale(0.97)`
- **Disabled**: `opacity-50`, `cursor-not-allowed`
- **Loading**: replace icon with spinner, keep text, disable interaction
- **Full width**: `w-full`

### Icon placement
- `icon` prop: left of label
- `iconRight` prop: right of label
- Icon size: always 13px inside buttons

---

## Input

### Anatomy
```
[label]
[icon-left] [input field] [icon-right]
[error message OR hint text]
```

### Styling
- Height: 38px
- Background: `--surface-2`
- Border: `--border` default → `--accent` on focus → `--danger` on error
- Focus ring: `box-shadow: 0 0 0 3px var(--accent-subtle)`
- Error ring: `box-shadow: 0 0 0 3px var(--danger-s)`
- Label: 12px, weight 500, `--text-2`, `letter-spacing: 0.02em`
- Placeholder: `--text-3`
- Error message: 11px, `--danger`
- Hint text: 11px, `--text-3`
- Padding: `8px 12px` (add 22px left if icon-left, 24px right if icon-right)

### Variants
- **Text / email / password / number / date** — all use same base style
- **Password** — always include show/hide toggle as `icon-right`
- **Search** — `icon-left="search"`, borderless option for nav search bars

---

## Textarea
Same styling as Input but `resize: vertical`, `padding: 10px 12px`, `line-height: 1.6`

---

## Select
Same styling as Input. Custom caret via `appearance: none` + positioned chevron-down icon. Height 38px.

---

## Toggle (Switch)
- Track: 40×22px, `rounded-full`, `--surface-3` off → `--accent` on, transition 180ms
- Knob: 18×18px, `#fff`, `box-shadow: 0 1px 4px rgba(0,0,0,0.3)`, slides left↔right via CSS `left` transition 180ms spring
- Small variant: 32×18px track, 14×14px knob
- Label: 13px, `--text-2`, sits to the right of the track

---

## Card

### Base
- Background: `--surface`
- Border: `1px solid --border`
- Border-radius: `rounded-lg` (16px)
- Padding: `20px` default
- Shadow: `shadow-sm`

### Hover variant (`hover` prop)
- `translateY(-2px)` + `shadow-md` on hover
- Transition: 200ms spring

### Glow variant (`glow` prop)
- Border changes to `--accent` on hover
- `shadow-glow` applied on hover

### Glass variant
- `background: oklch(from var(--surface) l c h / 0.6)`
- `backdrop-filter: blur(12px)`

---

## Badge

### Variants
| Variant | Background | Text | Border |
|---|---|---|---|
| `default` | `--surface-3` | `--text-2` | `--border` |
| `primary` | `--accent-subtle` | `--accent` | accent @ 30% |
| `success` | `--success-s` | `--success` | success @ 25% |
| `warning` | `--warning-s` | `--warning` | warning @ 25% |
| `danger` | `--danger-s` | `--danger` | danger @ 25% |
| `violet` | `--accent-v-subtle` | `--accent-v` | accent-v @ 25% |

### Sizes
- `sm`: `2px 7px`, 11px font
- `md`: `3px 9px`, 12px font
- Both: `rounded-full`, weight 500

### Dot
Optional 5×5px circle (`background: currentColor`) before text for status indicators.

---

## Alert

### Variants: `info` | `success` | `warning` | `danger`
- Background: semantic `-s` token (12% alpha)
- Border: semantic color @ 30% alpha
- Left icon: 15px, semantic color
- Title: 13px, weight 600, `--text`
- Body: 12px, `--text-2`, `line-height: 1.5`
- Optional close button (X icon, top-right)

---

## Avatar
- Shape: circle
- Border: `2px solid --surface` (to cut out from backgrounds)
- Fallback: 2-letter initials, deterministic color from name (6 accent colors in rotation)
- Online indicator: 28% of avatar size, `--success` fill, `2px solid --surface` border, bottom-right

### Sizes commonly used
- 24px — inline in comments
- 28px — compact lists
- 32px — nav, top bar
- 34px — card rows
- 36px — testimonials
- 80px — profile hero

---

## Tabs
- Container: `border-bottom: 1px solid --border`
- Tab button: `10px 16px` padding, 13px font
- Active: weight 600, `--text`, `border-bottom: 2px solid --accent` (overlaps container border via `margin-bottom: -1px`)
- Inactive: weight 400, `--text-3`
- Optional count badge inline with label
- Optional icon (13px) inline with label

---

## Modal
- Backdrop: `oklch(0% 0 0 / 0.6)` + `blur(4px)`, `fadeIn` 150ms
- Panel: `--surface`, `border: 1px solid --border`, `rounded-xl`, `shadow-lg`, `scaleIn` 200ms spring
- Max-height: 90vh with overflow-auto on body
- Header: `20px 24px` padding, `border-bottom`, title 16px weight 700 `--ff-display`, X button top-right
- Body: `20px 24px` padding
- Footer (actions): `16px 24px` padding, `border-top`, flex right-aligned

---

## Skeleton
- Background: shimmer gradient `--surface-2` → `--surface-3` → `--surface-2`
- Background-size: 200% 100%
- Animation: `shimmer` 1.6s ease-in-out infinite
- Use for: content loading, list placeholders, image placeholders

---

## Empty State
- Centered flex column
- Icon container: 56×56px, `rounded-xl`, `--accent-subtle` bg, 24px icon in `--accent`
- Title: 15px, weight 700, `--ff-display`
- Description: 13px, `--text-3`, max-width 280px, `line-height: 1.6`
- Optional action button below description

---

## Spinner
- SVG circle with transparent track + animated arc
- Color: `--accent` default
- Sizes: 13px (inside buttons), 18px (default), 24px+ (full-page)
- Animation: `spin` 0.8s linear infinite

---

## Progress Bar
- Track: `--surface-3`, full width, specified height, `rounded-full`, overflow hidden
- Fill: accent or semantic color, `rounded-full`
- Transition: `width 500ms spring` for animated value changes

---

## StatCard
Structure:
```
[label — 12px uppercase tracking-wider --text-3]    [icon container 32×32 rounded-md --accent-subtle]
[value — 28px extrabold --ff-display]
[trend arrow + trend value] [subtitle --text-3]
```
- Padding: `20px 22px`
- Value font: Plus Jakarta Sans, 800, 28px
- Trend up: `--success`, trend down: `--danger`

---

## Navigation Sidebar
- Width: 60px collapsed, 220px expanded
- Transition: 240ms spring
- Background: `--surface`, `border-right: 1px solid --border`
- Logo area: 28×28px brand mark (gradient `--accent` → `--accent-v`), "Portfolio" wordmark
- Nav items: icon (16px) + label, `9px 12px` padding, `rounded-md`
  - Active: `--accent-subtle` bg, `--accent` text, 3×18px left accent bar
  - Hover: `--surface-2` bg, `--text` color
- Section labels: 10px, weight 700, `--text-3`, uppercase, `tracking-widest` (hidden when collapsed)
- Bottom: theme toggle, collapse toggle

## Top Bar
- Height: 56px
- Background: `--surface`, `border-bottom: 1px solid --border`
- Left: page title (15px, weight 700, `--ff-display`) + subtitle (11px, `--text-3`)
- Right: action slots, notification bell (with dot indicator), avatar

---

## Breadcrumb
- Items separated by `chevron-right` icon (12px, `--text-3`)
- Last item: `--text`, weight 500
- Earlier items: `--text-3`, weight 400, clickable (cursor pointer)
- Font size: 12px

---

## SectionHeader
```
[breadcrumb]
[title — 22px extrabold --ff-display]  [action slot]
[subtitle — 13px --text-3]
```
- Margin bottom: 24px

---

## Page Layout (App Shell)
```
<div style="display:flex; height:100vh; overflow:hidden">
  <Sidebar />                          // fixed width, full height
  <div style="flex:1; display:flex; flex-direction:column; overflow:hidden">
    <TopBar />                         // 56px fixed header
    <main style="flex:1; overflow-y:auto; padding:28px 32px; background:--bg">
      <div style="max-width:1200px; margin:0 auto">
        {page content}
      </div>
    </main>
  </div>
</div>
```
Main content max-width: 1200px, centered. Padding: 28px 32px desktop, 16px mobile.
