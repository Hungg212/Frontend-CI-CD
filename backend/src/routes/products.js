import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

function mapProduct(row) {
  if (!row) return null;
  const images = JSON.parse(row.images || '[]');
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description,
    price: row.price,
    salePrice: row.sale_price,
    discount: row.discount,
    category: row.category_slug,        // legacy: string name
    categorySlug: row.category_slug,
    imageUrl: images[0] || '',         // legacy
    images,
    rating: row.rating,
    reviewCount: row.review_count,
    averageRating: row.rating,          // legacy
    stock: row.stock,
    sku: row.sku,
    tags: JSON.parse(row.tags || '[]'),
    origin: row.origin,
    roastLevel: row.roast_level,
    flavorNotes: JSON.parse(row.flavor_notes || '[]'),
    brewingMethod: JSON.parse(row.brewing_method || '[]'),
    weight: row.weight,
    isFeatured: !!row.is_featured,
    isNewArrival: !!row.is_new_arrival,
    isBestSeller: !!row.is_best_seller,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get('/', (req, res) => {
  const {
    search, category, minPrice, maxPrice, featured, sortBy = 'newest', sortOrder = 'desc',
    page = 1, limit = 12,
  } = req.query;

  const where = [];
  const params = [];
  if (search) {
    where.push('(name LIKE ? OR short_description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    where.push('category_slug = ?');
    params.push(category);
  }
  if (minPrice) {
    where.push('price >= ?');
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    where.push('price <= ?');
    params.push(Number(maxPrice));
  }
  if (featured === 'true') where.push('is_featured = 1');

  const orderMap = {
    price_asc: 'price ASC',
    price_desc: 'price DESC',
    'price-asc': 'price ASC',
    'price-desc': 'price DESC',
    rating: 'rating DESC',
    'rating-desc': 'rating DESC',
    'averageRating-desc': 'rating DESC',
    newest: 'created_at DESC',
    'createdAt-desc': 'created_at DESC',
    'createdAt-asc': 'created_at ASC',
    bestseller: 'is_best_seller DESC, rating DESC',
  };
  const order = orderMap[sortBy] || 'created_at DESC';

  const offset = (Number(page) - 1) * Number(limit);
  const sql = `SELECT * FROM products ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${order} LIMIT ? OFFSET ?`;
  const rows = db.prepare(sql).all(...params, Number(limit), offset);
  const totalRow = db.prepare(`SELECT COUNT(*) as c FROM products ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`).get(...params);

  res.json({
    products: rows.map(mapProduct),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: totalRow.c,
      pages: Math.ceil(totalRow.c / Number(limit)),
      totalPages: Math.ceil(totalRow.c / Number(limit)),
    },
  });
});

router.get('/featured', (_req, res) => {
  const rows = db.prepare('SELECT * FROM products WHERE is_featured = 1 ORDER BY rating DESC LIMIT 12').all();
  res.json(rows.map(mapProduct));
});

router.get('/new-arrivals', (_req, res) => {
  const rows = db.prepare('SELECT * FROM products WHERE is_new_arrival = 1 ORDER BY created_at DESC LIMIT 12').all();
  res.json(rows.map(mapProduct));
});

router.get('/best-sellers', (_req, res) => {
  const rows = db.prepare('SELECT * FROM products WHERE is_best_seller = 1 ORDER BY rating DESC LIMIT 12').all();
  res.json(rows.map(mapProduct));
});

router.get('/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Product not found' });
  res.json(mapProduct(row));
});

router.get('/:id/reviews', (req, res) => {
  const rows = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(rows.map((r) => ({
    id: r.id,
    productId: r.product_id,
    userName: r.user_name,
    userAvatar: r.user_avatar,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    isVerified: !!r.is_verified,
  })));
});

router.post('/:id/reviews', (req, res) => {
  const { rating, comment } = req.body || {};
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating phải từ 1 đến 5' });
  }
  const id = 'rev_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  db.prepare(
    'INSERT INTO reviews (id, product_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)'
  ).run(id, req.params.id, 'Khách hàng', rating, comment || '');
  res.json({ id, productId: req.params.id, userName: 'Khách hàng', rating, comment: comment || '', createdAt: new Date().toISOString() });
});

export default router;
