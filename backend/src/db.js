// Database connection (PostgreSQL via pg)
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set. Did you provision a Postgres instance on Render?');
}

export const pool = new Pool({
  connectionString,
  ssl: connectionString && connectionString.includes('render.com')
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on('error', (err) => {
  console.error('Unexpected pg pool error', err);
});

export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

export async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      province TEXT NOT NULL,
      district TEXT NOT NULL,
      ward TEXT NOT NULL,
      detail TEXT NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      product_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      short_description TEXT,
      price INTEGER NOT NULL,
      sale_price INTEGER,
      discount INTEGER,
      category_slug TEXT NOT NULL,
      images JSONB NOT NULL DEFAULT '[]'::jsonb,
      rating REAL NOT NULL DEFAULT 0,
      review_count INTEGER NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      sku TEXT,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      origin TEXT,
      roast_level TEXT,
      flavor_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
      brewing_method JSONB NOT NULL DEFAULT '[]'::jsonb,
      weight TEXT,
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
      is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_slug);
    CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
    CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival);
    CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller);

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      user_name TEXT NOT NULL,
      user_avatar TEXT,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      is_verified BOOLEAN NOT NULL DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      items JSONB NOT NULL,
      subtotal INTEGER NOT NULL,
      shipping_fee INTEGER NOT NULL,
      discount INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'PENDING',
      shipping_address JSONB NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
  `);
}

export function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
