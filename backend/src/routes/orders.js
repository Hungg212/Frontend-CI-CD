import { Router } from 'express';
import { pool, uid } from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/', authRequired, async (req, res) => {
  const { items, shippingAddress, paymentMethod, note, shippingFee = 0, discount = 0 } = req.body || {};
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Giỏ hàng trống' });
  }
  if (!shippingAddress || !paymentMethod) {
    return res.status(400).json({ error: 'Thiếu địa chỉ hoặc phương thức thanh toán' });
  }

  try {
    // Recompute prices from DB
    const lineItems = [];
    for (const it of items) {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [it.productId]);
      if (result.rowCount === 0) {
        return res.status(400).json({ error: `Sản phẩm ${it.productId} không tồn tại` });
      }
      const p = result.rows[0];
      const price = p.sale_price || p.price;
      lineItems.push({
        productId: p.id,
        name: p.name,
        slug: p.slug,
        image: (p.images && p.images[0]) || '',
        price,
        quantity: it.quantity,
      });
    }

    const realSubtotal = lineItems.reduce((s, it) => s + it.price * it.quantity, 0);
    const total = realSubtotal + Number(shippingFee) - Number(discount);

    const id = uid('ord_');
    const orderNumber = 'CHB' + Date.now().toString().slice(-8);
    const status = paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING';
    const paymentStatus = 'PENDING';

    await pool.query(
      `INSERT INTO orders
        (id, order_number, user_id, items, subtotal, shipping_fee, discount, total,
         status, payment_method, payment_status, shipping_address, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        id, orderNumber, req.user.id, JSON.stringify(lineItems),
        realSubtotal, Number(shippingFee), Number(discount), total,
        status, paymentMethod, paymentStatus,
        JSON.stringify(shippingAddress), note || null,
      ]
    );

    res.json({
      id, orderNumber, items: lineItems,
      subtotal: realSubtotal, shippingFee: Number(shippingFee), discount: Number(discount), total,
      status, paymentMethod, paymentStatus,
      shippingAddress, note,
      createdAt: new Date().toISOString(),
      timeline: [{ status, timestamp: new Date().toISOString() }],
    });
  } catch (err) {
    console.error('Order create error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

function mapOrder(r) {
  return {
    id: r.id,
    orderNumber: r.order_number,
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

router.get('/', authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows.map(mapOrder));
  } catch (err) {
    console.error('Orders list error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

router.get('/:id', authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(mapOrder(result.rows[0]));
  } catch (err) {
    console.error('Order get error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

export default router;
