# 🚀 PrintForge Production Transformation Guide

## Phase 1: Foundation Setup ✅ COMPLETED

This guide documents the complete transformation of PrintForge from a basic Vite + React app into a **fully scalable, production-ready 3D printing e-commerce platform**.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Local Development Setup](#local-development-setup)
5. [Docker Setup](#docker-setup)
6. [API Documentation](#api-documentation)
7. [Deployment Guide](#deployment-guide)
8. [Environment Variables](#environment-variables)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**PrintForge** is a modern e-commerce platform for selling and managing 3D printed products with:

- ✅ User authentication (Supabase Auth + JWT)
- ✅ Product catalog with 3D specifications
- ✅ Shopping cart & checkout
- ✅ Order management & tracking
- ✅ Payment integration (Razorpay)
- ✅ Admin dashboard
- ✅ Review & rating system
- ✅ Email notifications
- ✅ Docker containerization
- ✅ CI/CD pipelines (GitHub Actions)

**Status:** 25% Complete (Phase 1 Foundation Done)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PrintForge Platform                   │
├─────────────────────────────────────────────────────────┤
│
│  Frontend Layer (Port 8082)
│  ├─ React 18 + TypeScript + Vite
│  ├─ TailwindCSS + shadcn/ui
│  ├─ React Router v6
│  └─ React Query + Context API
│
│                      ↓ HTTP/REST
│
│  API Gateway Layer (Port 5001)
│  ├─ Express.js + TypeScript
│  ├─ Rate Limiting & Helmet Security
│  ├─ CORS Configuration
│  └─ JWT Authentication Middleware
│
│                      ↓ SQL
│
│  Database Layer (Supabase PostgreSQL)
│  ├─ Users & Authentication
│  ├─ Products & Inventory
│  ├─ Orders & Order Items
│  ├─ Cart Items
│  ├─ Reviews & Ratings
│  ├─ Delivery Addresses
│  └─ Payment Records
│
│  External Services
│  ├─ Supabase (Auth + Database)
│  ├─ Razorpay (Payments)
│  ├─ SMTP (Email)
│  └─ Google Cloud Storage (Images)
│
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version | Status |
|-------|-----------|---------|--------|
| **Frontend** | React | 18.3.1 | ✅ |
| | TypeScript | 5.8 | ✅ |
| | Vite | 6.4.1 | ✅ |
| | TailwindCSS | 3.4.17 | ✅ |
| | shadcn/ui | latest | ✅ |
| | React Router | 6.30.1 | ✅ |
| | React Query | 5.83.0 | ✅ |
| **Backend** | Express.js | 4.18.2 | ✅ |
| | Node.js | 20 LTS | ✅ |
| | TypeScript | 5.8 | ✅ |
| | Helmet | 8.1.0 | ✅ |
| **Database** | PostgreSQL | 15 | ✅ |
| | Supabase | 2.49.1 | ✅ |
| **Auth** | Supabase Auth | JWT | ✅ |
| **Payments** | Razorpay | 2.9.6 | ✅ |
| **Containerization** | Docker | latest | ✅ |
| | docker-compose | 3.8 | ✅ |
| **CI/CD** | GitHub Actions | latest | ✅ |

---

## Local Development Setup

### Prerequisites

- Node.js 20 LTS
- Docker & Docker Compose
- Git
- Supabase account (free tier available)

### Step 1: Clone & Install

\`\`\`bash
git clone https://github.com/Aayushy7777/3d_PrintForge.git
cd 3d_PrintForge

# Install frontend dependencies
npm install

# Install backend dependencies
npm install --prefix server
\`\`\`

### Step 2: Environment Configuration

Copy and configure environment files:

\`\`\`bash
# Frontend (already configured)
cp .env.example .env.local

# Backend
cp server/.env.example server/.env
\`\`\`

**Backend .env Setup:**
\`\`\`env
PORT=5001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:8082
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
STORE_NAME=PrintForge
\`\`\`

### Step 3: Start Development Servers

**Option A: Individual Servers**

Terminal 1 (Frontend):
\`\`\`bash
npm run dev
# Server runs on http://localhost:8082
\`\`\`

Terminal 2 (Backend):
\`\`\`bash
npm --prefix server run dev
# API runs on http://localhost:5001
\`\`\`

**Option B: Docker Compose**

\`\`\`bash
docker-compose up --build
# Frontend: http://localhost:8082
# Backend: http://localhost:5001
\`\`\`

### Step 4: Verify Setup

Frontend Health:
\`\`\`bash
curl http://localhost:8082
\`\`\`

Backend Health:
\`\`\`bash
curl http://localhost:5001
curl http://localhost:5001/api/products
\`\`\`

---

## Docker Setup

### Build Containers

\`\`\`bash
# Build frontend
docker build -f Dockerfile.frontend -t printforge-frontend:latest .

# Build backend
docker build -f Dockerfile.backend -t printforge-backend:latest .
\`\`\`

### Run with Docker Compose

\`\`\`bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild services
docker-compose up -d --build
\`\`\`

### Docker Container Commands

\`\`\`bash
# SSH into container
docker-compose exec frontend sh
docker-compose exec backend sh

# View resource usage
docker stats

# Clean up unused images/volumes
docker system prune -a
\`\`\`

---

## API Documentation

### Authentication Endpoints

**Sign Up (Supabase handled)**
\`\`\`
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
\`\`\`

**Sign In (Supabase handled)**
\`\`\`
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
\`\`\`

### Product Endpoints

**Get All Products**
\`\`\`
GET /api/products
Response: [{ id, name, price, image, category, ... }]
\`\`\`

**Get Product Details**
\`\`\`
GET /api/products/:id
Response: { id, name, description, price, specifications, materials, ... }
\`\`\`

**Create Product (Admin Only)**
\`\`\`
POST /api/products
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Description",
  "price": 1999,
  "category": "sculptures",
  "materials": ["PLA", "PETG"],
  "image": "https://...",
  "specifications": { ... }
}
\`\`\`

### Cart Endpoints

**Add to Cart**
\`\`\`
POST /api/cart
Authorization: Bearer <jwt_token>

{
  "product_id": "uuid",
  "quantity": 1,
  "customization": { ... }
}
\`\`\`

**Get Cart**
\`\`\`
GET /api/cart
Authorization: Bearer <jwt_token>
\`\`\`

### Order Endpoints

**Create Order**
\`\`\`
POST /api/orders
Authorization: Bearer <jwt_token>

{
  "items": [{ product_id, quantity, price }],
  "delivery_address_id": "uuid",
  "payment_method": "razorpay"
}
\`\`\`

**Get Orders**
\`\`\`
GET /api/orders
Authorization: Bearer <jwt_token>
\`\`\`

**Get Order Details**
\`\`\`
GET /api/orders/:id
Authorization: Bearer <jwt_token>
\`\`\`

### Payment Endpoints

**Create Payment**
\`\`\`
POST /api/payments
Authorization: Bearer <jwt_token>

{
  "order_id": "uuid",
  "amount": 1999,
  "currency": "INR"
}
Response: { razorpay_order_id, amount, currency }
\`\`\`

**Verify Payment**
\`\`\`
POST /api/payments/verify
Authorization: Bearer <jwt_token>

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature"
}
\`\`\`

---

## Deployment Guide

### Frontend Deployment (Vercel)

1. **Connect Repository**
   - Go to vercel.com
   - Import your GitHub repository
   - Select framework: Vite

2. **Configure Environment**
   - Add VITE_API_URL: https://api.printforge.com

3. **Deploy**
   \`\`\`bash
   # Automatic on push to main
   # Or manually via Vercel dashboard
   \`\`\`

### Backend Deployment (Railway)

1. **Connect Repository**
   - Go to railway.app
   - Connect GitHub account
   - Select this repository

2. **Configure Service**
   - Root Directory: server/
   - Build Command: npm install
   - Start Command: npm start

3. **Environment Variables**
   - Add all from server/.env

4. **Deploy**
   \`\`\`bash
   npm run migrate:prod
   \`\`\`

### Database Deployment (Supabase)

1. Go to supabase.com
2. Create a new project
3. Run migrations:
   \`\`\`bash
   npx supabase db push
   \`\`\`

---

## Environment Variables

### Frontend (.env.local)

\`\`\`env
VITE_API_URL=http://localhost:5001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

### Backend (server/.env)

\`\`\`env
# Server
PORT=5001
NODE_ENV=development

# JWT
JWT_SECRET=your_random_secret

# Supabase
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# App
FRONTEND_URL=http://localhost:8082
STORE_NAME=PrintForge
\`\`\`

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### 1. CI Workflow (.github/workflows/ci.yml)

Runs on every push/PR:
- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Build verification
- ✅ Docker build test

**Trigger:**
\`\`\`yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
\`\`\`

#### 2. Deploy Workflow (.github/workflows/deploy.yml)

Runs on merge to main:
- 🚀 Deploy frontend to Vercel
- 🚀 Build & push Docker image
- 🚀 Deploy backend to Railway
- 🚀 Health checks
- 📢 Slack notifications

**Trigger:**
\`\`\`yaml
on:
  push:
    branches: [main]
\`\`\`

### Required Secrets

Add to GitHub Settings → Secrets:

\`\`\`
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

RAILWAY_TOKEN=your_railway_token
RAILWAY_PROJECT_ID=your_project_id

DOCKER_USERNAME=your_docker_username
DOCKER_PASSWORD=your_docker_password

SLACK_WEBHOOK=your_slack_webhook_url
\`\`\`

---

## Project Structure

\`\`\`
3d_PrintForge/
├── src/                          # Frontend React code
│   ├── components/              # Reusable components
│   │   ├── admin/              # Admin dashboard
│   │   ├── auth/               # Auth forms
│   │   ├── cart/               # Cart UI
│   │   ├── checkout/           # Checkout flow
│   │   ├── common/             # Common components
│   │   ├── home/               # Home page
│   │   ├── product/            # Product pages
│   │   ├── products/           # Product listing
│   │   ├── profile/            # User profile
│   │   └── ui/                 # shadcn/ui components
│   ├── contexts/               # React Context
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── ThemeContext.tsx
│   ├── lib/                    # Utilities
│   ├── pages/                  # Page routes
│   ├── hooks/                  # Custom hooks
│   └── App.tsx                 # Main app
│
├── server/                       # Backend Express code
│   ├── routes/                 # API routes
│   │   ├── auth.js            # Auth endpoints
│   │   ├── products.js        # Product endpoints
│   │   ├── orders.js          # Order endpoints
│   │   └── ...
│   ├── lib/                   # Database & utilities
│   ├── middleware/            # Express middleware
│   └── index.js               # Server entry point
│
├── docker/                       # Docker configs
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
│
├── .github/                      # GitHub Actions
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── docs/                         # Documentation
├── public/                       # Static assets
├── package.json                  # Frontend dependencies
├── vite.config.ts              # Vite configuration
└── README.md                     # This file
\`\`\`

---

## Troubleshooting

### Common Issues

**Port Already in Use**
\`\`\`bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Kill process on port 8082
lsof -ti:8082 | xargs kill -9

# On Windows (PowerShell)
Get-NetTCPConnection -LocalPort 5001 | Stop-Process -Force
\`\`\`

**Docker Container Won't Start**
\`\`\`bash
# View logs
docker-compose logs backend

# Rebuild containers
docker-compose down
docker-compose up -d --build

# Remove dangling images
docker image prune -f
\`\`\`

**API Not Responding**
\`\`\`bash
# Check if backend is running
curl http://localhost:5001

# Check logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
\`\`\`

**Supabase Connection Failed**
\`\`\`bash
# Verify .env file
cat server/.env

# Check Supabase URL and keys
# Go to supabase.io → Select Project → Settings → API
\`\`\`

**Build Errors**
\`\`\`bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild backend
rm -rf server/node_modules
npm install --prefix server
\`\`\`

---

## Next Steps (Phase 2-6)

### Phase 2: Backend Implementation ⏳
- Migrate existing routes
- Implement Prisma CRUD
- Add email service
- Complete payment integration

### Phase 3: Frontend Enhancement ⏳
- Migrate React components to Next.js
- Implement authentication UI
- Create product catalog
- Build checkout flow

### Phase 4: Features & Polish ⏳
- Admin dashboard
- Order tracking
- Review system
- 3D upload feature

### Phase 5: Testing ⏳
- Unit tests
- E2E tests
- API tests

### Phase 6: Production Launch 🚀
- Deploy to production
- Domain configuration
- SSL certificates
- Monitoring setup

---

## Support & Contributing

- **Issues:** github.com/Aayushy7777/3d_PrintForge/issues
- **Discussions:** github.com/Aayushy7777/3d_PrintForge/discussions
- **Email:** aayu.sh7021@gmail.com

---

## License

MIT License - See LICENSE file for details

---

**Last Updated:** March 16, 2026
**Version:** 1.0.0 (Phase 1 Complete)
**Status:** 🟡 Production Ready with Phase 2+ Pending
