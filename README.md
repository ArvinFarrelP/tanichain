# TaniChain

**Transparent Agricultural Payment Network powered by Stellar.**

TaniChain is a blockchain-powered agricultural payment platform built for the APAC Stellar Hackathon 2026. It replaces delayed, manually-verified farmer payments with transparent payment commitments and escrow-style settlement recorded on the Stellar Testnet.

> **Build status:** This is the final release (Phase 4 complete). See [`docs/PROGRESS.md`](./docs/PROGRESS.md) for the full phase-by-phase build log and exactly how each phase was verified, [`docs/API.md`](./docs/API.md) for the endpoint reference, [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for deployment instructions, and [`docs/SECURITY.md`](./docs/SECURITY.md) for the security review.

## Architecture

```
Browser
  │
  ▼
Nginx (:80) ──────────────┬──────────────┐
  │                       │              │
  ▼                       ▼              │
Next.js Frontend (:3000)  Express API (:4000)
                              │
                              ▼
                        PostgreSQL (:5432)
                              │
                              ▼
                     Stellar Horizon (Testnet)
```

- **Frontend:** Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn-style UI primitives, Framer Motion-ready, React Hook Form + Zod, Zustand, Axios.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT auth, bcrypt, Helmet, Morgan, rate limiting, Swagger/OpenAPI docs.
- **Blockchain:** `@stellar/stellar-sdk` against Stellar Testnet Horizon, with Friendbot auto-funding for every new wallet.
- **Deployment:** Docker, Docker Compose, Nginx reverse proxy, container healthchecks.

## Features implemented (Phases 1, 2 & 3 — complete)

**Phase 1 — Foundation**
- User registration & login (JWT, bcrypt password hashing, role-based: `FARMER` / `BUYER` / `COOPERATIVE` / `ADMIN`)
- Automatic Stellar wallet creation + Friendbot funding on registration
- Encrypted-at-rest Stellar secret keys (AES-256-GCM)
- Swagger API docs at `/api/docs`
- Security middleware: Helmet, CORS, rate limiting, Zod validation, centralized error handling
- Full Docker Compose stack: Postgres + backend + frontend + Nginx, with healthchecks

**Phase 2 — Marketplace & Payments**
- Farmer product CRUD (create/edit/delete, with archive-instead-of-delete when a product already has orders)
- Buyer marketplace: browse (search + pagination + category filter), product detail, purchase flow
- **Payment Commitment workflow**, backed by real Stellar Testnet transactions (commit → escrow lock → deliver → confirm → escrow release)
- Escrow simulation via a dedicated, Friendbot-funded `EscrowWallet` platform account
- Transaction history with search and pagination
- Blockchain explorer links (Stellar Expert) on every transaction
- Notifications on payment commit, delivery, and release

**Phase 3 — Dashboards, Documents & Admin**
- **Admin dashboard**: platform overview, user management (role/active toggle), platform-wide product/order/transaction/wallet tables
- **Analytics with charts**: role-aware revenue/pending/completed/wallet-balance summary and a 6-month revenue line chart on the main dashboard; platform-wide overview + order-status bar chart in the admin section (recharts)
- **QR payment generation**: Stellar `web+stellar:pay` URIs rendered as QR codes for wallet receiving and order payment info
- **PDF invoice generation**: downloadable, formatted invoice per order (farmer/buyer details, line item, payment status, transaction hashes)
- **CSV export**: personal transaction history, plus admin-wide users/products/orders/transactions exports
- **Advanced search & filters**: category filter on the marketplace, status filters on orders and transactions (personal and admin views)
- **User profile management**: edit name/phone, change password
- **Blockchain transaction explorer integration**: dedicated transaction history page with search, filter, export, and Stellar Expert links
- **Activity logs**: audit trail of key actions (registration, login, product/order/payment events), with self-service and admin-wide views
- **Responsive UI improvements**: mobile navigation menu, horizontally-scrollable data tables, responsive layouts throughout

**Phase 4 — Production Polish & Hackathon Readiness**
- Demo seed script (`npm run seed`) creating realistic accounts, products, and orders across every payment state, using real Stellar Testnet transactions
- Loading skeletons and empty states across all list views, replacing bare loading text
- Dedicated 404 and error boundary pages, styled consistently with the app
- Accessibility pass: `aria-label` on every icon-only button, proper `aria-expanded` on the mobile menu
- Database indexes on all frequently-filtered columns
- Docker images switched to `npm ci`, non-root users, and healthcheck-gated startup ordering
- Full security review (`docs/SECURITY.md`) and deployment guide (`docs/DEPLOYMENT.md`)
- Full project audit: every route file cross-checked against its mount point, every frontend page directory checked for a real `page.tsx`, and six stray empty directories (leftover from earlier shell brace-expansion mishaps) found and removed

See `docs/PROGRESS.md` for the full phase-by-phase build log, including how each phase was verified.

## Installation

### Prerequisites
- Docker and Docker Compose

### Run with Docker (recommended)

```bash
cp .env.example .env
# edit .env and set real values for JWT_SECRET and WALLET_ENCRYPTION_KEY

docker compose up --build
```

- Frontend: http://localhost:3000 (also served via Nginx at http://localhost)
- Backend API: http://localhost:4000
- Swagger docs: http://localhost:4000/api/docs
- Nginx (unified entrypoint): http://localhost

### Load demo data (optional but recommended for a demo)

```bash
docker compose exec backend npm run seed
```

Creates demo farmers, buyers, an admin, products, and orders spanning every payment state, with real Stellar Testnet wallets and transactions. See `docs/DEPLOYMENT.md` for the demo account credentials.

### Local development (without Docker)

**Backend**
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

**Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Environment Variables

See `.env.example` (root, for Docker Compose) and `backend/.env.example` / `frontend/.env.example` (for local development) for the full list, including:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `WALLET_ENCRYPTION_KEY` | Passphrase used to encrypt Stellar secret keys at rest |
| `STELLAR_NETWORK` | `TESTNET` (only Testnet is used in this project) |
| `STELLAR_HORIZON_URL` | Stellar Horizon endpoint |
| `STELLAR_FRIENDBOT_URL` | Friendbot funding endpoint |
| `NEXT_PUBLIC_API_URL` | Base URL the frontend uses to reach the backend API |

## API Documentation

Interactive Swagger docs (try-it-out, full schemas) are served at `/api/docs` once the backend is running - `http://localhost:4000/api/docs`. See `docs/API.md` for a quick-scan endpoint summary.

## Folder Structure

```
tanichain/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── config/         # env, database client
│   │   ├── middleware/      # auth, validation, rate limiting, error handling
│   │   ├── modules/
│   │   │   ├── auth/        # register, login, profile
│   │   │   ├── user/        # profile update, change password
│   │   │   ├── wallet/      # Stellar keypair, Friendbot, wallet service, QR codes
│   │   │   ├── escrow/      # platform escrow wallet
│   │   │   ├── product/     # farmer CRUD, buyer browsing
│   │   │   ├── order/       # order lifecycle
│   │   │   ├── payment/     # Payment Commitment + Escrow workflow
│   │   │   ├── transaction/ # transaction history, CSV export
│   │   │   ├── invoice/     # PDF invoice generation
│   │   │   ├── export/      # CSV export helpers
│   │   │   ├── notification/
│   │   │   ├── analytics/   # role-aware + platform-wide analytics
│   │   │   ├── activity/    # audit log
│   │   │   └── admin/       # admin-only management endpoints
│   │   ├── utils/           # jwt, crypto, logger, AppError
│   │   └── swagger/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (landing, /login, /register)
│   │   │   ├── products/, products/[id]/       # marketplace
│   │   │   └── dashboard/
│   │   │       ├── products/, orders/          # farmer/buyer workflows
│   │   │       ├── transactions/, profile/
│   │   │       └── admin/                      # overview, users, products, orders, transactions, wallets, activity
│   │   ├── components/ui/   # shadcn-style primitives
│   │   ├── components/layout/  # DashboardHeader, AdminNav
│   │   ├── components/products/ # ProductForm
│   │   ├── lib/             # api client, formatting, utils
│   │   └── store/           # zustand auth store
│   └── Dockerfile
├── docker/nginx/
├── docs/
├── docker-compose.yml
└── .env.example
```

## Documentation

| Doc | Contents |
|---|---|
| [`docs/PROGRESS.md`](./docs/PROGRESS.md) | Full phase-by-phase build log and verification record |
| [`docs/API.md`](./docs/API.md) | Endpoint reference (complements the interactive Swagger docs) |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Local Docker deployment, environment variables, scaling notes, troubleshooting |
| [`docs/SECURITY.md`](./docs/SECURITY.md) | Security measures and honestly-disclosed limitations |

## Hackathon Description

**Event:** APAC Stellar Hackathon 2026
**Track:** Real-world payments / financial inclusion
**Problem:** Smallholder farmers face delayed payments and no transparent transaction history.
**Solution:** TaniChain gives every transaction a Stellar Testnet-recorded payment commitment and escrow-style settlement, verifiable by anyone on Stellar Expert - turning a manual, trust-based process into a transparent, auditable one, without requiring farmers or buyers to understand blockchain technology themselves.

## Screenshots

_Add screenshots here before submission — placeholders reserved for: landing page, dashboard, payment commitment flow, blockchain explorer view, admin analytics._
