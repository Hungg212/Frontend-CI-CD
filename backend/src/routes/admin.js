import { Router } from 'express';
import { pool, uid } from '../db.js';
import { authRequired, adminRequired } from '../middleware/auth.js';

const router = Router();

// All admin routes require an authenticated admin.
router.use(authRequired, adminRequired);

function mapProduct(row) {
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

function mapOrder(r) {
  return {
    id: r.id,
    orderNumber: r.order_number,
    userId: r.user_id,
    customerName: r.customer_name || null,
    customerEmail: r.customer_email || null,
    items: r.items,
    subtotal: r.subtotal,
    shippingFee: r.shipping_fee,
    discount: r.discount,
    total: r.total,
    status: r.status,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    shippingAddress: r.shipping_address,
    note: r.note,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapCustomer(r) {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    phone: r.phone,
    role: r.role,
    orderCount: Number(r.order_count) || 0,
    totalSpent: Number(r.total_spent) || 0,
    createdAt: r.created_at,
  };
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
router.get('/products', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const where = [];
    const params = [];
    let i = 1;
    if (search) {
      where.push(`(p.name ILIKE $${i} OR p.sku ILIKE $${i})`);
      params.push(`%${search}%`);
      i += 1;
    }
    if (category) {
      where.push(`p.category_slug = $${i}`);
      params.push(category);
      i += 1;
    }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const offset = (Number(page) - 1) * Number(limit);
    const rows = (await pool.query(
      `SELECT p.*, c.name AS category_name FROM products p
       LEFT JOIN categories c ON c.slug = p.category_slug
       ${whereClause} ORDER BY p.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      [...params, Number(limit), offset]
    )).rows;
    const total = (await pool.query(
      `SELECT COUNT(*)::int AS c FROM products p ${whereClause}`,
      params
    )).rows[0].c;
    res.json({
      products: rows.map(mapProduct),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('Admin products list error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const row = (await pool.query(
      `SELECT p.*, c.name AS category_name FROM products p
       LEFT JOIN categories c ON c.slug = p.category_slug WHERE p.id = $1`,
      [req.params.id]
    )).rows[0];
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(mapProduct(row));
  } catch (err) {
    console.error('Admin product get error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.name || !b.slug || b.price == null) {
      return res.status(400).json({ error: 'Thiếu name, slug hoặc price' });
    }
    const id = b.id || uid('prod_');
    await pool.query(
      `INSERT INTO products
        (id, name, slug, description, short_description, price, sale_price, discount,
         category_slug, images, rating, review_count, stock, sku, tags, origin,
         roast_level, flavor_notes, brewing_method, weight, is_featured,
         is_new_arrival, is_best_seller)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13,$14,$15::jsonb,$16,$17,$18::jsonb,$19::jsonb,$20,$21,$22,$23)
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
        id, b.name, b.slug, b.description || '', b.shortDescription || '',
        Number(b.price), b.salePrice != null ? Number(b.salePrice) : null,
        b.discount != null ? Number(b.discount) : null,
        b.categorySlug || 'ca-phe-hat',
        JSON.stringify(b.images || []),
        Number(b.rating) || 0, Number(b.reviewCount) || 0, Number(b.stock) || 0,
        b.sku || '', JSON.stringify(b.tags || []), b.origin || '', b.roastLevel || '',
        JSON.stringify(b.flavorNotes || []), JSON.stringify(b.brewingMethod || []),
        b.weight || '', !!b.isFeatured, !!b.isNewArrival, !!b.isBestSeller,
      ]
    );
    res.status(201).json({ id, ...b });
  } catch (err) {
    console.error('Admin product create error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const b = req.body || {};
    const exists = (await pool.query('SELECT id FROM products WHERE id = $1', [req.params.id])).rowCount;
    if (!exists) return res.status(404).json({ error: 'Product not found' });
    await pool.query(
      `UPDATE products SET
         name = $2, slug = $3, description = $4, short_description = $5,
         price = $6, sale_price = $7, discount = $8, category_slug = $9,
         images = $10::jsonb, stock = $11, sku = $12, tags = $13::jsonb,
         origin = $14, roast_level = $15, flavor_notes = $16::jsonb,
         brewing_method = $17::jsonb, weight = $18,
         is_featured = $19, is_new_arrival = $20, is_best_seller = $21,
         updated_at = NOW()
       WHERE id = $1`,
      [
        req.params.id, b.name, b.slug, b.description || '', b.shortDescription || '',
        Number(b.price), b.salePrice != null ? Number(b.salePrice) : null,
        b.discount != null ? Number(b.discount) : null, b.categorySlug || 'ca-phe-hat',
        JSON.stringify(b.images || []), Number(b.stock) || 0, b.sku || '',
        JSON.stringify(b.tags || []), b.origin || '', b.roastLevel || '',
        JSON.stringify(b.flavorNotes || []), JSON.stringify(b.brewingMethod || []),
        b.weight || '', !!b.isFeatured, !!b.isNewArrival, !!b.isBestSeller,
      ]
    );
    res.json({ id: req.params.id, ...b });
  } catch (err) {
    console.error('Admin product update error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (err) {
    console.error('Admin product delete error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
router.get('/orders', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const where = [];
    const params = [];
    let i = 1;
    if (status) {
      where.push(`o.status = $${i}`);
      params.push(status);
      i += 1;
    }
    if (search) {
      where.push(`(o.order_number ILIKE $${i} OR u.email ILIKE $${i} OR u.name ILIKE $${i})`);
      params.push(`%${search}%`);
      i += 1;
    }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const offset = (Number(page) - 1) * Number(limit);
    const rows = (await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o LEFT JOIN users u ON u.id = o.user_id
       ${whereClause} ORDER BY o.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      [...params, Number(limit), offset]
    )).rows;
    const total = (await pool.query(
      `SELECT COUNT(*)::int AS c FROM orders o LEFT JOIN users u ON u.id = o.user_id ${whereClause}`,
      params
    )).rows[0].c;
    res.json({
      orders: rows.map(mapOrder),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('Admin orders list error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const row = (await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE o.id = $1`,
      [req.params.id]
    )).rows[0];
    if (!row) return res.status(404).json({ error: 'Order not found' });
    res.json(mapOrder(row));
  } catch (err) {
    console.error('Admin order get error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }
    const result = await pool.query(
      'UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1',
      [req.params.id, status]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ id: req.params.id, status });
  } catch (err) {
    console.error('Admin order status error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
router.get('/customers', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const where = [];
    const params = [];
    let i = 1;
    if (search) {
      where.push(`(u.name ILIKE $${i} OR u.email ILIKE $${i} OR u.phone ILIKE $${i})`);
      params.push(`%${search}%`);
      i += 1;
    }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const offset = (Number(page) - 1) * Number(limit);
    const rows = (await pool.query(
      `SELECT u.id, u.email, u.name, u.phone, u.role, u.created_at,
              COUNT(o.id)::int AS order_count,
              COALESCE(SUM(o.total), 0)::int AS total_spent
       FROM users u LEFT JOIN orders o ON o.user_id = u.id
       ${whereClause}
       GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      [...params, Number(limit), offset]
    )).rows;
    const total = (await pool.query(
      `SELECT COUNT(*)::int AS c FROM users u ${whereClause}`,
      params
    )).rows[0].c;
    res.json({
      customers: rows.map(mapCustomer),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('Admin customers error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.get('/customers/:id', async (req, res) => {
  try {
    const row = (await pool.query(
      `SELECT u.id, u.email, u.name, u.phone, u.role, u.created_at,
              COUNT(o.id)::int AS order_count,
              COALESCE(SUM(o.total), 0)::int AS total_spent
       FROM users u LEFT JOIN orders o ON o.user_id = u.id
       WHERE u.id = $1 GROUP BY u.id`,
      [req.params.id]
    )).rows[0];
    if (!row) return res.status(404).json({ error: 'Customer not found' });
    const orders = (await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    )).rows;
    res.json({ ...mapCustomer(row), orders: orders.map(mapOrder) });
  } catch (err) {
    console.error('Admin customer get error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
router.get('/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const rows = (await pool.query(
      `SELECT r.*, p.name AS product_name, p.slug AS product_slug
       FROM reviews r LEFT JOIN products p ON p.id = r.product_id
       ORDER BY r.created_at DESC LIMIT $1 OFFSET $2`,
      [Number(limit), offset]
    )).rows;
    const total = (await pool.query('SELECT COUNT(*)::int AS c FROM reviews')).rows[0].c;
    res.json({
      reviews: rows.map((r) => ({
        id: r.id,
        productId: r.product_id,
        productName: r.product_name,
        productSlug: r.product_slug,
        userId: r.user_id,
        userName: r.user_name,
        userAvatar: r.user_avatar,
        rating: r.rating,
        comment: r.comment,
        isVerified: r.is_verified,
        createdAt: r.created_at,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('Admin reviews error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (err) {
    console.error('Admin review delete error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
router.get('/categories', async (_req, res) => {
  try {
    const rows = (await pool.query('SELECT * FROM categories ORDER BY name')).rows;
    res.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      image: r.image,
      productCount: r.product_count,
    })));
  } catch (err) {
    console.error('Admin categories error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.name || !b.slug) return res.status(400).json({ error: 'Thiếu name hoặc slug' });
    const id = b.id || uid('cat_');
    await pool.query(
      `INSERT INTO categories (id, name, slug, description, image, product_count)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description,
         image = EXCLUDED.image, product_count = EXCLUDED.product_count`,
      [id, b.name, b.slug, b.description || '', b.image || '', Number(b.productCount) || 0]
    );
    res.status(201).json({ id, ...b });
  } catch (err) {
    console.error('Admin category create error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const b = req.body || {};
    await pool.query(
      `UPDATE categories SET name = $2, slug = $3, description = $4, image = $5, product_count = $6
       WHERE id = $1`,
      [req.params.id, b.name, b.slug, b.description || '', b.image || '', Number(b.productCount) || 0]
    );
    res.json({ id: req.params.id, ...b });
  } catch (err) {
    console.error('Admin category update error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Đã xóa danh mục' });
  } catch (err) {
    console.error('Admin category delete error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------
router.get('/coupons', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM coupons WHERE is_active = TRUE ORDER BY created_at DESC`
    );
    res.json(result.rows.map(mapCoupon));
  } catch (err) {
    console.error('Admin coupons error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.code) return res.status(400).json({ error: 'Thiếu mã coupon' });
    const id = b.id || uid('cpn_');
    // Accept both naming conventions used by the UI and the API layer.
    const type = normalizeCouponType(b.discountType ?? b.type);
    const value = Number(b.discountValue ?? b.value) || 0;
    const minOrder = Number(b.minOrderValue ?? b.minOrder) || 0;
    const usageLimit = Number(b.maxUses ?? b.usageLimit) || 0;
    await pool.query(
      `INSERT INTO coupons (id, code, description, type, value, min_order, usage_limit, used_count, is_active, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET
         code = EXCLUDED.code, description = EXCLUDED.description,
         type = EXCLUDED.type, value = EXCLUDED.value,
         min_order = EXCLUDED.min_order, usage_limit = EXCLUDED.usage_limit,
         is_active = EXCLUDED.is_active, expires_at = EXCLUDED.expires_at`,
      [
        id, String(b.code).toUpperCase(), b.description || '', type, value, minOrder, usageLimit,
        Number(b.usedCount) || 0, b.isActive !== false, b.expiresAt || null,
      ]
    );
    res.status(201).json({ id, ...b });
  } catch (err) {
    console.error('Admin coupon create error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM coupons WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ message: 'Đã xóa coupon' });
  } catch (err) {
    console.error('Admin coupon delete error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

function normalizeCouponType(t) {
  const s = String(t || 'percent').toLowerCase();
  return s === 'fixed' || s === 'fixed_amount' ? 'fixed' : 'percent';
}

function mapCoupon(r) {
  return {
    id: r.id,
    code: r.code,
    description: r.description || '',
    discountType: r.type === 'fixed' ? 'FIXED' : 'PERCENTAGE',
    discountValue: r.value,
    minOrderValue: r.min_order,
    maxUses: r.usage_limit,
    usedCount: r.used_count,
    isActive: r.is_active,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
  };
}

// ---------------------------------------------------------------------------
// Stats / Analytics
// ---------------------------------------------------------------------------
router.get('/stats', async (_req, res) => {
  try {
    const [products, orders, customers, revenue] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS c FROM products'),
      pool.query('SELECT COUNT(*)::int AS c FROM orders'),
      pool.query("SELECT COUNT(*)::int AS c FROM users WHERE role = 'customer'"),
      pool.query("SELECT COALESCE(SUM(total),0)::int AS s FROM orders WHERE status <> 'CANCELLED'"),
    ]);
    const byStatus = (await pool.query(
      'SELECT status, COUNT(*)::int AS c FROM orders GROUP BY status'
    )).rows;
    const topProducts = (await pool.query(
      `SELECT p.id, p.name, p.slug, p.image_url, p.price, p.stock, p.rating,
              COALESCE(SUM((item->>'quantity')::int), 0)::int AS sold
       FROM products p
       LEFT JOIN LATERAL (
         SELECT items FROM orders o, jsonb_array_elements(o.items) item
         WHERE item->>'productId' = p.id AND o.status <> 'CANCELLED'
       ) x ON TRUE
       GROUP BY p.id ORDER BY sold DESC, p.rating DESC LIMIT 5`
    )).rows;
    const recentOrders = (await pool.query(
      `SELECT o.id, o.order_number, o.total, o.status, o.created_at, u.name AS customer_name
       FROM orders o LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC LIMIT 5`
    )).rows;

    res.json({
      totalProducts: products.rows[0].c,
      totalOrders: orders.rows[0].c,
      totalCustomers: customers.rows[0].c,
      totalRevenue: revenue.rows[0].s,
      ordersByStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.c])),
      topProducts: topProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        stock: p.stock,
        rating: Number(p.rating) || 0,
        sold: p.sold,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        total: o.total,
        status: o.status,
        customerName: o.customer_name,
        createdAt: o.created_at,
      })),
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

export default router;
