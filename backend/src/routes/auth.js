import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, uid } from '../db.js';
import { signToken, authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { email, password, name, phone } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email đã tồn tại' });

  const id = uid('usr_');
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(
    'INSERT INTO users (id, email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, email, hash, name, phone || null, 'customer');

  const token = signToken({ id, email, name, role: 'customer' });
  res.json({ token, user: { id, email, name, phone: phone || null, role: 'customer' } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });
  }
  const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role },
  });
});

router.get('/me', authRequired, (req, res) => {
  const user = db.prepare('SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

export default router;
