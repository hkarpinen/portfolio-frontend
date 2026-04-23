# Screen Map & Route Structure

All routes listed with their layout, key components, and responsive notes.

---

## Public / Auth (no app shell)

### `/` — Landing
- **Layout**: full-width, sticky header, sections
- **Sections**: Hero (gradient mesh + animated badge + headline + stats + app preview), Features grid (4 cards), Testimonials (3 cards), CTA, Footer
- **Mobile**: hamburger nav, stacked sections, clamped font sizes
- **Key interactions**: CTA → `/portfolio`, explore → `/bills`, contact → `/portfolio/contact`

### `/login` — Login
- **Layout**: centered card, full-viewport gradient bg
- **Components**: email input, password input (show/hide toggle), submit button (loading state), OAuth buttons (GitHub, Google), link to register
- **Validation**: email format check, min 6 chars password, inline errors

### `/register` — Register
- **Layout**: same as login
- **Components**: name, email, password (with strength meter), confirm password
- **Password strength**: 4-segment bar, colors: danger → warning → warning → success
- **On success**: → `/confirm-email`

### `/confirm-email` — Confirm Email
- **Two states**: `success=true` (check your inbox) / `success=false` (link expired)
- **Actions**: "I've confirmed — continue" → `/bills`, resend button (3s feedback), change email → `/register`

---

## App Shell (sidebar + topbar)

All routes below use the app shell:
- **Desktop**: fixed sidebar (220px expanded / 60px collapsed) + 56px topbar + scrollable main
- **Mobile**: hidden sidebar (drawer via hamburger) + topbar + fixed bottom nav (80px) + `16px` padding

---

## Portfolio Module

### `/portfolio` — About
- **Layout**: hero banner (gradient + dot grid) + 2-col grid (projects left, skills/facts sidebar right)
- **Hero**: avatar initials, name, role, action buttons (contact, CV, GitHub, LinkedIn)
- **Projects**: 3 cards with icon, title, description, tech badges
- **Mobile**: 2-col grid → stacked

### `/portfolio/contact` — Contact
- **Layout**: 2-col grid (contact form left, contact info cards right)
- **Form**: name + email (2-col), subject, message textarea, submit with success state
- **Success state**: replaces form with confirmation + "Send another" button
- **Mobile**: 2-col → stacked, name/email row → stacked

---

## Bills Module

### `/bills` — Households Overview
- **Layout**: stat row (4 cards) + household card grid + "create" dashed card
- **Stats**: Total balance, Households count, Bills due, Your share
- **Household cards**: name, initials, members, bills count, balance badge, progress bar, your share
- **Modal**: Join household (invite code input)
- **Mobile**: stat grid wraps, household cards wrap

### `/bills/create-household` — Create Household
- **Layout**: single column, max-width 500px
- **Form**: name, description textarea, info alert, cancel + create buttons

### `/bills/[id]` — Household Detail
- **Layout**: stat row (4 cards) + tabs (Bills / Contributions / Income) + bill list
- **Bill list**: icon (paid/unpaid), name, due badge, category badge, split info, amount + your share
- **Tabs**: Bills tab shows list; Contributions/Income tabs navigate to sub-pages

### `/bills/[id]/add-bill` — Add Bill
- **Layout**: single column, max-width 560px
- **Form**: name, amount + due date (2-col → stacked mobile), category select, split method select, note textarea

### `/bills/[id]/bills/[billId]` — Bill Detail
- **Layout**: 2-col (bill info + splits left, action card + remind card right) → stacked mobile
- **Left**: total amount hero, 3 meta cells (category/split/members), split breakdown with per-person progress bars + paid/unpaid badges
- **Right**: warning alert (days until due), "Mark as paid" CTA, remind unpaid members

### `/bills/[id]/contributions` — Contributions
- **Layout**: single column, monthly cards
- **Each card**: month header, total, per-member row with avatar + progress bar + amount

### `/bills/[id]/income` — Income
- **Layout**: stat row (3 cards) + income list
- **Add income modal**: source, amount, date, recurring toggle

