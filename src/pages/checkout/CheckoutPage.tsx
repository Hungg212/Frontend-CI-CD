import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useOrderStore } from '@/stores/orderStore';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { Button, Spinner } from '@/components/ui';
import type { Order } from '@/types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'MOMO' | 'CREDIT_CARD';
type IconComponent = typeof Banknote;

const paymentOptions: { value: PaymentMethod; label: string; icon: IconComponent; desc: string }[] = [
  { value: 'COD', label: 'Thanh toán khi nhận hàng (COD)', icon: Banknote, desc: 'Trả tiền mặt cho shipper' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng', icon: CreditCard, desc: 'Vietcombank, Techcombank, ...' },
  { value: 'MOMO', label: 'Ví MoMo', icon: Smartphone, desc: 'Quét QR MoMo' },
  { value: 'CREDIT_CARD', label: 'Thẻ tín dụng / Ghi nợ', icon: CreditCard, desc: 'Visa, Mastercard, JCB' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const shippingFee = useCartStore((s) => s.getShippingFee());
  const total = useCartStore((s) => s.getTotal());
  const discount = useCartStore((s) => s.getDiscount());
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    province: '',
    district: '',
    ward: '',
    detail: '',
    note: '',
  });
  const [payment, setPayment] = useState<PaymentMethod>('COD');
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 font-display text-3xl font-bold text-coffee-900">Giỏ hàng trống</h1>
        <p className="mb-6 text-coffee-600">Bạn cần thêm sản phẩm trước khi thanh toán.</p>
        <Link to="/products" className="inline-block rounded-lg bg-coffee-700 px-6 py-3 font-semibold text-white hover:bg-coffee-800">
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  const handleChange = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.province || !form.district || !form.ward || !form.detail) {
      useNotificationStore.getState().warning('Thiếu thông tin', 'Vui lòng điền đầy đủ địa chỉ giao hàng');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: {
          label: 'home' as const,
          name: form.name,
          phone: form.phone,
          province: form.province,
          district: form.district,
          ward: form.ward,
          detail: form.detail,
          isDefault: false,
        },
        paymentMethod: payment,
        note: form.note,
        subtotal,
        shippingFee,
        discount,
      };
      // If not logged in, create a quick guest order via /api/orders without auth — fallback to localStorage
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
      const apiBase = baseUrl.endsWith('/api') ? baseUrl : (baseUrl ? `${baseUrl}/api` : '/api');
      const res = await fetch(`${apiBase}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Đặt hàng thất bại');
      }
      const order = await res.json();
      // Record the real API order in the local store so "Đơn hàng của tôi" shows it
      useOrderStore.getState().createOrder({
        id: order.id,
        orderNumber: order.orderNumber,
        items: (order.items as Array<Record<string, unknown>>).map((it) => ({
          product: {
            id: it.productId as string,
            slug: (it.slug as string) || '',
            name: it.name as string,
            imageUrl: (it.image as string) || '',
            price: it.price as number,
          } as unknown as Order['items'][number]['product'],
          quantity: it.quantity as number,
          price: it.price as number,
        })),
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        discount: order.discount,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        shippingAddress: order.shippingAddress,
        note: order.note,
        createdAt: order.createdAt,
        updatedAt: order.createdAt,
        timeline: order.timeline || [{ status: order.status, timestamp: order.createdAt }],
      });
      clearCart();
      useNotificationStore.getState().success('Đặt hàng thành công!', `Mã đơn: ${order.orderNumber}`);
      navigate(`/order-success/${order.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể đặt hàng';
      useNotificationStore.getState().error('Lỗi', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
        <h1 className="mb-6 font-display text-3xl font-bold text-coffee-900">Thanh toán</h1>
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Shipping address */}
            <section className="rounded-2xl border border-warm-200 bg-white p-6">
              <h2 className="mb-4 font-display text-xl font-semibold text-coffee-900">Địa chỉ giao hàng</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  value={form.name}
                  onChange={handleChange('name')}
                  className="rounded-lg border border-warm-200 bg-white px-3 py-2.5 text-coffee-900 placeholder-coffee-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Họ và tên *"
                />
                <input
                  required
                  value={form.phone}
                  onChange={handleChange('phone')}
                  className="rounded-lg border border-warm-200 bg-white px-3 py-2.5 text-coffee-900 placeholder-coffee-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Số điện thoại *"
                />
                <input
                  value={form.email}
                  onChange={handleChange('email')}
                  className="rounded-lg border border-warm-200 bg-white px-3 py-2.5 text-coffee-900 placeholder-coffee-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 sm:col-span-2"
                  placeholder="Email"
                />
                <input
                  required
                  value={form.detail}
                  onChange={handleChange('detail')}
                  className="rounded-lg border border-warm-200 bg-white px-3 py-2.5 text-coffee-900 placeholder-coffee-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 sm:col-span-2"
                  placeholder="Số nhà, tên đường *"
                />
                <input
                  required
                  value={form.ward}
                  onChange={handleChange('ward')}
                  className="rounded-lg border border-warm-200 bg-white px-3 py-2.5 text-coffee-900 placeholder-coffee-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Phường/Xã *"
                />
                <input
                  required
                  value={form.district}
                  onChange={handleChange('district')}
                  className="rounded-lg border border-warm-200 bg-white px-3 py-2.5 text-coffee-900 placeholder-coffee-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Quận/Huyện *"
                />
                <input
                  required
                  value={form.province}
                  onChange={handleChange('province')}
                  className="rounded-lg border border-warm-200 bg-white px-3 py-2.5 text-coffee-900 placeholder-coffee-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 sm:col-span-2"
                  placeholder="Tỉnh/Thành phố *"
                />
                <textarea
                  value={form.note}
                  onChange={handleChange('note')}
                  rows={2}
                  className="rounded-lg border border-warm-200 bg-white px-3 py-2.5 text-coffee-900 placeholder-coffee-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 sm:col-span-2"
                  placeholder="Ghi chú (tùy chọn)"
                />
              </div>
            </section>

            {/* Payment method */}
            <section className="rounded-2xl border border-warm-200 bg-white p-6">
              <h2 className="mb-4 font-display text-xl font-semibold text-coffee-900">Phương thức thanh toán</h2>
              <div className="space-y-3">
                {paymentOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                      payment === opt.value ? 'border-amber-500 bg-amber-50' : 'border-warm-200 hover:border-amber-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={payment === opt.value}
                      onChange={() => setPayment(opt.value)}
                      className="mt-1 h-4 w-4 text-amber-600"
                    />
                    <opt.icon className="mt-0.5 h-5 w-5 text-amber-700" />
                    <div>
                      <div className="font-medium text-coffee-900">{opt.label}</div>
                      <div className="text-sm text-coffee-600">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Order summary */}
          <aside className="h-fit rounded-2xl border border-warm-200 bg-white p-6 lg:sticky lg:top-24">
            <h2 className="mb-4 font-display text-xl font-semibold text-coffee-900">Đơn hàng của bạn</h2>
            <div className="max-h-80 space-y-3 overflow-y-auto border-b border-warm-200 pb-4">
              {items.map((i) => (
                <div key={i.productId} className="flex gap-3">
                  <img src={i.imageUrl} alt={i.name} className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-coffee-900">{i.name}</p>
                    <p className="text-xs text-coffee-600">SL: {i.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-coffee-900">{formatPrice(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-coffee-700">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-coffee-700">
                <span>Phí vận chuyển</span>
                <span>{shippingFee === 0 ? <span className="text-emerald-600">Miễn phí</span> : formatPrice(shippingFee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-between border-t border-warm-200 pt-4 font-display text-lg font-bold text-coffee-900">
              <span>Tổng cộng</span>
              <span className="text-amber-700">{formatPrice(total)}</span>
            </div>
            <Button type="submit" size="lg" disabled={submitting} className="mt-6 w-full gap-2">
              {submitting ? <Spinner size="sm" /> : <ShieldCheck className="h-5 w-5" />}
              {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
            </Button>
            <p className="mt-3 text-center text-xs text-coffee-500">
              Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
