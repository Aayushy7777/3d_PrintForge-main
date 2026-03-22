import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { globalLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import cartRouter from './routes/cart.js';
import paymentsRouter from './routes/payments.js';
import adminRouter from './routes/admin.js';
import reviewsRouter from './routes/reviews.js';

const app = express();

// Security and middleware
app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true
}));
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(globalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root API info
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to PrintForge Production API', version: '1.0.0' });
});

// Mount Routes
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/cart', cartRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reviews', reviewsRouter);

// Error Handling
app.use(errorHandler);

export default app;
