require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Ensure JWT secret exists (dev-friendly default)
if (!process.env.JWT_SECRET) {
  if ((process.env.NODE_ENV || 'development') === 'production') {
    throw new Error('Missing JWT_SECRET in environment variables');
  }
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
  // eslint-disable-next-line no-console
  console.warn('⚠️  JWT_SECRET was missing; generated a temporary dev secret. Add JWT_SECRET to backend/.env to persist sessions.');
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json()); // Parse incoming JSON request bodies

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    message: 'PrintForge API is running 🚀',
    auth: 'Supabase Authentication',
    database: 'Supabase PostgreSQL',
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
// Products — public, no auth needed
app.use('/api/products', productRoutes);

// Auth — register, login, me
app.use('/api/auth', authRoutes);

// Users — all routes require a valid Supabase JWT Token
app.use('/api/users', userRoutes);

// Cart — requires auth
app.use('/api/cart', cartRoutes);

// Orders — requires auth
app.use('/api/orders', ordersRoutes);

// Payments (Razorpay) — requires auth
app.use('/api/payments', paymentsRoutes);

// ─── Frontend Static (optional, for full-stack local/server deployment) ─────
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  // Let client-side routing work for non-API routes.
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// ─── Error Handling ───────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
// For local development (not Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`🔐 Auth: Supabase Auth`);
    console.log(`🗄️  DB:   Supabase PostgreSQL`);
  });
}

// Export for Vercel serverless (required for production)
module.exports = app;
