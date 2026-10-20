# Kilimandjaro Restaurant — Technical Specification

**Platform:** Base44 SPA (React + Vite + Tailwind) · **Published URL:** `https://taste-kilimandjaro-now.base44.app`
**Restaurant:** Kilimandjaro Restaurant · 4301 Chestnut St, Philadelphia, PA 19104 · (215) 387-1970
**Domain:** Direct pickup/delivery ordering, staff management portals, and multi-channel revenue tracking for a West African heritage kitchen.

---

## 1. Database Schemas & Entities

All entities are Base44 data objects (`base44/entities/*.jsonc`). Every record automatically carries built-in fields: `id`, `created_date`, `updated_date`, `created_by_id`. The app's data layer is entirely driven through the Base44 SDK client (`base44.entities.<Name>`), with realtime subscription support.

### 1.1 `Order`
The central transactional record. Created by the customer checkout flow (web) or the POS panel (pos), consumed by the unified Staff Portal.

| Field | Type | Default | Notes |
|---|---|---|---|
| `customer_name` | string | `"Walk-in"` | **Required** |
| `customer_phone` | string | `""` | **Required** |
| `items` | array<object> | `[]` | Each entry: `{ name, price, qty, modifiers:{}, special_instructions }` |
| `subtotal` | number | `0` | Sum of `price × qty` |
| `tax` | number | `0` | `max(subtotal − discount, 0) × 0.08` |
| `tip` | number | `0` | 15/18/20% presets or custom |
| `delivery_fee` | number | `0` | Applied only for delivery orders |
| `discount` | number | `0` | From applied promo code |
| `promo_code` | string | `""` | Applied code string |
| `total` | number | `0` | **Required** · `subtotal − discount + tax + delivery_fee + tip` |
| `status` | enum | `"pending"` | `pending` → `preparing` → `out_for_delivery` → `completed` / `refunded` |
| `order_type` | enum | `"pickup"` | `pickup` \| `delivery` |
| `order_source` | enum | `"web"` | `web` \| `pos` |
| `pickup_time` | string | `"ASAP"` | ASAP / 15 / 30 / 45 / 60 min |
| `delivery_address` | string | `""` | Required for delivery |
| `delivery_notes` | string | `""` | Gate codes, drop-off, allergies |
| `payment_method` | string | `"card"` | `card` \| `cash` (POS) |
| `refund_requested` | boolean | `false` | Customer-initiated flag from OrderStatus |
| `chef_acknowledged` | boolean | `false` | Kitchen ack silences audio alert |
| `prep_started_at` | string | `""` | ISO timestamp set on first ack |
| `out_for_delivery_at` | string | `""` | ISO timestamp |
| `delivered_at` | string | `""` | ISO timestamp on completion |
| `eta_minutes` | number | `0` | 20 pickup / 35 delivery |

**Required fields:** `customer_name`, `customer_phone`, `total`.

### 1.2 `MenuItem`
| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string | — | **Required** |
| `description` | string | `""` | |
| `price` | number | — | **Required** |
| `image` | string | `""` | Public URL (direct upload via `UploadPublicFile` or pasted URL) |
| `category_id` | string | — | **Required** · one of CATEGORIES ids |
| `category_label` | string | `""` | Denormalized label |
| `tag` | string | `""` | e.g. "#1 Most Liked" |
| `approval` | string | `""` | e.g. "97%" |
| `ratings` | number | `0` | Rating count |
| `item_id` | string | `""` | Original seed id |
| `in_stock` | boolean | `true` | Toggle drives realtime stock UI |
| `display_order` | number | `0` | Sort weight |

### 1.3 `Promotion`
| Field | Type | Default | Notes |
|---|---|---|---|
| `code` | string | — | **Required** · uppercase |
| `description` | string | `""` | |
| `discount_type` | enum | `"percent"` | **Required** · `percent` \| `flat` |
| `value` | number | `0` | **Required** · percent number or flat $ |
| `min_subtotal` | number | `0` | Minimum qualifying subtotal |
| `max_uses` | number | `0` | `0` = unlimited |
| `uses` | number | `0` | Incremented on each successful web order |
| `active` | boolean | `true` | Toggle to retire without deleting |

