import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

function mapCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: row.image,
    productCount: row.product_count,
  };
}

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows.map(mapCategory));
  } catch (err) {
    console.error('Categories list error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE slug = $1', [req.params.slug]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(mapCategory(result.rows[0]));
  } catch (err) {
    console.error('Category get error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

export default router;
