// Seed the SQLite database from JSON data files.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { db, initSchema, uid } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initSchema();

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/categories.json'), 'utf8'));

console.log(`Seeding ${categories.length} categories, ${products.length} products...`);

const insertCat = db.prepare(
  'INSERT OR REPLACE INTO categories (id, name, slug, description, image, product_count) VALUES (?, ?, ?, ?, ?, ?)'
);
const insertProd = db.prepare(`
  INSERT OR REPLACE INTO products
  (id, name, slug, description, short_description, price, sale_price, discount, category_slug, images, rating, review_count, stock, sku, tags, origin, roast_level, flavor_notes, brewing_method, weight, is_featured, is_new_arrival, is_best_seller, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const txn = db.transaction(() => {
  for (const c of categories) {
    const count = products.filter((p) => p.categorySlug === c.slug).length;
    insertCat.run(c.id, c.name, c.slug, c.description, c.image, count);
  }
  for (const p of products) {
    insertProd.run(
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
      p.isFeatured ? 1 : 0,
      p.isNewArrival ? 1 : 0,
      p.isBestSeller ? 1 : 0,
      p.createdAt || new Date().toISOString(),
      p.updatedAt || new Date().toISOString(),
    );
  }

  // Seed a default admin and a demo customer
  const adminId = uid('usr_');
  const customerId = uid('usr_');
  const insertUser = db.prepare(
    'INSERT OR IGNORE INTO users (id, email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?, ?)'
  );
  insertUser.run(adminId, 'admin@coffeehome.vn', bcrypt.hashSync('admin123', 10), 'Admin', '0900000000', 'admin');
  insertUser.run(customerId, 'demo@coffeehome.vn', bcrypt.hashSync('demo1234', 10), 'Khách hàng Demo', '0901234567', 'customer');
});
txn();

console.log('Seeded successfully.');
console.log('Admin: admin@coffeehome.vn / admin123');
console.log('Customer: demo@coffeehome.vn / demo1234');
