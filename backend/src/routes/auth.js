import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool, uid } from '../db.js';
import { signToken, authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, name, phone } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'Email đã tồn tại' });
    }

    const id = uid('usr_');
    const hash = bcrypt.hashSync(password, 10);
    await pool.query(
      'INSERT INTO users (id, email, password_hash, name, phone, role) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, email, hash, name, phone || null, 'customer']
    );

    const token = signToken({ id, email, name, role: 'customer' });
    res.json({ token, user: { id, email, name, phone: phone || null, role: 'customer' } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });
    }
    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.get('/me', authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

// ---------------------------------------------------------------------------
// Profile update / password change
// ---------------------------------------------------------------------------
router.put('/profile', authRequired, async (req, res) => {
  const { name, phone } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Thiếu họ và tên' });
  }
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2 WHERE id = $3 RETURNING id, email, name, phone, role',
      [String(name).trim(), phone || null, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.put('/password', authRequired, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Thiếu mật khẩu hiện tại hoặc mật khẩu mới' });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }
  try {
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!bcrypt.compareSync(currentPassword, result.rows[0].password_hash)) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
    }
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      bcrypt.hashSync(newPassword, 10),
      req.user.id,
    ]);
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

// ---------------------------------------------------------------------------
// Saved addresses
// ---------------------------------------------------------------------------
router.get('/addresses', authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );
    res.json(result.rows.map((r) => ({
      id: r.id,
      label: r.label,
      name: r.name,
      phone: r.phone,
      province: r.province,
      district: r.district,
      ward: r.ward,
      detail: r.detail,
      isDefault: r.is_default,
    })));
  } catch (err) {
    console.error('Addresses list error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.post('/addresses', authRequired, async (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.phone || !b.province || !b.district || !b.ward || !b.detail) {
    return res.status(400).json({ error: 'Thiếu thông tin địa chỉ' });
  }
  try {
    const id = uid('adr_');
    // Only one default address per user
    if (b.isDefault) {
      await pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [req.user.id]);
    }
    await pool.query(
      `INSERT INTO addresses (id, user_id, label, name, phone, province, district, ward, detail, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id, req.user.id, b.label || 'home', b.name, b.phone,
        b.province, b.district, b.ward, b.detail, !!b.isDefault,
      ]
    );
    res.status(201).json({ id, ...b, isDefault: !!b.isDefault });
  } catch (err) {
    console.error('Address create error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.put('/addresses/:id', authRequired, async (req, res) => {
  const b = req.body || {};
  try {
    if (b.isDefault) {
      await pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [req.user.id]);
    }
    const result = await pool.query(
      `UPDATE addresses SET label = $3, name = $4, phone = $5, province = $6,
         district = $7, ward = $8, detail = $9, is_default = $10
       WHERE id = $1 AND user_id = $2`,
      [
        req.params.id, req.user.id, b.label || 'home', b.name, b.phone,
        b.province, b.district, b.ward, b.detail, !!b.isDefault,
      ]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Address not found' });
    res.json({ id: req.params.id, ...b });
  } catch (err) {
    console.error('Address update error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.delete('/addresses/:id', authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Address not found' });
    res.json({ message: 'Đã xóa địa chỉ' });
  } catch (err) {
    console.error('Address delete error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

// ---------------------------------------------------------------------------
// My reviews
// ---------------------------------------------------------------------------
router.get('/reviews', authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, p.name AS product_name, p.slug AS product_slug, p.images
       FROM reviews r LEFT JOIN products p ON p.id = r.product_id
       WHERE r.user_id = $1 ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows.map((r) => ({
      id: r.id,
      productId: r.product_id,
      productName: r.product_name,
      productSlug: r.product_slug,
      productImage: (r.images && r.images[0]) || '',
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      isVerified: !!r.is_verified,
    })));
  } catch (err) {
    console.error('My reviews error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

export default router;