### `/bills/[id]/settings` — Household Settings
- **Layout**: single column, max-width 560px, 3 cards (General, Members, Danger zone)
- **General**: name, default split, currency, save button
- **Members**: avatar + name + role badge + remove button
- **Danger**: red border card, delete button

---

## Forum Module

### `/forum` — Feed
- **Layout**: 2-col (feed + communities sidebar) → stacked mobile
- **Tabs**: Feed / Communities / Hot
- **Thread card**: vote column (up/down/score) + content (meta, title, actions)
- **Sidebar**: Your communities list, Forum rules list, Create community button

### `/forum/communities/[slug]` — Community Detail
- **Layout**: banner (gradient + icon + stats) + thread list
- **Banner**: community icon, name, member/post counts
- **Actions**: Mod tools button, Post here button

### `/forum/thread/[id]` — Thread Detail
- **Layout**: 2-col (thread + comments left, community info sidebar right) → stacked mobile
- **Thread post**: vote column + flair badge + title + body + action row
- **Comment box**: textarea + cancel + comment buttons
- **Comments**: avatar + author + score + body + vote/reply actions + nested replies (1 level, left border)

### `/forum/create-thread` — Create Thread
- **Layout**: single column, max-width 680px
- **Form**: community select, title input (with hint), body textarea, flair select

### `/forum/search` — Search
- **Layout**: search input (full width, max 640px) + results or trending communities
- **Empty state**: trending communities grid
- **Results**: filtered thread cards + result count

### `/forum/create-community` — Create Community
- **Layout**: single column, max-width 520px
- **Form**: name (with hash icon), description, privacy select

### `/forum/[slug]/settings` — Community Settings / Mod Tools
- **Tabs**: Settings / Mod Queue / Mod Log
- **Settings tab**: community name, description, privacy, NSFW toggle, require flair toggle, moderators list
- **Mod Queue tab**: warning alert + report cards (type badge + dismiss/remove actions)
- **Mod Log tab**: action badge + target + mod name + timestamp rows

---

## Settings Module

### `/settings` — Profile
- **Layout**: tabs (Profile / Security / Notifications) + 2-col (form left, avatar card right) → stacked mobile
- **Form**: name + username (2-col → stacked), email, website, bio (with char counter)
- **Avatar card**: avatar with edit button overlay, upload button, remove button, format hint

### `/settings/security` — Security
- **Layout**: single column, max-width 640px, same tabs
- **Cards**: Password (expandable form with strength check), 2FA toggle (expands to backup codes + change method), Active sessions (device list with revoke), Danger zone
- **Password form**: current + new + confirm, mismatch error alert, disabled submit until valid

### `/settings/notifications` — Notifications
- **Layout**: single column, max-width 600px, same tabs
- **Sections**: Bills (3 toggles), Forum (3 toggles), Account (2 toggles), Email (2 toggles)
- **Each row**: label + description + toggle (right-aligned)

---

## Responsive Layout Summary

| Breakpoint | Sidebar | Content padding | Two-col grids | Nav |
|---|---|---|---|---|
| `< 768px` (mobile) | Hidden, drawer on hamburger tap | `16px` | Stack to 1 col | Bottom tab bar (5 items) |
| `768px–1023px` (tablet) | Collapsed (60px) | `20px 24px` | Maintain 2 col | Sidebar |
| `1024px+` (desktop) | Expanded (220px) or collapsible | `28px 32px` | Maintain 2 col | Sidebar |

---

## Component Composition by Screen Complexity

### Simple (form-only screens)
Login, Register, Confirm Email, Create Household, Add Bill, Create Thread, Create Community
→ Single column, max-width 480–680px, Card wrapper, vertical form stack

### Medium (list + stats)
Households Overview, Income, Contributions, Forum Search, Notifications
→ Stat row + list/grid, no sidebar

### Complex (two-panel)
Bill Detail, Forum Feed, Forum Thread, Portfolio About, Portfolio Contact, Settings Profile, Settings Security
→ Main content + fixed-width sidebar (280–300px), collapses on mobile
