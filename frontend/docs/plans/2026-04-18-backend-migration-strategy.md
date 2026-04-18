# RhaySource — Backend Migration & Admin System Strategy
**Date:** 2026-04-18  
**Stack:** Supabase (DB + Auth) · Cloudinary (Images) · Vercel Serverless Functions (API)

---

## 1. What We're Solving

The frontend currently stores all product data in flat JSON files committed to the repo. Adding or editing a product requires a code change and a redeploy. Images are committed to the `assets/` folder. This approach breaks down as the catalog grows and is completely inaccessible to the vendor.

**Goal:** Give the vendor a password-free admin interface where they can add, edit, and delete products — including uploading images — without touching code. All changes go live instantly.

---

## 2. Architecture

```
┌─────────────────────────────────────────────┐
│              Vercel (Frontend)               │
│                                             │
│  React App          Vercel API Routes       │
│  /admin  ────────►  /api/admin/*  ──────►  Supabase
│  /shop   ────────►  Supabase (direct)       │
│                     /api/images  ──────►  Cloudinary
│                     /api/contact ──────►  Gmail SMTP
└─────────────────────────────────────────────┘
```

**Read path (public):** React → Supabase JS client directly (Row Level Security allows public SELECT)  
**Write path (admin):** React → Vercel API route (validates session) → Supabase  
**Image uploads:** React → `/api/images/sign` (gets Cloudinary signature) → Cloudinary directly  
**Auth:** Supabase email OTP — vendor enters email, receives a 6-digit code, no password needed

---

## 3. Database Schema (Supabase / Postgres)

### `stores` table
| column | type | notes |
|---|---|---|
| id | uuid PK | auto |
| slug | text unique | `skincare`, `workspace`, `home-living` |
| name | text | display name |
| label | text | subtitle shown in navbar |
| accent_color | text | hex color |
| created_at | timestamptz | auto |

### `products` table
| column | type | notes |
|---|---|---|
| id | uuid PK | replaces `TECH-001` string IDs |
| store_id | uuid FK → stores | which store this belongs to |
| name | text | |
| brand | text | |
| category | text | e.g. `Bathroom & Cleaning` |
| price | numeric | in GH₵ |
| description | text | |
| specs | jsonb | flexible key-value pairs per product |
| image_url | text | Cloudinary URL |
| image_public_id | text | Cloudinary public_id (needed for deletion) |
| is_featured | boolean | default false — drives homepage picks |
| sort_order | int | controls display order |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

### `admin_users` table
| column | type | notes |
|---|---|---|
| id | uuid PK | matches Supabase auth.users.id |
| email | text | vendor's email |
| created_at | timestamptz | auto |

**Row Level Security policies:**
- `products`: public SELECT allowed; INSERT/UPDATE/DELETE require authenticated session in `admin_users`
- `stores`: public SELECT allowed; writes require admin
- `admin_users`: no public access

---

## 4. Cloudinary Setup

- **Upload preset:** `rhaysource_products` (signed — signature generated server-side)
- **Folder structure:** `rhaysource/{store_slug}/{product_id}/`
- **Transformations applied on upload:** `w_1200,h_1200,c_fit,f_auto,q_auto`
- **Why signed uploads:** Keeps Cloudinary API secret off the client. The Vercel function at `/api/images/sign` generates a short-lived signature; the browser uploads directly to Cloudinary with it.

---

## 5. Vercel API Routes Needed

| route | method | purpose |
|---|---|---|
| `/api/images/sign` | POST | Generate Cloudinary upload signature |
| `/api/images/delete` | POST | Delete image from Cloudinary by public_id |
| `/api/contact` | POST | Already built — email enquiry (keep as-is) |

Product CRUD goes **direct to Supabase** via the JS client (no API route needed — RLS handles auth).

---

## 6. Admin Interface (React, `/admin`)

A protected route in the existing React app. The vendor never sees a separate URL or app.

### Pages
- `/admin` → redirect to `/admin/login` if not authenticated
- `/admin/login` → email OTP form (enter email → enter 6-digit code)
- `/admin/dashboard` → overview: product count per store, quick links
- `/admin/products` → table of all products with edit/delete actions
- `/admin/products/new` → add product form
- `/admin/products/:id/edit` → edit product form

### Product Form Fields
- Store (dropdown — populated from `stores` table)
- Category (text input or dropdown based on store)
- Name, Brand, Description
- Price (GH₵)
- Specs (dynamic key-value pair builder — add/remove rows)
- Image (drag-and-drop upload → Cloudinary)
- Is Featured (toggle)
- Sort Order (number)

