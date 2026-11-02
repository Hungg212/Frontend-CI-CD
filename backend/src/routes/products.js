import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

function mapProduct(row) {
  if (!row) return null;
  const images = row.images || [];
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description,
    price: row.price,
    salePrice: row.sale_price,
    discount: row.discount,
    category: row.category_name || row.category_slug,
    categorySlug: row.category_slug,
    imageUrl: images[0] || '',
    images,
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count,
    averageRating: Number(row.rating) || 0,
    stock: row.stock,
    sku: row.sku,
    tags: row.tags || [],
    origin: row.origin,
    roastLevel: row.roast_level,
    flavorNotes: row.flavor_notes || [],
    brewingMethod: row.brewing_method || [],
    weight: row.weight,
    isFeatured: !!row.is_featured,
    isNewArrival: !!row.is_new_arrival,
    isBestSeller: !!row.is_best_seller,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get('/', async (req, res) => {
  const {
    search, category, minPrice, maxPrice, featured, sortBy = 'newest', sortOrder = 'desc',
    page = 1, limit = 12,
  } = req.query;

  const where = [];
  const params = [];
  let i = 1;
  if (search) {
    where.push(`(p.name ILIKE $${i} OR p.short_description ILIKE $${i + 1})`);
    params.push(`%${search}%`, `%${search}%`);
    i += 2;
  }
  if (category) {
    where.push(`p.category_slug = $${i}`);
    params.push(category);
    i += 1;
  }
  if (minPrice) {
    where.push(`p.price >= $${i}`);
    params.push(Number(minPrice));
    i += 1;
  }
  if (maxPrice) {
    where.push(`p.price <= $${i}`);
    params.push(Number(maxPrice));
    i += 1;
  }
  if (featured === 'true') {
    where.push('p.is_featured = TRUE');
  }

  const orderMap = {
    'price-asc': 'p.price ASC',
    'price-desc': 'p.price DESC',
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    rating: 'p.rating DESC',
    'rating-desc': 'p.rating DESC',
    'averageRating-desc': 'p.rating DESC',
    newest: 'p.created_at DESC',
    'createdAt-desc': 'p.created_at DESC',
    'createdAt-asc': 'p.created_at ASC',
    bestseller: 'p.is_best_seller DESC, p.rating DESC',
  };
  let order = orderMap[sortBy] || 'p.created_at DESC';
  // Generic sortBy with explicit direction: ?sortBy=price&sortOrder=asc
  if (!orderMap[sortBy] && /^[a-z_]+$/i.test(String(sortBy))) {
    const col = String(sortBy).toLowerCase();
    const allowed = ['price', 'rating', 'created_at', 'name', 'review_count', 'stock'];
    if (allowed.includes(col)) {
      const dir = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      order = `p.${col} ${dir}`;
    }
  }

  const offset = (Number(page) - 1) * Number(limit);
  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const sql = `SELECT p.*, c.name AS category_name
              FROM products p
              LEFT JOIN categories c ON c.slug = p.category_slug
              ${whereClause} ORDER BY ${order} LIMIT $${i} OFFSET $${i + 1}`;
  const rows = (await pool.query(sql, [...params, Number(limit), offset])).rows;
  const totalRow = (await pool.query(
    `SELECT COUNT(*)::int AS c FROM products p ${whereClause}`,
    params
  )).rows[0];

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

router.get('/featured', async (_req, res) => {
  const rows = (await pool.query(
    'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.slug = p.category_slug WHERE p.is_featured = TRUE ORDER BY p.rating DESC LIMIT 12'
  )).rows;
  res.json(rows.map(mapProduct));
});

router.get('/new-arrivals', async (_req, res) => {
  const rows = (await pool.query(
    'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.slug = p.category_slug WHERE p.is_new_arrival = TRUE ORDER BY p.created_at DESC LIMIT 12'
  )).rows;
  res.json(rows.map(mapProduct));
});

router.get('/best-sellers', async (_req, res) => {
  const rows = (await pool.query(
    'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.slug = p.category_slug WHERE p.is_best_seller = TRUE ORDER BY p.rating DESC LIMIT 12'
  )).rows;
  res.json(rows.map(mapProduct));
});

router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.slug = p.category_slug WHERE p.slug = $1',
      [req.params.slug]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(mapProduct(result.rows[0]));
  } catch (err) {
    console.error('Product get error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.get('/:id/reviews', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(result.rows.map((r) => ({
      id: r.id,
      productId: r.product_id,
      userName: r.user_name,
      userAvatar: r.user_avatar,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      isVerified: !!r.is_verified,
    })));
  } catch (err) {
    console.error('Reviews get error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.post('/:id/reviews', async (req, res) => {
  const { rating, comment } = req.body || {};
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating phải từ 1 đến 5' });
  }
  try {
    const id = 'rev_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await pool.query(
      'INSERT INTO reviews (id, product_id, user_name, rating, comment) VALUES ($1, $2, $3, $4, $5)',
      [id, req.params.id, 'Khách hàng', rating, comment || '']
    );
    res.json({
      id, productId: req.params.id, userName: 'Khách hàng',
      rating, comment: comment || '', createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Review post error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

export default router;
