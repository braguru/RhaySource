# RhaySource Ent. — Dual Ecosystem Project Context

## Overview
RhaySource is a high-end, dual-category e-commerce experience showcasing two distinct professional worlds: **Premium Skincare** (clinical luxury) and **Workspace** (high-performance technical workstations). The platform utilizes a unified architecture to deliver expert-vetted solutions across both lifestyle and technical frontiers.

## Ecosystem Architecture
The platform is split into two specialized sub-sites, each with its own visual identity and interaction model:

### 1. Premium Skincare ("The Ritual")
- **Aesthetic:** Minimalist Modern Luxury. High-key light themes, glassmorphism, and "Outfit" typography.
- **Workflow:** Top-down categories with a sliding "Bag" for order fulfillment.
- **Branding:** White & Gold (#eab308) accentuation.

### 2. Workspace ("The Master Ecosystem")
- **Aesthetic:** Industrial-Luxury. Deep Carbon (#0c0d12), Electric Blue (#38bdf8) highlights, and dark-industrial imagery.
- **Workflow:** Technical Shop featuring advanced vertical sidebar filtering.
- **Branding:** Grayscale/Silver technical theme using high-fidelity logos with CSS filters (grayscale, brightness, contrast).

## Technology Stack
- **Frontend Framework:** React 19 via Vite.
- **Backend Services:** Node.js server for order handling and communications.
- **Mailing Engine:** `nodemailer` with CID-embedded attachment strategies for reliable logo rendering.
- **State Management:** Dual React Context API (`CartContext` and `TechCartContext`).
- **Styling:** Vanilla CSS with scoped design tokens and scoped components (e.g., `WorkspaceCartDrawer`, `Navbar.css`).

## Directory Structure
- `/frontend/src`: Main React application logic.
- `/frontend/server`: Node.js services including:
    - `/services/mailer.js`: SMTP transaction handler using CID embedding.
    - `/templates`: Ecosystem-specific HTML email templates (Skincare vs. Workspace).
- `/frontend/src/assets/logos`: High-fidelity brand assets used across both web and email.
- `/frontend/src/data`: JSON-based product catalogs for both technical hardware and skincare.

## Core Features
1. **Modernized Navigation**: A context-aware Navbar that repositioned "Our Stores" to the right for better user flow. Features a luxury glassmorphism desktop dropdown and brand-accented mobile highlights (no icons, clean pill states).
2. **Transactional Branding**: Automated email system that sends tailored confirmation and enquiry messages. Templates are responsive and use brand-specific color tokens (Carbon/Blue for Workspace, White/Gold for Skincare).
3. **Technical Discovery**: The Workspace shop features a vertical sidebar with dynamic product counts for Categories and Brands, allowing for specification-focused browsing.
4. **Order Fulfillment**: Dual-integrated ordering via WhatsApp and a backend SMTP Mailer, generating summarized hardware and skincare manifests.

## Design Identifiers
- **Skincare Tokens:** Creamy whites, soft gold accents, high-transparency glass.
- **Workspace Tokens:** Charcoal/Carbon backgrounds, #38bdf8 (Electric Blue) highlights.
- **Common Ground:** Smooth Framer Motion transitions, `backdrop-filter: blur(30px)`, and premium "Outfit/Inter" typography.

## Environment Configuration
- `VITE_WHATSAPP_NUMBER`: Direct order fulfillment line.
- `VITE_CONTACT_EMAIL`: Customer support.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`: Secure credentials for the branding mailer.
