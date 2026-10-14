# Coffee Home Blend

> A modern e-commerce storefront for a small-batch coffee roaster — built with React, TypeScript, Vite, and Tailwind CSS.

[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](#)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#)
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)](https://www.typescriptlang.org/)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Docker](#docker)
- [Project Structure](#project-structure)
- [Git Workflow](#git-workflow)
- [CI/CD](#cicd)
- [Deployment](#deployment)
- [Backend Integration](#backend-integration)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

### Customer

- 🏠 **Home page** with featured products, brand story, and category highlights
- 🛍️ **Product catalog** with filtering, sorting, and search
- ☕ **Product detail pages** with image gallery, brewing guides, and reviews
- 🛒 **Persistent cart** with quantity management, coupon support, and saved items
- ❤️ **Wishlist** to save products for later
- 👤 **Authentication** (login, register, forgot/reset password)
- 📦 **Order history** with order detail and tracking timeline
- ⭐ **Reviews & ratings** for purchased products
- 💳 **Checkout flow** with shipping address and payment method
- 🎉 **Order success** confirmation with next steps
- 🌗 **Light / dark / system theme** with persistent preference
- 📱 **Fully responsive** mobile-first design
- ♿ **Accessibility** — keyboard navigation, focus rings, ARIA labels

### Admin

- 📊 **Dashboard** with KPIs and recent activity
- 📦 **Product management** (CRUD)
- 🗂️ **Category management**
- 🧾 **Order management** with status updates
- 👥 **Customer directory**
- 🎟️ **Coupon management**
- 💬 **Review moderation**
- 📈 **Analytics** with charts (Recharts)
- ⚙️ **Store settings**

---

## Tech Stack

| Layer            | Choice                                              |
| ---------------- | --------------------------------------------------- |
| Framework        | React 18                                            |
| Language         | TypeScript (strict mode)                            |
| Build tool       | Vite 5                                              |
| Styling          | Tailwind CSS 3 + custom CSS variables               |
| Routing          | React Router 6                                      |
| State management | Zustand (with `persist` middleware)                 |
| Server state     | TanStack Query 5                                    |
| Forms            | React Hook Form + Zod                               |
| HTTP client      | Axios                                               |
| Icons            | Lucide React                                        |
| Animations       | Framer Motion                                       |
| Charts           | Recharts                                            |
| Testing          | Vitest + Testing Library + Playwright               |
| Linting          | ESLint + Prettier                                   |
| Git hooks        | Husky + lint-staged                                 |
| Deployment       | Docker + nginx + GitHub Actions → GHCR              |

---

## Screenshots

> Add screenshots here as the UI stabilizes.

| Home                                | Products                                  |
| ----------------------------------- | ----------------------------------------- |
| ![home](./docs/screenshots/home.png) | ![products](./docs/screenshots/products.png) |

| Product detail                      | Cart                                       |
| ----------------------------------- | ------------------------------------------ |
| ![detail](./docs/screenshots/detail.png) | ![cart](./docs/screenshots/cart.png) |

| Admin dashboard                          | Dark mode                            |
| ---------------------------------------- | ------------------------------------ |
| ![admin](./docs/screenshots/admin.png)   | ![dark](./docs/screenshots/dark.png) |

---

## Getting Started

### Prerequisites

- **Node.js 20+** (see `.nvmrc` if present)
- **npm 10+** (bundled with Node 20)
- Optional: **Docker** for containerized dev/prod

### Install

```bash
git clone https://github.com/<your-org>/coffee-home-blend.git
cd coffee-home-blend
cp .env.example .env
npm ci
```

### Run the dev server

```bash
npm run dev
```

The app will be available at <http://localhost:5173>.

---

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

| Variable               | Description                          | Default                       |
| ---------------------- | ------------------------------------ | ----------------------------- |
| `VITE_APP_NAME`        | Display name                         | `Coffee Home Blend`           |
| `VITE_APP_ENV`         | Environment                          | `development`                 |
| `VITE_API_BASE_URL`    | Backend API base URL                 | `http://localhost:5000/api`   |
| `VITE_ENABLE_ANALYTICS`| Enable analytics                     | `false`                       |
| `VITE_ENABLE_PWA`      | Enable PWA features                  | `false`                       |
| `VITE_GA_ID`           | Google Analytics ID (optional)       | —                             |
| `VITE_SENTRY_DSN`      | Sentry DSN for error tracking        | —                             |

---

## Available Scripts

```bash
npm run dev            # Start Vite dev server
npm run build          # Type-check and build for production
npm run preview        # Preview the production build locally
npm run lint           # Run ESLint
npm run lint:fix       # Auto-fix lint errors
npm run type-check     # TypeScript --noEmit
npm run format         # Prettier write
npm run format:check   # Prettier check
npm run test           # Vitest (single run)
npm run test:watch     # Vitest in watch mode
npm run test:coverage  # Vitest with v8 coverage
npm run test:e2e       # Playwright end-to-end tests
```

---

## Docker

### Build the image

```bash
docker build -t coffee-home-blend:latest .
```

### Run the container

```bash
docker run --rm -d \
  --name coffee-home-blend \
  -p 8080:80 \
  coffee-home-blend:latest
```

Visit <http://localhost:8080>. The container exposes a `/healthz` endpoint for orchestrators.

### docker-compose

```bash
docker compose up -d --build
docker compose logs -f
docker compose down
```

---

## Project Structure

```
coffee-home-blend/
├── .github/
│   └── workflows/          # CI, Docker, CD pipelines
├── .husky/                 # Git hooks
├── nginx/
│   └── nginx.conf          # Production nginx config
├── public/
│   └── coffee-favicon.svg
├── src/
│   ├── assets/             # Static in-source assets
│   ├── components/
│   │   ├── admin/          # Admin UI (sidebar, topbar)
│   │   ├── cart/           # CartItem, CartDrawer, CouponInput
│   │   ├── checkout/       # AddressForm, PaymentMethod, ShippingMethod
│   │   ├── common/         # ToastContainer
│   │   ├── contexts/       # CartContext (legacy)
│   │   ├── layout/         # Header, Footer
│   │   ├── orders/         # OrderCard, OrderTimeline, OrderStatusBadge
│   │   ├── product/        # ProductCard, ProductCardSkeleton
│   │   ├── providers/      # ThemeProvider
│   │   ├── review/         # Review components
│   │   └── ui/             # Button, Input, Spinner, Modal, Card, ...
│   ├── data/               # Static seed data (products, categories)
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # MainLayout, AuthLayout, AdminLayout
│   ├── pages/              # Route-level components
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── category/
│   │   ├── checkout/
│   │   ├── home/
│   │   ├── orders/
│   │   ├── product-detail/
│   │   ├── products/
│   │   ├── profile/
│   │   ├── search/
│   │   ├── wishlist/
│   │   └── NotFoundPage.tsx
│   ├── routes/             # AppRoutes, ProtectedRoute, AdminRoute
│   ├── services/           # API services (productService, checkoutService)
│   ├── stores/             # Zustand stores (cart, auth, theme)
│   ├── test/               # Test utilities
│   ├── types/              # Shared TypeScript types
│   ├── utils/              # cn(), schemas
│   ├── App.tsx
│   ├── index.css           # Tailwind + theme tokens + animations
│   └── main.tsx
├── tests/                  # E2E tests (Playwright)
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Git Workflow

This project uses [Conventional Commits](https://www.conventionalcommits.org/) and trunk-based development.

### Branch naming

```
feature/<scope>-<short-description>
bugfix/<scope>-<short-description>
chore/<short-description>
hotfix/<short-description>
release/<version>
```

### Commit format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Examples**

```bash
git commit -m "feat(cart): add coupon code support"
git commit -m "fix(checkout): prevent double-submit on payment"
git commit -m "docs(readme): document backend integration steps"
```

### Hooks

Husky runs `lint-staged` (ESLint + Prettier) on staged files before each commit. A `commit-msg` hook can validate the conventional-commit format — wire it up via `@commitlint/cli`.

---

## CI/CD

The repo ships with three GitHub Actions workflows in `.github/workflows/`:

| Workflow    | Triggers                                    | What it does                                                  |
| ----------- | ------------------------------------------- | ------------------------------------------------------------- |
| `ci.yml`    | PR + push to `main` / `develop`             | Lint, type-check, format check, test, build artifacts         |
| `docker.yml`| PR + push to `main` / `develop`             | Multi-stage Docker build, runtime health check                |
| `cd.yml`    | Push to `main`, tags `v*`, releases, manual | Push image to GHCR, optional deploy (placeholders included)   |

### Required secrets for CD

- `GITHUB_TOKEN` — provided automatically by GitHub for GHCR pushes
- `DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN` — for Docker Hub publishing (optional)
- `VPS_HOST` / `VPS_USER` / `VPS_SSH_KEY` — for VPS deployment (optional)
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` — for ECS (optional)
- `RENDER_DEPLOY_HOOK` — for Render (optional)
- `RAILWAY_TOKEN` / `RAILWAY_SERVICE_ID` — for Railway (optional)

Uncomment the matching step in `cd.yml` after wiring up the corresponding secret.

---

## Deployment

### Production checklist

- [ ] `VITE_API_BASE_URL` points to the production backend
- [ ] `VITE_APP_ENV=production`
- [ ] All required secrets are set in GitHub
- [ ] nginx config matches your domain / TLS strategy
- [ ] Container registry has the latest image
- [ ] Health check endpoint is reachable (`/healthz`)

### Quick deploy to any Docker host

```bash
docker run -d \
  --name coffee-home-blend \
  --restart unless-stopped \
  -p 80:80 \
  ghcr.io/<your-org>/coffee-home-blend:latest
```

For HTTPS, place the container behind a TLS-terminating reverse proxy (Caddy, Traefik, Cloudflare, or nginx + certbot).

---

## Backend Integration

The frontend currently runs against in-memory seed data (`src/data/`). The following integration points are ready for a backend:

| Concern              | Where to plug in                                       |
| -------------------- | ------------------------------------------------------ |
| Products             | `src/services/productService.ts`                       |
| Auth                 | `src/stores/authStore.ts` (replace local store with API) |
| Cart sync            | Extend `src/stores/cartStore.ts` to call `/cart`       |
| Checkout / orders    | `src/services/checkoutService.ts`                      |
| Search               | Add `searchService.ts` and wire to `SearchPage`        |
| Reviews              | Add `reviewService.ts` and wire to `ReviewsPage`       |

Set `VITE_API_BASE_URL` to the deployed backend URL and ensure CORS allows the storefront origin.

---

## Roadmap

- [ ] Wire all admin pages to real APIs
- [ ] Persist cart to backend for logged-in users
- [ ] Add Stripe / payment provider integration
- [ ] PWA support (service worker, manifest)
- [ ] i18n (English + Vietnamese)
- [ ] Visual regression tests with Playwright + Percy
- [ ] Storybook for component documentation
- [ ] Bundle analyzer in CI

---

## License

MIT © Coffee Home Blend contributors
