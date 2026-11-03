import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Map a coupon row to the shape the storefront expects.
function mapCoupon(r) {
  return {
    id: r.id,
    code: r.code,
    type: r.type === 'fixed' ? 'FIXED' : 'PERCENT',
    value: r.value,
    minOrderValue: r.min_order,
    maxDiscount: null,
    usageLimit: r.usage_limit,
    usedCount: r.used_count,
    validFrom: r.created_at,
    validTo: r.expires_at,
    isActive: r.is_active,
  };
}

// Public list of active coupons so the storefront can show available codes.
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM coupons WHERE is_active = TRUE ORDER BY created_at DESC`
    );
    res.json(result.rows.map(mapCoupon));
  } catch (err) {
    console.error('Coupons list error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

// Validate a coupon code and return its details (public, used at checkout).
router.get('/validate', async (req, res) => {
  try {
    const code = String(req.query.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Thiếu mã giảm giá' });

    const result = await pool.query('SELECT * FROM coupons WHERE code = $1', [code]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Mã giảm giá không tồn tại hoặc đã hết hạn' });
    }

    const c = result.rows[0];
    if (!c.is_active) {
      return res.status(404).json({ error: 'Mã giảm giá không tồn tại hoặc đã hết hạn' });
    }
    if (c.expires_at && new Date(c.expires_at).getTime() < Date.now()) {
      return res.status(404).json({ error: 'Mã giảm giá đã hết hạn' });
    }
    if (c.usage_limit > 0 && c.used_count >= c.usage_limit) {
      return res.status(404).json({ error: 'Mã giảm giá đã hết lượt sử dụng' });
    }

    res.json(mapCoupon(c));
  } catch (err) {
    console.error('Coupon validate error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

export default router;
