# Coffee Home Blend — Backend API

Node.js + Express + SQLite API serving the Coffee Home Blend storefront.

## Quick start (local)

```bash
cd backend
npm install
npm run convert-data   # generate data/*.json from src/data/*.ts
npm run seed           # populate SQLite with products/categories + demo users
npm run dev            # http://localhost:4000
```

## Demo accounts

| Role     | Email                  | Password   |
| -------- | ---------------------- | ---------- |
| Admin    | admin@coffeehome.vn    | admin123   |
| Customer | demo@coffeehome.vn     | demo1234   |

## Endpoints

- `GET  /api/health` — health check
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — sign in, returns JWT
- `GET  /api/auth/me` — current user (Bearer token)
- `GET  /api/categories` — list all categories
- `GET  /api/categories/:slug` — get one category
- `GET  /api/products` — list products (filters: `search`, `category`, `minPrice`, `maxPrice`, `featured`, `sortBy`, `page`, `limit`)
- `GET  /api/products/featured` — featured products
- `GET  /api/products/new-arrivals` — new products
- `GET  /api/products/best-sellers` — best sellers
- `GET  /api/products/:slug` — product detail
- `GET  /api/products/:id/reviews` — list reviews
- `POST /api/products/:id/reviews` — add review
- `POST /api/orders` — place order (requires auth)
- `GET  /api/orders` — my orders (requires auth)
- `GET  /api/orders/:id` — order detail (requires auth)

## Deploy

`render.yaml` at repo root defines two services:
1. `coffee-home-blend-api` — this backend (Node)
2. `coffee-home-blend-frontend` — Vite static site; its `VITE_API_BASE_URL` is wired to the API service URL.
