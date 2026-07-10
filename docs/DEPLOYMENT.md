# TaniChain — Deployment Guide

## 1. Local deployment (Docker Compose)

This is the primary, tested deployment path.

```bash
git clone <this repo>
cd tanichain
cp .env.example .env
```

Edit `.env` and set real values for at least:
- `JWT_SECRET` - any long random string (e.g. `openssl rand -hex 32`)
- `WALLET_ENCRYPTION_KEY` - any long random string, different from `JWT_SECRET`
- `POSTGRES_PASSWORD` - change from the default if this will be reachable by anyone but you

Then:

```bash
docker compose up --build
```

First boot will:
1. Start Postgres and wait for its healthcheck.
2. Build and start the backend, which runs `prisma migrate deploy` automatically before starting the server.
3. Build and start the Next.js frontend (standalone output).
4. Start Nginx, proxying `/` to the frontend and `/api` to the backend.

Once healthy:
- App: http://localhost (via Nginx) or http://localhost:3000 (frontend directly)
- API: http://localhost:4000
- Swagger docs: http://localhost:4000/api/docs

### Loading demo data

To populate the database with demo farmers, buyers, products, and orders in various payment states (useful for a hackathon demo):

```bash
docker compose exec backend npm run seed
```

This creates real Stellar Testnet wallets and submits real Horizon transactions for the demo orders, so it takes a little while and requires the backend container to have outbound internet access. It's safe to re-run - it detects existing demo data and skips.

Demo accounts (password `Demo12345!` for all):
| Email | Role |
|---|---|
| `admin@tanichain.demo` | ADMIN |
| `farmer.siti@tanichain.demo` | FARMER |
| `farmer.budi@tanichain.demo` | FARMER |
| `buyer.maria@tanichain.demo` | BUYER |
| `buyer.andi@tanichain.demo` | BUYER |

## 2. Environment variable reference

See `.env.example` (root) for the full list. The most important ones to change before any deployment beyond your own laptop:

| Variable | Where | Why it matters |
|---|---|---|
| `JWT_SECRET` | backend | Signs all auth tokens. A weak/default value lets anyone forge tokens. |
| `WALLET_ENCRYPTION_KEY` | backend | Encrypts Stellar secret keys at rest. Losing this key makes all wallets unrecoverable; a weak one weakens the encryption. |
| `POSTGRES_PASSWORD` | root/backend | Database credential. |
| `CORS_ORIGIN` | backend | Must match the real frontend origin, or browsers will block API calls. |
| `NEXT_PUBLIC_API_URL` | frontend | Must be reachable from the *browser*, not just from inside Docker - see note below. |
| `STELLAR_NETWORK` / `STELLAR_HORIZON_URL` / `STELLAR_FRIENDBOT_URL` | backend | Only change if intentionally targeting a different Stellar network. This project is built and tested against Testnet only. |

**Note on `NEXT_PUBLIC_API_URL`:** this value is baked into the frontend at build time (it's a `NEXT_PUBLIC_*` variable, inlined into the JS bundle) and is fetched by the user's browser directly, not proxied through Docker's internal network. If you deploy behind a real domain, rebuild the frontend with `NEXT_PUBLIC_API_URL` set to the public API URL (e.g. `https://api.yourdomain.com/api`), or route everything through the Nginx host so the frontend can use a relative `/api` path.

## 3. Deploying beyond a single machine

The Docker Compose file in this repo is intentionally simple (one Postgres container, one backend, one frontend, one Nginx) and is meant for local development, demos, and single-VM deployment. For anything beyond that:

- **Database**: point `DATABASE_URL` at a managed Postgres instance (RDS, Cloud SQL, Neon, Supabase, etc.) instead of the bundled `postgres` container, and remove that service from `docker-compose.yml`.
- **Secrets**: don't ship `.env` in an image or commit it. Use your platform's secret manager (AWS Secrets Manager, Docker Swarm secrets, Kubernetes Secrets, etc.).
- **Horizontal scaling**: the backend is stateless except for the in-memory rate limiter (see `docs/SECURITY.md`) - back that with Redis if you run more than one backend replica.
- **TLS**: terminate TLS at a load balancer or update the Nginx config in `docker/nginx/nginx.conf` to serve HTTPS directly (add a `listen 443 ssl` server block and mount certificates).
- **Migrations**: the backend Dockerfile runs `prisma migrate deploy` on container start, which applies pending migrations idempotently. For a multi-replica deployment, run migrations as a separate one-off job/init-container rather than letting every replica attempt it concurrently.

## 4. Verifying a deployment

```bash
curl http://<host>/api/../health   # or http://<host>:4000/health if bypassing Nginx
```

Should return:
```json
{ "success": true, "message": "TaniChain API is healthy", "timestamp": "..." }
```

Then register a test account through the UI and confirm a Stellar wallet is created (visible on the dashboard, and verifiable on [Stellar Expert Testnet](https://stellar.expert/explorer/testnet)).

## 5. Troubleshooting

| Symptom | Likely cause |
|---|---|
| Backend container restarts in a loop | `DATABASE_URL` unreachable, or `JWT_SECRET`/`WALLET_ENCRYPTION_KEY` unset (the backend fails fast on missing required env vars - see `src/config/env.ts`) |
| Registration succeeds but wallet never funds | Backend container has no outbound internet access to reach `friendbot.stellar.org` |
| Frontend loads but API calls fail with CORS errors | `CORS_ORIGIN` on the backend doesn't match the frontend's actual origin |
| Frontend shows stale API URL after changing `.env` | `NEXT_PUBLIC_API_URL` is baked in at build time - rebuild with `docker compose build frontend` |