### 1.4 `ExternalRevenueLog`
| Field | Type | Default | Notes |
|---|---|---|---|
| `log_date` | date | — | **Required** |
| `platform` | string | `"Uber Eats"` | **Required** |
| `gross` | number | `0` | **Required** |
| `fees` | number | `0` | Platform fees |
| `net` | number | `0` | `gross − fees` |
| `order_count` | number | `0` | |
| `notes` | string | `""` | |

### 1.5 `StoreSettings`
A singleton record (first row created with defaults if none exists). Shared in-memory cache + realtime subscription via `useStoreSettings`.

| Field | Type | Default | Notes |
|---|---|---|---|
| `master_password` | string | `""` | Admin dashboard gate |
| `open_time` | string | `"11:00"` | |
| `close_time` | string | `"22:00"` | |
| `paused` | boolean | `false` | Panic-pause flag |
| `pickup_enabled` | boolean | `true` | Disables pickup toggle in cart |
| `delivery_enabled` | boolean | `true` | Disables delivery toggle in cart |
| `delivery_base_fee` | number | `3.99` | |
| `delivery_radius` | number | `5` | miles |
| `stripe_connected` | boolean | `false` | Status flag (live connect not wired) |
| `stripe_account_id` | string | `""` | |
| `twilio_configured` | boolean | `false` | Status flag (SMS not wired) |
| `phone_for_sms` | string | `""` | |

### 1.6 Built-in `User`
Read-only Base44 auth user: `id`, `created_date`, `full_name`, `email`, `role` (`admin`/`user`). Users join via invite, not direct record creation.

---

## 2. Route Architecture

Defined in `src/App.jsx`. AuthenticatedApp wraps everything inside `<AuthProvider>` + `<QueryClientProvider>` + `<Router>`; a `ScrollToTop` component resets scroll on navigation.

| Route | Component | Access | Purpose |
|---|---|---|---|
| `/` | `Home` | Public (customer) | Landing, menu, cart drawer, checkout |
| `/orders` | `OrderStatus` | Public | Phone + Order ID lookup (two-factor) + refund requests |
| `/staff` | `StaffPortal` | Staff email auth (`staff` / `chef` / `admin`) | Unified portal — Kitchen Queue, POS Entry, Stock & Orders |
| `/admin` | `Admin` | Master password | Menu, orders, store settings, POS, promos, payouts |
| `/login` | `Login` | Public | Email/password + Google (liquid glass) |
| `/register` | `Register` | Public | Email/password + Google, OTP flow |
| `/forgot-password` | `ForgotPassword` | Public | Reset request email |
| `/reset-password` | `ResetPassword` | Public | `?token=` new-password entry |
| `*` | `PageNotFound` | Public | 404 |

**Non-route surfaces:** Cart drawer and Modifier/Payment modals are in-page overlays on `/`; DishLightbox image modal inside MenuSection; the unified staff portal (`/staff`) is gated by Base44 email authentication (role `staff` / `chef` / `admin`).

---

## 3. Key State Hooks & Logic

### 3.1 `useMenu` — realtime menu + stock
- Loads `MenuItem.list('-display_order', 500)` and groups by `category_id`.
- Subscribes to `base44.entities.MenuItem` realtime events to refresh the list when items are edited in Admin — stock toggles and price edits propagate live without page reloads.
- Exposes `{ menuByCategory, loading }`.

### 3.2 `useStoreSettings` — singleton settings + realtime sync
- Module-level `cached` record + `loadPromise` deduplicate requests across components (CartDrawer, Kitchen, Admin).
- On first load, if no record exists it creates one from `DEFAULTS`.
- Subscribes to `StoreSettings` events; an update (e.g. Admin toggling `paused`) instantly re-renders the live cart and kitchen banner.
- `update(patch)` persists changes and updates the shared cache; `reload()` clears the cache.

### 3.3 Realtime stock toggle (optimistic)
In Admin's menu list, the stock toggle immediately updates the local `menuItems` state array (optimistic UI), then calls `MenuItem.update(id, { in_stock })`. Because `useMenu` in the customer view subscribes to MenuItem events, the storefront reflects the change within seconds. If the save fails, a reload reconciles.

