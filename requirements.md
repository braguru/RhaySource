# Product Requirements Document: Premium Skincare Application
**Project Name:** [To Be Determined]
**Primary Focus:** Premium Skincare 
**Secondary Focus:** Laptop Product Referrals
**Architecture:** Static Frontend-only (No Backend)

---

## 1. Project Overview
This project is a high-end, frontend-only web application heavily focused on a beautiful, catchy landing page for premium skincare products. The skincare catalog will be the undeniable focal point of the application, utilizing rich aesthetics, dynamic scrolling animations, and a luxurious design framework. 

As a secondary offering, the application will subtly reference laptop and electronics products, directing interested users to a separate section or an external linked site. The application will also feature a secure contact mechanism using environment variables.

## 2. Design Strategy & Inspiration
*   **Primary Aesthetic (Skincare):** The design should prioritize a "wow" factor. We will use a premium color palette (e.g., Soft creams, muted sage greens, and deep slate contrasting text). 
*   **Micro-Animations & Rich Aesthetics:** 
    *   Smooth, parallax scrolling effects for product reveals.
    *   High-quality imagery with subtle hover animations (e.g., glassmorphism cards that softly glow on hover).
    *   Modern, elegant typography (like Playfair Display for headings and Inter for body text) to evoke high-end beauty brands.
*   **Handling the Laptops:** The laptop products will not clutter the main skincare navigation. Instead, they will exist as a tasteful "Partner Products" or "Tech Essentials" banner/link in the footer or a secondary menu, acting as a clean bridge to the secondary catalog without breaking the luxury skincare immersion.

## 3. Functional Requirements

### 3.1. Core Pages & Structure
1.  **High-Impact Skincare Landing Page (Home):**
    *   *Hero Section:* Full-bleed premium image/video with a strong call to action.
    *   *Bestsellers Section:* Carousel or animated grid showcasing top skincare categories (Cleansers, Serums, Moisturizers).
    *   *About the Brand:* A visually rich section detailing the ingredients and ethos of the skincare line.
2.  **Skincare Product Details (Modal or PDP):** High-quality image gallery, detailed ingredient lists, and usage recommendations.
3.  **Laptop Referral Section:** A dedicated block or navigation link that clearly indicates it leads to tech/laptop offerings (external site or sub-page).
4.  **Contact/Retailer Section:** A dedicated form for inquiries.

### 3.2. Technical Specifications & Expert Project Structure
To ensure maximum scalability, maintainability, and clean code, the application will mandate an expert-level **React via Vite** setup using a strict, component-driven architecture.

*   **Atomic & Modular Directory Structure:** The `src` directory will be aggressively organized to maximize code reuse across the entire application:
    *   `/components/ui`: Universal, highly reusable atomic UI elements (Buttons, Inputs, Modals, Typography).
    *   `/components/layout`: Structural wrapper components (Navbar, Footer, Hero Sections, Section Containers).
    *   `/components/features`: Complex domain-specific components (e.g., `ProductCard`, `ContactForm`).
    *   `/hooks`: Custom React hooks to isolate shared logic (e.g., `useScrollTrigger`, `useContactAction`).
    *   `/utils`: Pure helper functions to handle formatting and data parsing.
    *   `/styles`: Global CSS variables, design system tokens, and utility classes.
*   **Data Management:** All skincare products and categories will be stored in static JSON files (`/data/products.json`), parsed and passed down through reusable data hook abstractions.
*   **Environment Variables & Security:** Important keys for backend-less emailing will be secured in a `.env` file to prevent client-side scraping.

### 3.3. Contact Form (Backend-less Solution)
*   **Emailing Service:** Integration of EmailJS or Formspree to trigger emails to the owner/retailer directly from the frontend.
*   **Security:** API keys and destination emails injected via environment variables (`VITE_SERVICE_ID`).

## 4. Deep-Dive: UI Components & Pages
Based on luxury e-commerce UX best practices, the application will feature the following distinct pages and specific, reusable React components:

### 4.1. Core Pages
*   **The Landing Page (Home):** The digital storefront. Must be visually arresting, fast-loading, and rely more on imagery than dense text.
*   **The Routine Builder / Shop By Concern:** A page or modal where users select their skin type (Dry, Oily, Sensitive) and receive pre-filtered product recommendations rather than forcing them to browse the entire catalog.
*   **The Ingredient Glossary (About Us):** Luxury brands build trust through transparency. A page detailing the "Why" and "How" of the active ingredients used.
*   **The Check-Out / Cart Drawer:** A slide-out cart (Off-canvas drawer) that keeps the user on the page while summarizing their order, to reduce checkout friction.

### 4.2. Recommended Reusable Components (`/components/features`)
1.  **`<HeroVideoBanner />`:** A full-bleed component with a muted, auto-playing lifestyle video background and a soft glassmorphism overlay for the call-to-action button.
2.  **`<ProductCarousel />`:** A horizontal scrollable area with hidden scrollbars for mobile, utilizing snap-scrolling to browse the "Daily Essentials" or "Bestsellers".
3.  **`<TextureRevealCard />`:** A specialized product card. When hovered, the image cross-fades from the outer packaging to a macro-shot of the product's actual texture (e.g., a smear of the cream).
4.  **`<IngredientSpotlight />`:** A dual-column layout where half is an elegant image of a raw ingredient (like Aloe or Rosehip) and the other half explains its scientific benefits.
5.  **`<BeforeAndAfterSlider />`:** An interactive split-image component where the user drags a vertical bar left/right to see the visual results of the skincare routine.

## 5. Deep-Dive: Data Model (JSON Schema)
To ensure the static frontend is robust and SEO-ready, the products will be managed via a highly structured JSON file (`/data/products.json`). This structure mimics the industry-standard Google JSON-LD schema to allow for future SEO-rich results.

```json
{
  "products": [
    {
      "id": "SKIN-1001",
      "name": "Luminous Hydration Serum",
      "category": "Serums",
      "skinType": ["Dry", "Sensitive"],
      "price": 45.00,
      "images": {
        "primary": "/assets/serum-main.jpg",
        "texture": "/assets/serum-texture.jpg"
      },
      "description": "A lightweight, fragrance-free serum powered by encapsulated hyaluronic acid.",
      "keyIngredients": ["Hyaluronic Acid", "Vitamin E", "Ceramides"],
      "usageInstructions": "Apply 2-3 drops to damp skin morning and night.",
      "badges": ["Vegan", "Cruelty-Free"]
    }
  ]
}
```

## 6. Next Steps for Implementation
1.  **Initialize Architecture:** Spin up the React/Vite project utilizing the Atomic design directory structure outlined above.
2.  **Design System Tokenization:** Establish the CSS variables tailored for the premium aesthetic (e.g., playfair fonts, soft cream and slate color hexes).
3.  **Build Core Atomics:** Create the reusable UI elements (Buttons, Typography, Cards).
4.  **Develop Data Pipeline:** Stub out the full `products.json` file based on the Deep-Dive data schema.
5.  **Assemble Landing Page:** Combine the components into the high-impact Hero, Carousel, and Bestseller grids.
