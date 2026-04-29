# RhaySource — Project Guide

## What this is
Multi-storefront e-commerce platform for RhaySource Ent., a Ghanaian retailer. Three independent storefronts share one codebase: Skincare (default), Workspace (premium tech), and Home Living. All data lives in Supabase; images are hosted on Cloudinary.

## Commands

All commands run from `frontend/` — there is no root-level `package.json`.

```bash
cd frontend
npm run dev      # Vite dev server (localhost:5173)
npm run build    # Production build → dist/
npm run lint     # ESLint
```

Backend (seeding/migrations only — no running server):
```bash
cd backend
npm run seed     # node db/seed.js
```

## Architecture

### Frontend stack
- React 19, React Router DOM 7, Framer Motion 12, Zustand 5
- Supabase JS 2 (database + auth + realtime)
- react-icons, lucide-react, recharts
- Vite 8 with a custom `apiPlugin` for dev-time API routes (`/api/contact`, `/api/images/sign`)

### Environment variables (frontend/.env)
```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_API_KEY
CLOUDINARY_URL
```

### Deployment
- Frontend → Vercel. `vercel.json` rewrites all non-`/api/` paths to `/` for SPA routing.
- API routes are Vercel serverless functions in `frontend/api/`.

## The three storefronts

| Storefront | Routes | Cart context | Navbar CSS override |
|---|---|---|---|
| Skincare (default) | `/`, `/shop`, `/products/:slug`, `/about` | `CartContext` + `CartDrawer` | — |
| Workspace | `/workspace`, `/workspace/shop`, `/workspace/products/:id`, `/workspace/about` | `TechCartContext` + `WorkspaceCartDrawer` | `Navbar_workspace.css` |
| Home Living | `/home-living`, `/home-living/shop`, `/home-living/products/:id` | `HomeLivingCartContext` + `HomeLivingCartDrawer` | — |

Each storefront is fully independent: separate CSS themes, separate cart contexts, separate product card variants.

### Admin (Studio)
Protected routes at `/studio/*`. Uses `AuthContext` + `ProtectedRoute`. Pages: Dashboard, Products, Stores, Categories, Settings, Login.

## Data fetching

**Never fetch products directly in components.** Always use the hooks:

```js
const { products, store, loading } = useProducts('workspace'); // filtered by store slug
const { product, loading } = useProduct(idOrSlug);             // single product, cache-first
```

`useProducts` and `useProduct` both read from the Zustand store in `src/store/useProductStore.js`, which maintains a **5-minute session cache** and a single global Supabase Realtime subscription (`global-catalog-sync`). Triggering a fresh fetch is `refetch()` (returned by `useProducts`) or `fetchAllProducts(true)`.

## CSS conventions

### Global utilities (`src/styles/global.css`)
- `.container` — `max-width: var(--layout-max-width)`, centered, `padding: 0 2rem`
- `.desktop-only` / `.mobile-only` — responsive visibility helpers
- **Sharp Borders** — Core navigational elements (Navbar) and store category cards use `border-radius: 0` to achieve a premium editorial and clinical "White Tech" look.


### Workspace design system (`WorkspacePage.css` `:root`)
All Workspace components must use these tokens — never hardcode colours:
```css
--ws-primary: #0ea5e9      /* Sky 500 */
--ws-secondary: #6366f1    /* Indigo 500 */
--ws-bg: #ffffff
--ws-surface-low: #f8fafc
--ws-surface-mid: #f1f5f9
--ws-surface-high: #e2e8f0
--ws-text-main: #191c1e
--ws-text-muted: #475569
--ws-font-head: 'Outfit'
--ws-font-body: 'Inter'
```

The Workspace aesthetic is called **"Luminous Laboratory"** — white-on-white, light backgrounds (#ffffff / #f8fafc) everywhere. Never introduce dark backgrounds in Workspace pages.

### File naming pattern
```
pages/
  WorkspacePage.jsx/.css         ← landing (home) page
  WorkspaceHome.css              ← landing-specific styles (nodes, carousel, parallax)
  WorkspaceShopPage.jsx/.css     ← product grid + filters
  WorkspaceProductDetailPage.jsx/.css
  WorkspaceAboutPage.jsx/.css

components/features/
  WorkspaceCartDrawer.jsx/.css   ← cart drawer (light theme)
  ProductCard.jsx/.css           ← generic card (Skincare / Home Living only)

components/layout/
  Navbar_workspace.css           ← workspace navbar overrides only
  StoreSpotlight.jsx/.css        ← cross-store discovery widget (idle-triggered)
```

## Workspace product cards

`TechCard` is defined **locally inside `WorkspaceShopPage.jsx`** — it is not a shared component. Always use `TechCard` for product cards on Workspace pages; never use the generic `ProductCard` there.

## Key patterns

### Mouse parallax (WorkspacePage hero)
Uses Framer Motion `useMotionValue` → `useSpring` (stiffness 150, damping 25) → `useTransform`. CSS `@keyframes` handle the continuous float animation on inner divs — do not mix Framer Motion `animate` y-values with CSS float on the same element.

### 3D Carousel & Automated Pagination (WorkspacePage)
Scroll-listener sets `activeIndex`; Framer Motion `animate={{ scale, opacity }}` applies depth based on distance from active card. Includes an **auto-advance timer (6s)** with a synchronized **pagination progress bar**. Manual interaction resets the timer to ensure continuous playback.

### Cart persistence
All three carts persist to `localStorage` (`rhaysource_tech_cart`, etc.). Carts are cleared on route change via the `useEffect` in `AppContent`.

### Settings / maintenance mode
`useSettings()` → `SettingsContext` → Supabase `settings` table. `settings.system_status.maintenance_mode` blocks all non-studio routes with a full-screen overlay.

### Notifications
`useNotification()` from `NotificationContext`. Cart add-to-cart uses `addNotification(...)` — rendered by `<NotificationToastContainer />` at the app root.

## What not to do
- Do not run `npm run dev` from the repo root — it will fail (no root `package.json`).
- Do not add a login/auth UI for end users — there is no consumer-facing login page.
- Do not use dark backgrounds (`#0f172a`, `#111827`, etc.) in any Workspace page or component.
- Do not use `ProductCard` inside Workspace pages — use `TechCard`.
- Do not fetch from Supabase directly in page components — use `useProducts` / `useProduct`.

## Active Development
- **Branch**: `feature/product-ui-refinement`
- **Focus**: Harmonizing Product Cards and Product Detail Pages across all stores. Implementing premium clinical design system (sharp borders, precise spacing, typography hierarchy).

