# RhaySource Ent. | Premium Skincare Boutique

![RhaySource Ent. Logo](frontend/src/assets/logos/logo-full.png)

## ✨ The Pursuit of Radiant Rituals
RhaySource is a high-end, ultra-modern e-commerce platform dedicated to premium skincare. Designed as a luxury digital boutique, it combines minimalist aesthetics with expert-level functionality to provide a professional, seamless shopping experience for skincare enthusiasts.

---

## 🚀 Core Features

### **1. Boutique Shopping Experience**
- **Premium Left-Sidebar (Desktop):** Industry-standard boutique filtering by Category and Skin Type.
- **Glassmorphism Filter Drawer (Mobile):** A blurred, semi-transparent slide-out panel for effortless mobile selection.
- **"Show Results" Logic:** Intelligent filter application with dynamic product counts before results are displayed.

### **2. Expert Discovery**
- **Predictive Search:** Real-time search overlay with visual result previews for lightning-fast product discovery.
- **Brand Storytelling:** An enriched About page detailing the "Passion for Radiance" behind the RhaySource mission.

### **3. Seamless Checkout**
- **Shopping Bag:** A global, slide-out drawer to manage selections without leaving the page.
- **Direct-to-Vendor Checkout:** Integrated order generation via **WhatsApp** and **Email**, perfect for personalized consultation.
- **Floating Badge:** Real-time item counters on the Bag icon for immediate feedback.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React (Vite)** | Core application framework for modern performance. |
| **Vanilla CSS** | Custom design system with high-end tokens and luxury variables. |
| **React Router v7** | Advanced SPA routing and URL-synchronized filtering. |
| **Framer Motion** | Silky-smooth micro-animations and page transitions. |
| **Vercel** | Optimized hosting and edge-routing. |

---

## 📦 Getting Started

### **Prerequisites**
- Node.js (v18+)
- npm / yarn

### **Installation**
1. **Clone the repository:**
   ```bash
   git clone https://github.com/rhaysource/boutique-frontend.git
   cd rhaysource
   ```

2. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the `frontend/` directory with your brand details:
   ```env
   VITE_BRAND_EMAIL=contact@rhaysource.com
   VITE_BRAND_PHONE=+233xxxxxxxxx
   VITE_BRAND_WHATSAPP=233xxxxxxxxx
   VITE_BRAND_ADDRESS="Accra, Ghana"
   ```

4. **Run Locally:**
   ```bash
   npm run dev
   ```

---

## 🎨 Design Principles
- **Minimalist Luxury:** Focus on white space, premium typography (Inter/Heading fonts), and cohesive organic color palettes.
- **Mobile-First UX:** thumb-friendly interactions, slide-out drawers, and glassmorphism elements.
- **Stability & Performance:** Robust stacking contexts (Z-index management) and optimized React rendering.

---

## 📄 License
© 2026 RhaySource Ent. All rights reserved. Built with passion for radiant skin.
