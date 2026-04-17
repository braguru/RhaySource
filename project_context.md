# RhaySource Premium Skincare — Project Context

## Overview
RhaySource is a high-end, frontend-only e-commerce experience designed for premium skincare enthusiasts. The platform focuses on a luxury, minimalist aesthetic ("Minimalist Modern Luxury") with a clinical touch. It features a fully functional "Bag" (Cart) system that enables users to curate products and contact the vendor directly via WhatsApp or Email to finalize orders.

## Technology Stack
- **Framework:** React 19 via Vite
- **Language:** JavaScript (ESModules)
- **Styling:** Vanilla CSS with a centralized Design Token system (`src/styles/global.css`)
- **State Management:** React Context API (`CartContext`) with `localStorage` persistence
- **Data:** Static JSON-based database (`src/data/products.json`)
- **Assets:** Optimized product imagery located in `public/assets/products/`

## Architecture & Directory Structure
- `/frontend`: The main React/Vite web application.
- `/frontend/src/components/features`: Domain-specific components like `CartDrawer`, `ProductCard`, and `HeroSection`.
- `/frontend/src/components/layout`: Structural components like `Navbar` (with integrated search) and `Footer`.
- `/frontend/src/context`: Global state management for shopping basket logic.
- `/frontend/src/pages`: Direct routing pages for Home, Shop, and Product Details.
- `/frontend/src/utils`: Helper functions for slugs and data manipulation.

## Core Features & Workflows
1. **Catalog Expansion:** The platform hosts a curated database of 50+ premium products from global brands (CeraVe, Beauty of Joseon, SKIN1004, etc.).
2. **Localized Experience:** Pricing is standardized in **GH₵ (Ghana Cedis)** with a layout optimized for both desktop and mobile readability.
3. **Cart & Order Flow:** 
   - Users add items to a persistent "Bag".
   - A slide-out `CartDrawer` allows quantity adjustments and order review.
   - Ordering is handled via a generated WhatsApp message or pre-filled Email, containing a summarized list of items and total estimate.
4. **Intelligent Discovery:** Features a live search overlay that indexes the entire product database and dynamic filtering by category (Serums, Sunscreens, Body Care, etc.).

## Environment Configuration
The project relies on `.env` variables for vendor contact details:
- `VITE_WHATSAPP_NUMBER`: The primary contact for order fulfillment.
- `VITE_CONTACT_EMAIL`: The support email address.

## Design Identity
- **Aesthetic:** High-contrast minimalist design using "Outfit" for headings and "Inter" for body text.
- **Visuals:** Uses glassmorphism (90% opacity), smooth Framer Motion animations, and a consistent golden-yellow and deep-blue brand palette.
- **Responsiveness:** Mobile-first approach with custom body-scroll locking for overlays and drawers.
