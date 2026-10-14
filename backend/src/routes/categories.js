import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    image: r.image,
    productCount: r.product_count,
  })));
});

router.get('/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Category not found' });
  res.json({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: row.image,
    productCount: row.product_count,
  });
});

export default router;
