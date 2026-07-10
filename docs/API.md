# TaniChain — API Reference

Full interactive documentation (request/response schemas, try-it-out) is served at **`/api/docs`** once the backend is running, generated from JSDoc annotations on each route file via `swagger-jsdoc`. This document is a quick-scan summary of what's available.

Base URL: `http://localhost:4000/api` (or `http://<host>/api` behind Nginx)

Unless noted, endpoints require `Authorization: Bearer <token>`.

## Auth (`/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | none | Register + auto-create & fund a Stellar wallet |
| POST | `/auth/login` | none | Log in, returns JWT |
| GET | `/auth/me` | any | Current user profile |

## Users (`/users`)
| Method | Path | Auth | Description |
|---|---|---|---|
| PATCH | `/users/profile` | any | Update full name / phone |
| PATCH | `/users/password` | any | Change password |

## Wallet (`/wallet`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/wallet/me` | any | Own wallet + live Stellar Testnet balance |
| GET | `/wallet/qrcode` | any | QR code + `web+stellar:pay` URI for receiving funds |

## Products (`/products`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | none | Browse available products (search, category, pagination) |
| GET | `/products/mine` | FARMER | Own products (any status) |
| GET | `/products/:id` | none | Product detail |
| POST | `/products` | FARMER | Create product |
| PATCH | `/products/:id` | FARMER (owner) | Update product |
| DELETE | `/products/:id` | FARMER (owner) | Delete, or archive if it has orders |

## Orders & Payments (`/orders`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/orders` | BUYER/COOPERATIVE | Create an order (reserves stock) |
| GET | `/orders` | any | List orders (scoped to role: buyer's own, farmer's incoming, admin all) |
| GET | `/orders/:id` | buyer/farmer/admin | Order detail with commitment + transactions |
| POST | `/orders/:id/cancel` | buyer (owner) | Cancel a pending order, restores stock |
| POST | `/orders/:id/commit` | buyer (owner) | **Payment Commitment step 1** - real Stellar tx, buyer → escrow |
| POST | `/orders/:id/deliver` | farmer (owner) | **Step 2** - farmer marks delivered |
| POST | `/orders/:id/confirm` | buyer (owner) | **Step 3** - real Stellar tx, escrow → farmer, order → `PAID` |
| GET | `/orders/:id/qrcode` | buyer/farmer/admin | QR code for this order's payment destination/amount |
| GET | `/orders/:id/invoice` | buyer/farmer/admin | Download PDF invoice |

## Transactions (`/transactions`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/transactions` | any | Own Stellar transaction history (search, status filter, pagination) |
| GET | `/transactions/export` | any | CSV export of own transaction history |
| GET | `/transactions/:id` | sender/receiver/admin | Transaction detail |

## Notifications (`/notifications`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | any | Own notifications (paginated) |
| GET | `/notifications/unread-count` | any | Unread count |
| PATCH | `/notifications/:id/read` | any | Mark one as read |
| PATCH | `/notifications/read-all` | any | Mark all as read |

## Analytics (`/analytics`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/analytics/summary` | any | Role-aware revenue/pending/wallet-balance/monthly-series/status-breakdown |

## Activity (`/activity`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/activity/mine` | any | Own activity log entries |

## Admin (`/admin`) — all require `role: ADMIN`
| Method | Path | Description |
|---|---|---|
| GET | `/admin/overview` | Platform-wide counts and total revenue |
| GET | `/admin/users` | List all users (search, role filter) |
| PATCH | `/admin/users/:id` | Update a user's role or active status |
| GET | `/admin/products` | All products platform-wide |
| GET | `/admin/orders` | All orders platform-wide |
| GET | `/admin/transactions` | All Stellar transactions platform-wide |
| GET | `/admin/wallets` | All wallets platform-wide |
| GET | `/admin/activity-logs` | Platform-wide activity log |
| GET | `/admin/export/:entity` | CSV export — `entity` is one of `users`, `products`, `orders`, `transactions` |

## Response shape

All JSON endpoints return:
```json
{ "success": true, "data": ..., "message": "optional", "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 } }
```
Errors:
```json
{ "success": false, "message": "...", "errors": [{ "path": "email", "message": "Invalid email" }] }
```

## Pagination

List endpoints accept `?page=1&limit=20` (limit capped at 100).
