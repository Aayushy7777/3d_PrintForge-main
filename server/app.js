import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './src/routes/products.js';
import ordersRouter from './src/routes/orders.js';
import cartRouter from './src/routes/cart.js';
import paymentsRouter from './src/routes/payments.js';
import adminRouter from './src/routes/admin.js';
import reviewsRouter from './src/routes/reviews.js';

import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';

/**
 * App factory — used by index.js (production) and by the test suite,
 * so integration tests exercise the exact same middleware chain.
 */
export function createApp() {
  const app = express();
  app.use(cors());

  // Ensure JSON content-type for all API responses
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  app.use(express.json());

  // Health check endpoint
  app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'PrintForge backend (Express + Supabase)' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/reviews', reviewsRouter);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use('/assets', express.static(path.join(__dirname, '..', 'src', 'assets')));
  app.use('/public', express.static(path.join(__dirname, '..', 'public')));

  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found', path: req.path });
  });

  app.use((err, req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    console.error('Error:', err);
    res.status(err.statusCode || err.status || 500).json({
      error: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  });

  return app;
}
