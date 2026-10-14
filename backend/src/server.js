// Coffee Home Blend — Backend API
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initSchema, pool } from './db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const port = Number(process.env.PORT) || 4000;

async function start() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set. Provision Postgres on Render first.');
    }
    await initSchema();
    console.log('Database schema ready.');
  } catch (err) {
    console.error('DB init failed:', err);
    process.exit(1);
  }
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing pool...');
  await pool.end();
  process.exit(0);
});