### 3.4 Order throttling / fulfillment controls
- **Pickup times** are constrained to `ASAP / 15 / 30 / 45 / 60 min` in the cart.
- **Per-service toggles:** `pickup_enabled` / `delivery_enabled` disable the respective cart toggle; if only one is enabled the cart auto-selects it; if neither is enabled the cart shows "Online ordering is currently unavailable" and blocks checkout.
- **`canCheckout`** requires: items present, name + phone (and address if delivery), `!paused`, and at least one fulfillment channel open.
- **ETA** is set at creation: 20 min pickup, 35 min delivery.

### 3.5 Panic pause ("Pause Orders")
- The Kitchen header has a **Pause Orders** button that calls `updateSettings({ paused: !paused })`.
- While `paused === true`, the customer cart shows a terracotta banner ("The kitchen is currently closed — ordering is paused") and `canCheckout` is false, so no new web orders can be placed.
- Because `useStoreSettings` is realtime, the pause takes effect on the storefront immediately. POS entries can still be created by staff from the Staff Portal / Admin POS tab.

### 3.6 Promo code math (CartDrawer)
1. On "Apply", `Promotion.list` is fetched and the entered (uppercased) code is matched against `active !== false` records.
2. Validation: code exists; if `max_uses > 0` and `uses >= max_uses` → rejected with "usage limit reached".
3. If `subtotal >= min_subtotal`, discount computes:
   - `percent`: `round(subtotal × value/100, 2)`
   - `flat`: `min(value, subtotal)` (never exceeds subtotal)
4. Tax is computed on the **discounted base**: `max(subtotal − discount, 0) × TAX_RATE`.
5. On successful payment, `Home.handlePaid` increments the matched promotion's `uses` by 1.

### 3.7 `useAudioAlert` — staff siren
- A layered Web Audio siren — primary sine tones (520 Hz → 650 Hz) stacked with soft harmonic overtones (1040 Hz → 1300 Hz at 0.3 relative gain) at a 1.0 peak master gain — loops while `active` is true (`active = any unacknowledged active order`).
- Browsers block autoplay until a user gesture, so it exposes `blocked` and an `enableSound()` unlock; any pointer/keydown while active resumes the `AudioContext`.
- Acknowledging a pending order (`chef_acknowledged = true`) flips it out of "needs ack" and, once no order needs ack, the siren stops. This enforces physical acknowledgement from kitchen staff.

---

## 4. POS & Financial Engine

### 4.1 Tax
- **Philadelphia restaurant sales tax is `0.08` (8.0%)**, exported as `TAX_RATE` from `src/data/menu.js` and used identically across the web cart, the POS panel, and the payment summary labels.
- Web order: `tax = max(subtotal − discount, 0) × 0.08` (tax is computed **after** the promo discount is subtracted).
- POS order: `tax = subtotal × 0.08` (no promo/tip/discount on POS tickets).

### 4.2 Web checkout totals (Home + CartDrawer)
```
subtotal   = Σ item.price × qty
discount   = promo applied (percent or flat, min_subtotal gated)
tax        = max(subtotal − discount, 0) × 0.08
deliveryFee= order_type === 'delivery' ? settings.delivery_base_fee : 0
tip        = tipPct preset (15/18/20%) of subtotal, or custom amount
total      = subtotal − discount + tax + deliveryFee + tip
```
On payment confirmation, `Order.create` persists the full record with `order_source: 'web'`, then increments the matched `Promotion.uses`.

### 4.3 POS tickets → kitchen logs (`PosPanel`)
- `PosPanel` (rendered in both Admin **POS Entry** tab and Kitchen **POS Entry** tab) builds an in-memory `ticket` from `menuItems` (in-stock only).
- `payment_method` is `card` ("In-Person Card") or `cash`.
- On "Send to Kitchen", it creates an `Order` with `order_source: 'pos'`, `order_type: 'pickup'`, `status: 'pending'`, `tip: 0`, `delivery_fee: 0`, `discount: 0`, `payment_method`, `chef_acknowledged: false`.
- Because Kitchen subscribes to `Order` realtime events, the POS ticket appears in the kitchen queue instantly (flagged with a "POS" badge) and triggers the audio alert until acknowledged — same path as a web order.

