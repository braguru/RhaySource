# RhaySource Ent. — Dual Ecosystem Project Context

## Overview
RhaySource is a high-end, dual-category e-commerce experience showcasing two distinct professional worlds: **Premium Skincare** (clinical luxury) and **Workspace** (high-performance technical workstations). The platform utilizes a unified architecture to deliver expert-vetted solutions across both lifestyle and technical frontiers.

## Ecosystem Architecture
The platform is split into two specialized sub-sites, each with its own visual identity and interaction model:

### 1. Premium Skincare ("The Ritual")
- **Aesthetic:** Minimalist Modern Luxury. High-key light themes, glassmorphism, and "Outfit" typography.
- **Goal:** Curated clinical skin health solutions.
- **Workflow:** Top-down categories with a sliding "Bag" for order fulfillment.

### 2. Workspace ("The Master Ecosystem")
- **Aesthetic:** Industrial-Luxury. Deep Carbon (#0c0d12), Electric Blue highlights, and dark-industrial imagery.
- **Goal:** High-fidelity workstations for creators, executives, and enterprise teams.
- **Workflow:** Multi-page experience with a dedicated Cinematic Landing Page and a Technical Shop featuring advanced vertical sidebar filtering.

## Technology Stack
- **Framework:** React 19 via Vite
- **Language:** JavaScript (ESModules)
- **Styling:** Vanilla CSS with scoped design tokens for each ecosystem (`ShopPage.css`, `WorkspacePage.css`, `WorkspaceHome.css`).
- **State Management:** Dual React Context API implementation:
    - `CartContext`: Manages skincare inventory and bag state.
    - `TechCartContext`: Manages workstation configurations and technical hardware state.
    - Both synchronize with `localStorage` for cross-session persistence.
- **Data Models:**
    - `src/data/products.json`: Curated skincare catalog (50+ items).
    - `src/data/tech-products.json`: Specification-heavy workstation database.

## Directory Structure
- `/frontend`: Main React application.
- `/frontend/src/components/features`: Domain-specific components like `CartDrawer`, `WorkspaceCartDrawer`, `ContactForm`, and `ProductGrid`.
- `/frontend/src/components/layout`: Structural components like the context-aware `Navbar` (toggles themes/logos/links based on route) and `Footer`.
- `/frontend/src/pages`: 
    - **Skincare:** `HomePage`, `ShopPage`, `ProductDetailPage`.
    - **Workspace:** `WorkspacePage` (Landing), `WorkspaceShopPage` (Technical Collection), `WorkspaceAboutPage`.

## Core Features
1. **Contextual Navigation:** The Navbar dynamically adjusts its logo (Standard vs Workspace-Tech), color scheme, and links based on the user's current ecosystem.
2. **Technical Discovery:** The Workspace shop features a vertical sidebar with dynamic product counts for Categories and Brands, allowing for specification-focused browsing.
3. **Integrated Search:** A unified search overlay that prioritizes context (searching workstations in Workspace, rituals in Skincare) but provides cross-linkage between sectors.
4. **Order Fulfillment:** Secure, direct-to-vendor ordering via WhatsApp/Email integration, generating summarized manifests for both hardware and skincare carts.

## Design Identifiers
- **Skincare Tokens:** Creamy whites, soft gold accents, high-transparency glass.
- **Workspace Tokens:** Charcoal/Carbon backgrounds, #38bdf8 (Electric Blue) highlights, vibrant purple-blue gradients.
- **Common Ground:** Smooth Framer Motion transitions, responsive "mobile-first" drawer systems, and premium "Outfit/Inter" typography.

## Environment Configuration
- `VITE_WHATSAPP_NUMBER`: Contact for order fulfillment.
- `VITE_CONTACT_EMAIL`: Support and consultation email.
