<div align="center">

<img src="docs/screenshots/logo.png" alt="TaniChain Logo" width="800" />

**Transparent Agricultural Payment Network powered by Stellar**

A production-ready agricultural payment platform that enables transparent, escrow-backed, blockchain-verifiable transactions between farmers and buyers using the Stellar Testnet.

<br/>

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Express](https://img.shields.io/badge/Express.js-5-000000?logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![Nginx](https://img.shields.io/badge/Nginx-Reverse_Proxy-009639?logo=nginx)
![AWS EC2](https://img.shields.io/badge/AWS-EC2-FF9900?logo=amazonaws&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-CDN-F38020?logo=cloudflare&logoColor=white)
![HTTPS](https://img.shields.io/badge/HTTPS-Lets_Encrypt-success?logo=letsencrypt)
![Stellar](https://img.shields.io/badge/Stellar-Testnet-08B5E5?logo=stellar)
![License](https://img.shields.io/badge/License-MIT-green)
![Stars](https://img.shields.io/github/stars/ArvinFarrelP/tanichain?style=social)
![Forks](https://img.shields.io/github/forks/ArvinFarrelP/tanichain?style=social)
![Issues](https://img.shields.io/github/issues/ArvinFarrelP/tanichain)

</div>

---

# 🌐 Live Demo

### Website

- 🌐 Website: https://tanichain.arvinlabs.tech

### API Documentation

- 📖 Swagger: https://tanichain.arvinlabs.tech/api/docs

### GitHub Repository

- 💻 GitHub: https://github.com/ArvinFarrelP/tanichain

---

# 📖 Overview

TaniChain is a modern full-stack web platform that digitizes agricultural transactions by integrating traditional marketplace workflows with blockchain-backed payment verification.

Instead of relying on manual payment confirmation and opaque transaction records, TaniChain records payment commitments and settlement metadata on the Stellar Testnet, providing transparency, traceability, and trust for both farmers and buyers.

The platform combines a responsive Next.js frontend, an Express.js REST API, PostgreSQL database, Docker-based deployment, Nginx reverse proxy, HTTPS encryption via Let's Encrypt, and Cloudflare DNS/CDN for production-grade hosting.

---

# ✨ Key Features

- 🌱 Farmer product marketplace
- 💳 Escrow-inspired payment workflow
- ⛓️ Stellar Testnet transaction recording
- 🔐 JWT Authentication & Role-Based Access Control (RBAC)
- 👤 Buyer, Farmer, and Administrator roles
- 📦 Order management system
- 💼 Wallet management
- 📈 Analytics dashboard
- 📜 Activity logging
- 🔔 Notification system
- 📑 Interactive Swagger API Documentation
- 🐳 Dockerized deployment
- 🌍 HTTPS production deployment using Nginx + Let's Encrypt + Cloudflare

---

# 🛠 Tech Stack

## Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Axios

## Backend

- Express.js
- TypeScript
- Prisma ORM
- JWT Authentication
- Swagger OpenAPI
- Helmet
- Rate Limiter

## Database

- PostgreSQL 16

## Blockchain

- Stellar SDK
- Stellar Testnet
- Horizon API

## Infrastructure

- Docker
- Docker Compose
- Nginx Reverse Proxy
- Let's Encrypt SSL
- Cloudflare DNS & CDN
- Ubuntu Server

---

# 📂 Project Structure

```text
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

---

# 🏗 System Architecture

```text
                              Users
                                │
                                │ HTTPS
                                ▼
                         Cloudflare CDN
                                │
                                ▼
                       Let's Encrypt SSL
                                │
                                ▼
                     Nginx Reverse Proxy
                      (HTTPS Termination)
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
     Next.js Frontend                 Express Backend
   (React + TypeScript)             (REST API + Prisma)
                │                               │
                │         REST API              │
                └───────────────┬───────────────┘
                                │
                                ▼
                           PostgreSQL 16
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
                  Stellar Horizon API      Swagger OpenAPI
                      (Blockchain)         Documentation

```

---

# 🌍 Production Deployment

```text
                           Internet
                              │
                              ▼
                        Cloudflare DNS
                              │
                              ▼
                  tanichain.arvinlabs.tech
                              │
                         HTTPS (TLS)
                              │
                              ▼
                    Ubuntu Server (AWS EC2)
                              │
                        Docker Compose
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │                    Nginx                    │
        │                                             │
        │  /           → Frontend (Next.js)           │
        │  /api/*      → Backend (Express.js)         │
        │  /api/docs   → Swagger UI                   │
        └─────────────────────────────────────────────┘
                              │
                              ▼
                     PostgreSQL Database
```

---

# 🔄 Application Flow

```text
                         Buyer / Farmer
                               │
                               ▼
                      Frontend (Next.js)
                               │
                       REST API Request
                               │
                               ▼
                      Express.js Backend
                               │
                      JWT Authentication
                               │
                         Business Logic
                               │
                           Prisma ORM
                               │
                               ▼
                           PostgreSQL
                               │
                               ▼
                            Response
                               │
                               ▼
                     Frontend UI Update
```

---

# ⛓ Blockchain Payment Flow

```text
                             Buyer
                               │
                        Creates Order
                               │
                               ▼
                    Payment Commitment
                               │
                               ▼
                     Backend Validation
                               │
                               ▼
                 Record Metadata to
                    Stellar Testnet
                               │
                               ▼
               Transaction Hash Stored
                      in Database
                               │
                               ▼
                   Farmer Verification
                               │
                               ▼
                     Payment Released
```

---

# 🐳 Docker Architecture

```text
Docker Compose

├── nginx
│      │
│      ├── HTTPS Reverse Proxy
│      ├── SSL Termination
│      └── Route Requests
│
├── frontend
│      │
│      └── Next.js Production Server
│
├── backend
│      │
│      ├── Express API
│      ├── Prisma ORM
│      └── Swagger Docs
│
└── postgres
       │
       └── Persistent Database
```

---

# 🔐 Security Features

TaniChain is designed with security-first principles and includes multiple layers of protection.

### Authentication

- JWT Authentication
- Secure password hashing
- Role-Based Access Control (RBAC)
- Protected API endpoints

### API Security

- Helmet Security Headers
- Rate Limiting
- Input Validation
- Centralized Error Handling
- CORS Protection

### Infrastructure Security

- HTTPS via Let's Encrypt
- Cloudflare DNS & CDN
- Nginx Reverse Proxy
- Secure Docker Network
- Environment Variable Management

---

# 🚀 Getting Started

## Prerequisites

Before running TaniChain, make sure the following software is installed:

- Docker
- Docker Compose
- Git
- Node.js 20+ (optional for local development)
- PostgreSQL 16 (optional for local development)

---

# 📥 Clone Repository

```bash
git clone https://github.com/ArvinFarrelP/tanichain.git

cd tanichain
```

---

# ⚙ Environment Variables

Copy the example environment file.

```bash
cp .env.example .env
```

Edit the configuration as needed.

Example:

```env
POSTGRES_USER=tanichain
POSTGRES_PASSWORD=your_password
POSTGRES_DB=tanichain

JWT_SECRET=your_super_secret

WALLET_ENCRYPTION_KEY=your_encryption_key

STELLAR_NETWORK=TESTNET
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_FRIENDBOT_URL=https://friendbot.stellar.org

CORS_ORIGIN=https://tanichain.arvinlabs.tech

NEXT_PUBLIC_API_URL=https://tanichain.arvinlabs.tech/api
```

---

# 🐳 Docker Deployment (Recommended)

Build every container.

```bash
docker compose build
```

Run all services.

```bash
docker compose up -d
```

Check running containers.

```bash
docker ps
```

Expected containers:

```
tanichain-nginx
tanichain-frontend
tanichain-backend
tanichain-postgres
```

---

# 📊 Check Container Health

```bash
docker ps
```

Expected output:

```
STATUS

tanichain-nginx        healthy
tanichain-frontend     healthy
tanichain-backend      healthy
tanichain-postgres     healthy
```

---

# 🧪 Health Check API

Backend Health Endpoint

```bash
curl https://tanichain.arvinlabs.tech/api/health
```

Response

```json
{
  "success": true,
  "message": "TaniChain API is healthy"
}
```

---

# 🌐 Production Deployment

TaniChain is deployed using Docker Compose on Ubuntu Server with Nginx Reverse Proxy and HTTPS.

### Production URLs

Website

```
https://tanichain.arvinlabs.tech
```

Swagger Documentation

```
https://tanichain.arvinlabs.tech/api/docs
```

API Endpoint

```
https://tanichain.arvinlabs.tech/api
```

---

# 🔒 HTTPS Configuration

Production deployment includes:

- Let's Encrypt SSL Certificate
- Automatic HTTP → HTTPS Redirect
- TLS 1.2 / TLS 1.3
- Nginx Reverse Proxy
- Cloudflare DNS
- Dockerized Infrastructure

---

# 💻 Local Development

## Backend

```bash
cd backend

npm install

npx prisma generate

npx prisma migrate dev

npm run dev
```

Backend runs on

```
http://localhost:4000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on

```
http://localhost:3000
```

---

# 📖 API Documentation

Swagger UI

Production

```
https://tanichain.arvinlabs.tech/api/docs
```

Development

```
http://localhost:4000/api/docs
```

OpenAPI JSON

```
http://localhost:4000/api/docs.json
```

---

# 🛠 Useful Docker Commands

Build images

```bash
docker compose build
```

Start containers

```bash
docker compose up -d
```

Stop containers

```bash
docker compose down
```

Restart

```bash
docker compose restart
```

View logs

```bash
docker compose logs -f
```

Check running containers

```bash
docker ps
```

Open backend shell

```bash
docker compose exec backend sh
```

Open PostgreSQL

```bash
docker compose exec postgres psql -U tanichain
```

---

# 🚀 Detailed Features

## 👥 Multi-Role Authentication

TaniChain supports Role-Based Access Control (RBAC) with four different user roles.

| Role             | Permissions                                                |
| ---------------- | ---------------------------------------------------------- |
| 👨‍🌾 Farmer        | Manage products, receive orders, track payments            |
| 🛒 Buyer         | Browse marketplace, purchase products, view transactions   |
| 🏢 Cooperative   | Manage cooperative-related activities _(future expansion)_ |
| 👑 Administrator | Full platform management and analytics                     |

Authentication features include:

- JWT Authentication
- Password Hashing (bcrypt)
- Protected Routes
- Role-Based Authorization (RBAC)
- Secure Session Management

---

# 🌱 Marketplace

Farmers can publish agricultural products while buyers can browse available commodities in real time.

### Farmer Features

- Create Products
- Update Products
- Archive Products
- Inventory Management
- Product Categories
- Stock Management

### Buyer Features

- Browse Marketplace
- Product Detail
- Search Products
- Category Filtering
- Pagination
- Purchase Products

---

# 💳 Payment Commitment Workflow

Instead of relying on traditional payment confirmation, TaniChain introduces a transparent payment commitment process backed by Stellar Testnet transactions.

Workflow:

```text
Buyer
   │
Create Order
   │
   ▼
Payment Commitment
   │
   ▼
Blockchain Record
   │
   ▼
Farmer Confirmation
   │
   ▼
Payment Released
```

This provides:

- Transparent payments
- Immutable transaction records
- Verifiable blockchain history
- Escrow-inspired settlement workflow

---

# ⛓️ Blockchain Integration

TaniChain integrates with the **Stellar Testnet** to provide secure and transparent payment verification.

Features include:

- Automatic Wallet Creation
- Friendbot Funding
- Stellar SDK Integration
- Horizon API
- Transaction Explorer Links
- Blockchain Transaction History
- Wallet Balance Tracking

Every registered user automatically receives:

- Stellar Wallet
- Public Key
- Encrypted Secret Key
- Initial Testnet Balance

---

# 💼 Wallet Management

Each user owns a blockchain wallet.

Features include:

- Wallet Address
- Current Balance
- QR Code Generation
- Transaction History
- Payment QR
- Blockchain Explorer Link

---

# 📦 Order Management

Complete order lifecycle management.

Supported order states include:

- Pending
- Payment Committed
- Paid
- Processing
- Delivered
- Completed
- Cancelled

Users can:

- View Orders
- Track Status
- Search Orders
- Filter Orders
- Download Invoice

---

# 📑 PDF Invoice

Every completed order can generate a professional invoice.

Invoice includes:

- Buyer Information
- Farmer Information
- Product Details
- Quantity
- Total Price
- Payment Status
- Blockchain Transaction Hash
- Order Date

---

# 📤 CSV Export

Users can export data into CSV format.

Supported exports:

- Transactions
- Products
- Orders

Administrator exports:

- Users
- Products
- Orders
- Transactions

---

# 📊 Analytics Dashboard

Interactive dashboards provide valuable insights into platform activities.

Dashboard Features

- Revenue Summary
- Monthly Revenue
- Wallet Balance
- Pending Orders
- Completed Orders
- Transaction Statistics
- Charts & Graphs

Built using:

- Recharts
- React
- TypeScript

---

# 👑 Administrator Features

Administrators have complete visibility over the platform.

Features include:

- User Management
- Product Management
- Order Management
- Transaction Management
- Wallet Monitoring
- Activity Logs
- Platform Analytics

---

# 🔔 Notification System

Real-time notifications are generated for important events.

Notifications include:

- New Order
- Payment Committed
- Payment Released
- Delivery Confirmation
- Transaction Updates

---

# 📜 Activity Logs

Every important action is recorded.

Examples:

- User Login
- Registration
- Product Creation
- Product Update
- Order Creation
- Payment Commitment
- Transaction Completion

Administrators can monitor all platform activities.

---

# ⭐ Project Highlights

✔ Production-ready deployment

✔ Live production deployment on AWS EC2

✔ Custom domain with HTTPS

✔ Let's Encrypt SSL Certificate

✔ Cloudflare DNS & CDN integration

✔ Dockerized infrastructure

✔ Docker Compose deployment

✔ Nginx Reverse Proxy

✔ RESTful API architecture

✔ PostgreSQL database

✔ Swagger OpenAPI Documentation

✔ Role-Based Access Control (RBAC)

✔ Blockchain-powered payment verification

✔ Stellar Testnet integration

✔ Modern UI built with Next.js 15

✔ TypeScript across frontend and backend

✔ Responsive web application

✔ Interactive analytics dashboard

---

# 📸 Screenshots

> Below are screenshots of the current TaniChain application.

## 🌐 Landing Page

<img src="docs/screenshots/landing.png" alt="Landing Page" width="100%">

---

## 🛒 Marketplace

<img src="docs/screenshots/marketplace.png" alt="Marketplace" width="100%">

---

## 📊 User Dashboard

<img src="docs/screenshots/dashboard.png" alt="User Dashboard" width="100%">

---

## 💰 Payment Commitment

<img src="docs/screenshots/payment.png" alt="Payment Commitment" width="100%">

---

## 🌌 Stellar Testnet Explorer

TaniChain integrates with the Stellar Testnet using the Stellar SDK and Horizon API. Every registered user automatically receives a funded Stellar wallet, and payment transactions can be publicly verified through Stellar Expert.

### Wallet Explorer

<img src="docs/screenshots/stellar-wallet.png" alt="Stellar Testnet Wallet" width="100%">

View the wallet on Stellar Expert:

https://stellar.expert/explorer/testnet/account/GD7ID4IKVS3ZYCBYMDZ2VWAB7YAINYF3BAIRGVUBEQX2Q4TBG535YVOV

<br>

### Transaction History

<img src="docs/screenshots/stellar-transactions.png" alt="Stellar Transaction History" width="100%">

<br>

### Sample Transaction

<img src="docs/screenshots/stellar-transaction.png" alt="Stellar Transaction Details" width="100%">

View the transaction on Stellar Expert:

https://stellar.expert/explorer/testnet/tx/8df5a31782b1b3c244048519cb7aaa22faa1f6a6b3f348e5376ca3f349ad7e77

---

## 📖 Swagger API Documentation

<img src="docs/screenshots/swagger1.png" alt="Swagger Overview" width="100%">

<br>

<img src="docs/screenshots/swagger2.png" alt="Authentication Endpoints" width="100%">

<br>

<img src="docs/screenshots/swagger3.png" alt="Marketplace Endpoints" width="100%">

<br>

<img src="docs/screenshots/swagger4.png" alt="Admin Endpoints" width="100%">

---

# 📚 API Overview

| Module         | Description                    |
| -------------- | ------------------------------ |
| Authentication | User registration & login      |
| Products       | Marketplace product management |
| Orders         | Buyer & farmer order workflow  |
| Transactions   | Payment history                |
| Wallet         | Stellar wallet management      |
| Analytics      | Dashboard statistics           |
| Notifications  | User notifications             |
| Activity       | Audit logs                     |
| Administration | Platform management            |

---

# ⛓️ Stellar Integration

TaniChain integrates directly with the Stellar Testnet using the Stellar SDK and Horizon API.

Current implementation includes:

- Automatic Stellar wallet creation
- Friendbot wallet funding
- Payment commitment recording
- Transaction verification
- Explorer transaction links

This project currently does **not deploy a Soroban Smart Contract**.

Instead, payment commitments are implemented through Stellar accounts and blockchain transaction verification.

Future releases will extend the payment workflow using Soroban Smart Contracts.

---

# 📂 Documentation

Additional project documentation is available inside the **docs/** directory.

| Document      | Description                 |
| ------------- | --------------------------- |
| API.md        | REST API Reference          |
| DEPLOYMENT.md | Production Deployment Guide |
| SECURITY.md   | Security Review             |
| PROGRESS.md   | Development Progress        |

---

# 🧪 Testing

Verify that all services are running correctly after deployment.

## Start the Application

```bash
docker compose up --build -d
```

## Check Running Containers

```bash
docker ps
```

Expected containers:

- tanichain-nginx
- tanichain-frontend
- tanichain-backend
- tanichain-postgres

## Health Check

```bash
curl https://tanichain.arvinlabs.tech/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "TaniChain API is healthy"
}
```

## Swagger Documentation

Open:

```
https://tanichain.arvinlabs.tech/api/docs
```

---

# 🛣️ Roadmap

Future improvements planned for TaniChain.

## Blockchain

- Soroban Smart Contract Escrow
- Multi-Signature Wallet
- Stellar Mainnet Deployment
- Cross-border Payments

---

## Marketplace

- Product Images
- Product Reviews
- Wishlist
- Shopping Cart
- Farmer Verification Badge

---

## Payments

- QR Payment
- Automatic Escrow
- Partial Payments
- Payment History Export

---

## Infrastructure

- CI/CD Pipeline
- Kubernetes Deployment
- Redis Cache
- Prometheus Monitoring
- Grafana Dashboard

---

## Mobile

- Android Application
- iOS Application
- Push Notifications

---

# 🤝 Contributing

Contributions are welcome!

1. Fork this repository

2. Create a new branch

```bash
git checkout -b feature/my-feature
```

3. Commit your changes

```bash
git commit -m "feat: add amazing feature"
```

4. Push your branch

```bash
git push origin feature/my-feature
```

5. Open a Pull Request

---

# 📄 License

This project is released under the **MIT License**.

See the LICENSE file for more information.

---

# 🙏 Acknowledgements

This project would not have been possible without these amazing technologies and communities.

- Stellar Development Foundation
- Stellar SDK
- Horizon API
- Next.js
- Express.js
- PostgreSQL
- Prisma ORM
- Docker
- Nginx
- Tailwind CSS
- TypeScript
- Swagger OpenAPI
- Cloudflare
- Let's Encrypt

---

# 🏆 APAC Stellar Hackathon 2026

**Track**

Local Finance & Real World Access

**Project**

TaniChain

**Core Idea**

TaniChain leverages Stellar to create a transparent agricultural payment network where payment commitments are securely recorded on-chain, enabling trusted transactions, reducing payment disputes, and improving financial accessibility for farmers and buyers.

---

# 👨‍💻 Author

**Arvin Farrel Pramuditya**

Backend Engineer • Blockchain Developer • Open Source Contributor

GitHub

https://github.com/ArvinFarrelP

LinkedIn

https://linkedin.com/in/ArvinFarrelP

---

<div align="center">

### 🌾 TaniChain

**Transparent Agricultural Payment Network powered by Stellar**

Built with ❤️ using

Next.js • Express.js • PostgreSQL • Docker • Nginx • Stellar Testnet

⭐ If you found this project interesting, consider giving it a star!

</div>
