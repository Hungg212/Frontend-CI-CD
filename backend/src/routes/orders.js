import { Router } from 'express';
import { db, uid } from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/', authRequired, (req, res) => {
  const { items, shippingAddress, paymentMethod, note, subtotal, shippingFee = 0, discount = 0 } = req.body || {};
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Giỏ hàng trống' });
  }
  if (!shippingAddress || !paymentMethod) {
    return res.status(400).json({ error: 'Thiếu địa chỉ hoặc phương thức thanh toán' });
  }

  // Recompute prices from DB to prevent tampering
  const lineItems = items.map((it) => {
    const p = db.prepare('SELECT * FROM products WHERE id = ?').get(it.productId);
    if (!p) throw new Error(`Sản phẩm ${it.productId} không tồn tại`);
    const price = p.sale_price || p.price;
    return {
      productId: p.id,
      name: p.name,
      slug: p.slug,
      image: JSON.parse(p.images || '[]')[0] || '',
      price,
      quantity: it.quantity,
    };
  });

  const realSubtotal = lineItems.reduce((s, it) => s + it.price * it.quantity, 0);
  const total = realSubtotal + Number(shippingFee) - Number(discount);

  const id = uid('ord_');
  const orderNumber = 'CHB' + Date.now().toString().slice(-8);
  const status = paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING';
  const paymentStatus = paymentMethod === 'COD' ? 'PENDING' : 'PENDING';

  db.prepare(
    `INSERT INTO orders (id, order_number, user_id, items, subtotal, shipping_fee, discount, total, status, payment_method, payment_status, shipping_address, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, orderNumber, req.user.id, JSON.stringify(lineItems),
    realSubtotal, Number(shippingFee), Number(discount), total,
    status, paymentMethod, paymentStatus,
    JSON.stringify(shippingAddress), note || null,
  );

  res.json({
    id, orderNumber, items: lineItems,
    subtotal: realSubtotal, shippingFee: Number(shippingFee), discount: Number(discount), total,
    status, paymentMethod, paymentStatus,
    shippingAddress, note,
    createdAt: new Date().toISOString(),
    timeline: [{ status, timestamp: new Date().toISOString() }],
  });
});

router.get('/', authRequired, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(rows.map((r) => ({
    id: r.id,
    orderNumber: r.order_number,
    items: JSON.parse(r.items),
    subtotal: r.subtotal,
    shippingFee: r.shipping_fee,
    discount: r.discount,
    total: r.total,
    status: r.status,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    shippingAddress: JSON.parse(r.shipping_address),
    note: r.note,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  })));
});

router.get('/:id', authRequired, (req, res) => {
  const r = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!r) return res.status(404).json({ error: 'Order not found' });
  res.json({
    id: r.id,
    orderNumber: r.order_number,
    items: JSON.parse(r.items),
    subtotal: r.subtotal,
    shippingFee: r.shipping_fee,
    discount: r.discount,
    total: r.total,
    status: r.status,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    shippingAddress: JSON.parse(r.shipping_address),
    note: r.note,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  });
});

export default router;
