# TaniChain — Security Review

This document summarizes the security measures implemented in TaniChain and known limitations, written for hackathon judges and anyone evaluating the codebase.

## Authentication & Authorization

- Passwords are hashed with **bcrypt** (cost factor 12), never stored or logged in plaintext.
- Sessions use **JWT** signed with `JWT_SECRET`, with a configurable expiry (`JWT_EXPIRES_IN`, default 7 days).
- All mutating endpoints require a valid `Authorization: Bearer <token>` header, verified by the `authenticate` middleware.
- Role-based access control (`authorize(...roles)`) restricts farmer-only, buyer-only, and admin-only endpoints at the route level - not just in the UI.
- Ownership checks are enforced in the service layer (e.g. a farmer can only edit/delete their own products; a buyer can only cancel their own orders) so a valid token for User A can never be used to act on User B's resources, even if the role matches.

## Stellar Wallet Security

- Every Stellar **secret key is encrypted at rest** with AES-256-GCM before being stored in Postgres (`src/utils/crypto.ts`). The encryption key is derived from `WALLET_ENCRYPTION_KEY` via SHA-256.
- Decrypted secret keys exist only in memory, only for the duration of signing a single transaction, and are never returned in any API response or logged.
- Only the Stellar **Testnet** is used - there is no path to real-world funds.
- The platform escrow wallet uses the same encryption-at-rest approach as user wallets.

## Input Validation

- Every request body is validated with **Zod schemas** before it reaches business logic (`middleware/validate.ts`). Invalid input returns a 422 with field-level error messages rather than reaching the database layer.
- Prisma's parameterized queries prevent SQL injection by construction - the codebase contains no raw SQL string concatenation.

## Transport & HTTP Hardening

- **Helmet** sets standard security headers (`X-Content-Type-Options`, `X-Frame-Options`, HSTS in production, etc.).
- A scoped **Content-Security-Policy** is applied (`default-src 'self'`), permissive only where Swagger UI genuinely needs inline styles/scripts to render.
- **CORS** is restricted to the configured frontend origin (`CORS_ORIGIN`), not a wildcard, and credentials are only allowed for that origin.
- **Rate limiting** is applied globally (300 req/15min per IP by default) and more strictly on auth endpoints (20 req/15min) to slow down credential-stuffing and brute-force attempts.
- Nginx terminates all external traffic and proxies internally over the Docker network; only ports 80 (Nginx) and optionally 3000/4000 (for direct debugging) are exposed.

## Data Exposure

- `passwordHash` is stripped from every user object before it's returned from the API (`sanitizeUser` in `auth.service.ts` / `user.service.ts`).
- Wallet secret keys are never included in any API response, including admin endpoints.
- Error responses only include stack traces when `NODE_ENV=development`; production responses return a generic message.

## Known Limitations (honest disclosure)

- **Single platform escrow key**: the escrow simulation uses one Stellar account for all in-flight orders. This is appropriate for a hackathon demo of the payment flow, but a production system would want per-order or sharded escrow accounts, or a Soroban smart contract instead of a custodial key, to reduce blast radius if that one key were ever compromised.
- **No email verification / password reset flow**: registration trusts the provided email address. Out of scope for this build; would be required before any real-money deployment.
- **JWT has no revocation list**: a stolen token remains valid until it expires. A production deployment should add a short-lived access token + refresh token pattern, or a revocation store.
- **Rate limiting is in-memory** (`express-rate-limit` default store): it resets on restart and doesn't share state across multiple backend replicas. A multi-instance production deployment should back it with Redis.
- Default secrets in `.env.example` are placeholders and **must** be replaced before any non-local deployment - see `docs/DEPLOYMENT.md`.
