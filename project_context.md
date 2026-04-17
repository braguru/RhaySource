# Premium Skincare Application - Project Context

## Overview
This repository contains a high-end, frontend-only web application heavily focused on a beautiful, luxury landing page for premium skincare products. As a secondary offering, the application subtly references laptop and electronics products via unobtrusive links or partner blocks. The backend-less architecture prioritizes static JSON data and direct third-party service integration for contact forms.

## Technology Stack
- **Framework:** React 19 via Vite
- **Language:** JavaScript (ESModules)
- **Styling:** Vanilla CSS Custom Properties (`frontend/src/index.css`)
- **Data:** Static JSON files (`frontend/src/data/products.json`)
- **Linting:** ESLint Configuration natively integrated.

## Architecture & Directory Structure
The workspace is split into core folders:
- `/frontend`: The main React/Vite web application.
- `/stitch-designs`: A directory for generated/stored UI designs and tokens.

Inside `/frontend/src`:
- **`components/ui/`**: Universal, atomic UI components (Buttons, Modals, Inputs).
- **`components/layout/`**: Structural components (Navigation, Footers, Hero wrappers).
- **`components/features/`**: Domain-specific complex components (e.g., `ProductCard`, `ContactForm`).
- **`hooks/`**: Shared custom logic (e.g., scroll triggers).
- **`styles/`**: Additional CSS modules or design tokens.
- **`data/`**: Static schema for the application (e.g., Google JSON-LD schema pattern).

## Design & Theme Aesthetic
The application uses strict CSS variables for a structured dark/light mode setup.
- **Primary Aesthetics:** Premium "wow" factor, parallax scrolling, glassmorphism cards, and macro imagery.
- **Color Palette Variables:** Built-in variables (`--text`, `--bg`, `--accent`) handling light and dark (`#16171d`) themes.
- **Typography:** Modern typography stack with system-ui sans and mono fonts, scalable globally.

## Core Workflows
1. **Catalog Browsing:** Users view Bestsellers and Categories driven by the static JSON product schema.
2. **Laptop Referral:** A secondary funnel leading to tech/electronics visually separated from the luxury skincare immersion.
3. **Contacting Retailer:** Secure, environment-variable-backed email integration (e.g., EmailJS).

## Project Requirements Document
Refer to `/requirements.md` in the workspace root for the full initial Product Requirements Document and the expected `products.json` schema.