### Auth Flow
1. Vendor goes to `/admin`
2. Enters their email address
3. Supabase sends a 6-digit OTP to that email
4. Vendor enters the code
5. Supabase issues a JWT session stored in localStorage
6. All Supabase client calls automatically include the JWT
7. RLS validates the JWT and confirms the email is in `admin_users`
8. Session persists for 1 hour; vendor is prompted to re-authenticate after

---

## 7. Frontend Migration

The frontend currently reads from JSON files. After migration it reads from Supabase. This is the only breaking change to existing pages.

### Data fetching pattern (before)
```js
import products from '../data/home-products.json';
const { products } = homeProducts;
```

### Data fetching pattern (after)
```js
import { supabase } from '../lib/supabase';
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('store_id', STORE_ID)
  .order('sort_order');
```

A shared `useProducts(storeSlug)` hook will be created so each shop page just calls one hook — no duplication.

### Image URLs
Currently: `/src/assets/home/product.png` (local, committed to repo)  
After: `https://res.cloudinary.com/rhaysource/image/upload/...` (Cloudinary CDN, auto-optimized)

No template changes needed — `product.image_url` replaces `product.images.primary`.

---

## 8. Implementation Phases

### Phase 1 — Infrastructure setup (no code changes yet)
- [ ] Create Supabase project, note URL + anon key + service role key
- [ ] Run schema SQL (stores, products, admin_users tables + RLS policies)
- [ ] Seed `stores` table with the 3 existing stores
- [ ] Create Cloudinary account, create `rhaysource_products` upload preset
- [ ] Add env vars to Vercel: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- [ ] Add vendor email to `admin_users` table

### Phase 2 — API routes
- [ ] `/api/images/sign.js` — Cloudinary signature endpoint
- [ ] `/api/images/delete.js` — Cloudinary deletion endpoint
- [ ] Install `@supabase/supabase-js`, `cloudinary` packages

### Phase 3 — Admin UI
- [ ] `src/lib/supabase.js` — Supabase client singleton
- [ ] `src/context/AuthContext.jsx` — session state, OTP send/verify helpers
- [ ] `src/pages/admin/AdminLogin.jsx` — email + OTP form
- [ ] `src/pages/admin/AdminDashboard.jsx` — overview
- [ ] `src/pages/admin/AdminProducts.jsx` — product list table
- [ ] `src/pages/admin/AdminProductForm.jsx` — create/edit form with image upload
- [ ] `src/components/admin/ProtectedRoute.jsx` — redirects to login if no session
- [ ] Add `/admin/*` routes to `App.jsx` (outside the main layout — no Navbar/Footer)

### Phase 4 — Frontend migration
- [ ] `src/lib/supabase.js` already created in Phase 3 — reuse
- [ ] `src/hooks/useProducts.js` — shared data fetching hook
- [ ] Migrate `HomeLivingShopPage`, `HomeLivingProductDetailPage`, `HomeLivingPage`
- [ ] Migrate `WorkspaceShopPage`, `WorkspaceProductDetailPage`
- [ ] Migrate `ShopPage`, `ProductDetailPage`
- [ ] Delete `src/data/*.json` files once all pages are migrated and verified
- [ ] Upload all existing product images to Cloudinary, update DB records with URLs

### Phase 5 — Data migration
- [ ] Upload all product images to Cloudinary (can use Cloudinary's bulk upload tool)
- [ ] Insert all current JSON product data into Supabase `products` table
- [ ] Verify all product pages render correctly from DB
- [ ] Remove JSON data files from repo

---

## 9. Key Decisions & Constraints

| decision | rationale |
|---|---|
| Direct Supabase reads (no API proxy) | Faster, fewer cold starts, RLS is sufficient for public read security |
| Signed Cloudinary uploads | API secret never reaches the browser |
| Email OTP only (no password) | Vendor doesn't need to manage a password; OTP is simpler and more secure |
| Admin UI inside the same React app | No separate deployment, no CORS headaches, easier to maintain |
| `jsonb` for specs | Each store's products have different spec fields — a flexible column avoids a complex EAV schema |
| Vercel Hobby plan limits | Serverless functions timeout at 10s. Cloudinary signing is fast (<1s). Image upload goes direct browser→Cloudinary, not through the function. |
| Supabase free tier pausing | Projects pause after 7 days of no API calls. An active vendor site won't hit this. If needed, a free cron ping (e.g. via cron-job.org) prevents it. |

---

## 10. Environment Variables Required

```env
# Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Supabase (server-side only — Vercel functions, never exposed to browser)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Cloudinary (server-side only)
CLOUDINARY_CLOUD_NAME=rhaysource
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Already exists
VITE_WHATSAPP_NUMBER=233553664530
VITE_CONTACT_EMAIL=rhaysource@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=rhaysource@gmail.com
SMTP_PASSWORD=...
SMTP_TO=rhaysource@gmail.com
```

`VITE_` prefix = safe to expose in the browser bundle. Everything else is server-only.