### 4.4 Gross Revenue aggregation (`PayoutsPanel`)
The Payouts dashboard sums three channels into a single **Gross Revenue** figure:
- **Direct Web:** sum of `Order.total` where `order_source === 'web'`.
- **POS:** sum of `Order.total` where `order_source === 'pos'`.
- **Uber Eats / external:** sum of `ExternalRevenueLog.net` across logged dates.

It also exposes tips collected (web), platform fees logged, a payout-balance placeholder, and a demo "Connect Bank" action (live Stripe Connect not wired). External revenue logs can be added/deleted inline.

---

## 5. Component Inventory

### Pages (`src/pages/`)
| File | Role |
|---|---|
| `Home.jsx` | Landing/menu/cart/checkout orchestrator |
| `Admin.jsx` | Password-gated dashboard (6 tabs) |
| `OrderStatus.jsx` | Phone lookup + refund requests |
| `StaffPortal.jsx` | Unified staff portal: Kitchen Queue, POS Entry, Stock & Orders |
| `Login.jsx` / `Register.jsx` | Liquid-glass auth |
| `ForgotPassword.jsx` / `ResetPassword.jsx` | Auth recovery |

### Kilimandjaro components (`src/components/kilimandjaro/`)
| File | Role |
|---|---|
| `Header.jsx` | Sticky glass header: nav, phone, socials, Sign In, cart |
| `Hero.jsx` | Branding + CTA + trust bar + featured dish card |
| `CategoryTabs.jsx` | Horizontally scrollable category tabs (incl. "Full Menu") |
| `MenuSection.jsx` | Renders category group(s), dinner banner, lightbox host |
| `MenuItemCard.jsx` | Dish card: image, price, tag, rating, qty controls, stock state |
| `DishLightbox.jsx` | Full-screen image viewer (Esc to close) |
| `ModifierModal.jsx` | Required modifier groups + special instructions |
| `CartDrawer.jsx` | 420px slide-out: items, type toggle, tip, promo, totals, checkout |
| `PaymentModal.jsx` | Card entry + order summary + confirmation view |
| `Reviews.jsx` | Social-proof testimonials (5-star) |
| `OurStory.jsx` | Heritage narrative + stat badges |
| `LocationHours.jsx` | Contact, hours, map (Leaflet, dark tiles) |
| `Footer.jsx` | Branding, socials, utility links, copyright |
| `MenuItemForm.jsx` | Add/Edit item modal incl. direct image upload |
| `PosPanel.jsx` | In-person ticket builder (used by Admin + Kitchen) |
| `PromotionsPanel.jsx` | Promo code CRUD |
| `PayoutsPanel.jsx` | Revenue aggregation + external logger |

### Hooks (`src/hooks/`)
- `useMenu.js` — menu + stock load + realtime subscription.
- `useStoreSettings.js` — singleton settings cache + realtime + `update`.
- `useAudioAlert.js` — Web Audio staff siren with gesture unlock.

### Lib / shared (`src/lib/`, `src/components/`)
- `AuthContext.jsx` — auth state, public-settings loading, redirect handling.
- `ProtectedRoute.jsx` — auth gate (`fallback`, `unauthenticatedElement`).
- `authReturnTo.js`, `app-params.js`, `query-client.js`, `utils.js`, `PageNotFound.jsx`.
- Full shadcn/ui kit under `src/components/ui/` (button, input, dialog, sheet, toast, etc.).
- `ScrollToTop.jsx`, `UserNotRegisteredError.jsx`, `GoogleIcon.jsx`, `AuthLayout.jsx`.

### Data (`src/data/menu.js`)
Exports: `RESTAURANT_INFO`, `CATEGORIES`, `DINNER_BANNER`, `MENU` (seed menu), `MODIFIERS` (per-item required option groups), `TAX_RATE` (`0.08`, 8.0% — 6% PA state + 2% Philadelphia local).

---

## 6. Visual Layout & UI Design Theme

