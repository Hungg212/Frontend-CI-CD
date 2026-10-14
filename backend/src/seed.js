// Seed the PostgreSQL database from JSON data files.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { pool, initSchema, uid } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  await initSchema();
  console.log('Schema ready.');

  const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf8'));
  const categories = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/categories.json'), 'utf8'));
  console.log(`Seeding ${categories.length} categories, ${products.length} products...`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const c of categories) {
      const count = products.filter((p) => p.categorySlug === c.slug).length;
      await client.query(
        `INSERT INTO categories (id, name, slug, description, image, product_count)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description,
           image = EXCLUDED.image, product_count = EXCLUDED.product_count`,
        [c.id, c.name, c.slug, c.description, c.image, count]
      );
    }

    for (const p of products) {
      await client.query(
        `INSERT INTO products
          (id, name, slug, description, short_description, price, sale_price, discount,
           category_slug, images, rating, review_count, stock, sku, tags, origin,
           roast_level, flavor_notes, brewing_method, weight, is_featured,
           is_new_arrival, is_best_seller, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13,$14,$15::jsonb,$16,$17,$18::jsonb,$19::jsonb,$20,$21,$22,$23,$24,$25)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description,
           short_description = EXCLUDED.short_description, price = EXCLUDED.price,
           sale_price = EXCLUDED.sale_price, discount = EXCLUDED.discount,
           category_slug = EXCLUDED.category_slug, images = EXCLUDED.images,
           rating = EXCLUDED.rating, review_count = EXCLUDED.review_count,
           stock = EXCLUDED.stock, sku = EXCLUDED.sku, tags = EXCLUDED.tags,
           origin = EXCLUDED.origin, roast_level = EXCLUDED.roast_level,
           flavor_notes = EXCLUDED.flavor_notes, brewing_method = EXCLUDED.brewing_method,
           weight = EXCLUDED.weight, is_featured = EXCLUDED.is_featured,
           is_new_arrival = EXCLUDED.is_new_arrival, is_best_seller = EXCLUDED.is_best_seller,
           updated_at = NOW()`,
        [
          p.id, p.name, p.slug, p.description, p.shortDescription,
          p.price, p.salePrice || null, p.discount || null,
          p.categorySlug,
          JSON.stringify(p.images || []),
          p.rating || 0, p.reviewCount || 0, p.stock || 0, p.sku || '',
          JSON.stringify(p.tags || []),
          p.origin || '', p.roastLevel || '',
          JSON.stringify(p.flavorNotes || []),
          JSON.stringify(p.brewingMethod || []),
          p.weight || '',
          p.isFeatured || false,
          p.isNewArrival || false,
          p.isBestSeller || false,
          p.createdAt || new Date().toISOString(),
          p.updatedAt || new Date().toISOString(),
        ]
      );
    }

    // Seed admin + demo customer
    const adminId = uid('usr_');
    const customerId = uid('usr_');
    await client.query(
      `INSERT INTO users (id, email, password_hash, name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [adminId, 'admin@coffeehome.vn', bcrypt.hashSync('admin123', 10), 'Admin', '0900000000', 'admin']
    );
    await client.query(
      `INSERT INTO users (id, email, password_hash, name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [customerId, 'demo@coffeehome.vn', bcrypt.hashSync('demo1234', 10), 'Khách hàng Demo', '0901234567', 'customer']
    );

    await client.query('COMMIT');
    console.log('Seeded successfully.');
    console.log('Admin: admin@coffeehome.vn / admin123');
    console.log('Customer: demo@coffeehome.vn / demo1234');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
