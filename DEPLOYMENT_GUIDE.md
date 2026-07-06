# 📚 PrintForge Deployment & Configuration Guide

## Quick Start Commands

### Development Environment

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend  
npm --prefix server run dev
```

**Access URLs:**
- Frontend: http://localhost:8082
- Backend API: http://localhost:5001
- Products endpoint: http://localhost:5001/api/products

### Docker Deployment (Recommended)

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

---

## Environment Configuration

### 1. Backend Environment Variables

**File:** `server/.env`

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_random_secret_key_here
# Generate with: openssl rand -hex 32

# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay Payments
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:8082

# Application
STORE_NAME=PrintForge
```

### 2. Frontend Environment Variables

**File:** `.env.local`

```env
VITE_API_URL=http://localhost:5001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Getting Credentials

### Supabase Setup

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy:
   - Project URL → `SUPABASE_URL`
   - Anon Key → `SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

### Razorpay Setup

1. Go to [razorpay.com](https://razorpay.com)
2. Sign up / Log in
3. Go to Settings → API Keys
4. Copy:
   - Key ID → `RAZORPAY_KEY_ID`
   - Key Secret → `RAZORPAY_KEY_SECRET`

### JWT Secret Generation

```bash
# Linux/Mac
openssl rand -hex 32

# Windows (PowerShell)
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### Gmail App Password (for SMTP)

1. Enable 2-factor authentication on Gmail
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Select Mail & Windows Computer
4. Copy the generated password
5. Use as `SMTP_PASS`

---

## Production Deployment

### Frontend (Vercel)

1. **Connect Repository**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Configure Environment**
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add `VITE_API_URL=https://api.printforge.com`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Backend (Railway)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Connect GitHub

2. **Deploy**
   - Select repository
   - Set Root Directory: `server`
   - Add Environment Variables (from .env)
   - Deploy

3. **Get Host URL**
   - Copy from Railway Dashboard
   - Update `FRONTEND_URL` with railway API URL

### Database (Supabase)

Already configured in both environments (same Supabase project)

---

## API Endpoints

### Health Check

```bash
GET http://localhost:5001
# Response: { status: "ok", message: "PrintForge backend..." }
```

### Products

```bash
# Get all products
GET http://localhost:5001/api/products
Authorization: Bearer <optional_jwt_token>

# Get featured products
GET http://localhost:5001/api/products?featured=true

# Get single product
GET http://localhost:5001/api/products/:id

# Create product (admin)
POST http://localhost:5001/api/products
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
{
  "name": "Product Name",
  "price": 1999,
  "category": "sculptures",
  ...
}
```

### Orders

```bash
# Create order
POST http://localhost:5001/api/orders
Authorization: Bearer <jwt_token>
{
  "items": [{ product_id, quantity, price }],
  "delivery_address_id": "uuid"
}

# Get user orders
GET http://localhost:5001/api/orders
Authorization: Bearer <jwt_token>

# Get order details
GET http://localhost:5001/api/orders/:id
Authorization: Bearer <jwt_token>
```

### Payments

```bash
# Create Razorpay order
POST http://localhost:5001/api/payments
Authorization: Bearer <jwt_token>
{
  "order_id": "uuid",
  "amount": 1999,
  "currency": "INR"
}

# Verify payment
POST http://localhost:5001/api/payments/verify
Authorization: Bearer <jwt_token>
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature"
}
```

---

## Troubleshooting

### Port 5001 Already in Use

```powershell
# Kill process
$proc = Get-NetTCPConnection -LocalPort 5001 -State Listen
Stop-Process -Id $proc.OwningProcess -Force

# Or change port in server/.env
PORT=5002
```

### Supabase Connection Error

```bash
# Verify credentials
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Test connection
curl -H "apikey: $SUPABASE_ANON_KEY" \
  $SUPABASE_URL/rest/v1/products?limit=1
```

### Docker Build Fails

```bash
# Clear Docker cache
docker system prune -a

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Frontend Not Loading Products

1. Check API URL in `.env.local`
2. Verify backend is running: `curl http://localhost:5001/api/products`
3. Check browser console for CORS errors
4. Verify CORS is enabled in backend

---

## Testing

### Automated with GitHub Actions

Pushes to `main` or `develop` trigger:
- Linting ✅
- Type checking ✅
- Build verification ✅
- Docker build test ✅

### Manual Testing

```bash
# Frontend build
npm run build

# Backend start test
npm --prefix server start

# Docker test
docker-compose up

# API test
curl -s http://localhost:5001/api/products | jq '.'
```

---

## Monitoring & Logs

### Docker Logs

```bash
# All services
docker-compose logs -f

# Frontend only
docker-compose logs -f frontend

# Backend only
docker-compose logs -f backend

# Last 50 lines
docker-compose logs --tail=50
```

### Backend Health

```bash
# Check API health
curl http://localhost:5001

# List products count
curl http://localhost:5001/api/products | jq 'length'

# Database connection
curl http://localhost:5001/api/health/db
```

---

## Security Checklist

- [ ] JWT_SECRET is not hardcoded
- [ ] API keys are in environment variables
- [ ] CORS whitelisted to production domain
- [ ] HTTPS enabled in production
- [ ] Database password is strong
- [ ] API rate limiting enabled
- [ ] Admin routes protected with JWT
- [ ] Sensitive logs exclude passwords/keys

---

## Performance Optimization

### Database
- Add indexes on frequently queried columns
- Implement query caching (Redis optional)

### Frontend
- Enable code splitting (Vite automatic)
- Optimize images (use WebP format)
- Lazy load components

### Backend
- Enable compression middleware
- Implement response caching
- Use connection pooling

---

## Support

- Issues: [GitHub Issues](https://github.com/Aayushy7777/3d_PrintForge/issues)
- Email: aayu.sh7021@gmail.com

---

**Last Updated:** March 16, 2026
**Version:** 1.0
