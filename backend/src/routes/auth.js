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

export default router;