### 6.1 Color palette (`src/index.css` custom tokens)
| Token | Value | Use |
|---|---|---|
| `--k-surface` | `#0D0C0A` | Primary dark surface (page bg) |
| `--k-card` | `#161412` | Card / drawer bg |
| `--k-gold` | `#E0B034` | Primary CTA, active tabs, highlights |
| `--k-gold-hover` | `#F2C249` | Hover state |
| `--k-terracotta` | `#C85A32` | Badges, discounts, warnings, out-of-stock |
| `--k-silk` | `#F9F7F2` | Primary text (warm off-white) |
| `--k-muted` | `#A39E93` | Secondary text |
| `--k-line` | `rgba(255,255,255,0.08)` | Hairline borders |

The base shadcn tokens (`--background`, `--foreground`, `--primary`, etc.) remain for shadcn/ui primitives; the kilimandjaro components draw from the `--k-*` set.

### 6.2 Typography
- **Headings / display:** `'Montserrat'` (bold, uppercase, tight tracking) — `--font-heading` / `--font-display`.
- **Body:** `'Inter'` — `--font-body`.
- Hierarchy: oversized uppercase hero headings → bold uppercase category labels with wide letter-spacing → small uppercase muted labels (`text-xs uppercase tracking-[0.2em]`) → body prose. All fonts are Google-font loaded via `@import` at the top of `index.css`.

### 6.3 Visual hierarchy & aesthetic
- **Liquid-glass / glassmorphism** is the signature: frosted blur surfaces (`backdrop-filter: blur(16px)`, semi-transparent dark backgrounds) for the header, header pills, auth surfaces, and modals — yielding a "liquid glass" frosted-glow aesthetic.
- **12px border-radius** on all cards (`--radius: 0.75rem`), 1px subtle hairline borders (`--k-line`), generous vertical rhythm.
- Gold CTAs as pill buttons (`rounded-full`) with active-scale micro-interactions (`active:scale-95`, `hover:scale-[1.01]`).
- Section spacing flows: Hero → CategoryTabs (sticky under header) → MenuSection (2-col card grid on desktop, stacked on mobile) → OurStory → Reviews → LocationHours → Footer.

### 6.4 Branding / hero elements
- Header: "KILIMANDJARO" wordmark + "West African Heritage Kitchen" tagline, centered desktop section nav, right-side cluster of phone/social/Sign In/cart.
- Hero: large headline + subheadline, "Order Pickup" gold CTA, Google directions link, trust bar (4.4★ rating, 1,000+ reviews, address), and on large screens a featured Thieboudienne card plus a hero food image.
- Footer: wordmark, social icons (Facebook, Instagram), click-to-call, Track Order / Admin / Staff utility links, copyright.

### 6.5 Mobile layout structure (mobile-first)
- **Sticky top header** (fixed) with cart button always reachable.
- **Category tabs** scroll horizontally with momentum (`no-scrollbar` utility hides the scrollbar) and auto-center the active tab — mobile users swipe between categories.
- **Menu grid** collapses from 2 columns (sm+) to a single column on phones; each card stacks image over details with inline +/− quantity controls.
- **Cart drawer** is `w-[420px] max-w-[100vw]`, so on phones it covers the full width while behaving as a right slide-out on desktop; body scroll is locked with a position-fixed trick while open.
- Modifier/Payment modals are bottom-anchored full-width sheets on mobile, centered glass dialogs on desktop.
- Touch targets are large (≥44px), focus rings use gold (`--k-gold`) for accessibility, and all interactive elements respect `k-focus` outlines.

### 6.6 Desktop layout (≥1024px)
- Centered **1200px max-width container** (`k-container`) with 24px gutters.
- Two-column menu grid, multi-up trust/feature rows, side-by-side POS panel (`lg:grid-cols-[1fr_360px]`), sticky receipt sidebar.
- Cart drawer slides in at a fixed 420px width, leaving the menu partially visible (non-destructive order management).
- Admin dashboard uses a wrapping tab bar across the top; Kitchen uses a two-column order-card grid with sticky header tabs.

---

*Generated 2026-10-01. This document describes the platform as currently implemented in the repository; deferred integrations (live Stripe Connect, Google Maps address autocomplete, Twilio SMS) are flagged as status-only fields in `StoreSettings`.*