import { useState, type FormEvent } from 'react';
import { Save, Store, Mail, Phone, MapPin, Globe, DollarSign } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { Button } from '@/components/ui';

type Settings = Record<string, string | number | boolean>;

export default function AdminSettings() {
  const notify = useNotificationStore((s) => s);
  const [settings, setSettings] = useState<Settings>({
    storeName: 'Coffee Home Blend',
    email: 'contact@coffeehomeblend.com',
    phone: '0901 234 567',
    address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    description: 'Cà phê đặc sản Việt Nam - Rang xay thủ công, giao hàng tận nơi.',
    currency: 'VND',
    freeShippingThreshold: 500000,
    shippingFee: 30000,
    enableReviews: true,
    enableCoupons: true,
    enableWishlist: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    notify.success('Đã lưu cài đặt');
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-coffee-900">Cài đặt</h1>
        <p className="text-sm text-coffee-600">Cấu hình thông tin cửa hàng</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl border border-warm-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Store className="h-5 w-5 text-amber-700" />
            </div>
            <h2 className="font-display text-lg font-semibold text-coffee-900">
              Thông tin cửa hàng
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-coffee-700">Tên cửa hàng</label>
              <input
                value={settings.storeName as string}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-coffee-700">Mô tả</label>
              <input
                value={settings.description as string}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                className="mt-1 w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-coffee-700">
                <Mail className="h-3 w-3" /> Email
              </label>
              <input
                type="email"
                value={settings.email as string}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-coffee-700">
                <Phone className="h-3 w-3" /> Điện thoại
              </label>
              <input
                value={settings.phone as string}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="mt-1 w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-1 text-xs font-semibold text-coffee-700">
                <MapPin className="h-3 w-3" /> Địa chỉ
              </label>
              <input
                value={settings.address as string}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="mt-1 w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-warm-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <DollarSign className="h-5 w-5 text-blue-700" />
            </div>
            <h2 className="font-display text-lg font-semibold text-coffee-900">
              Vận chuyển & Thanh toán
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-coffee-700">Tiền tệ</label>
              <select
                value={settings.currency as string}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="mt-1 w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="VND">VND - Việt Nam Đồng</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-coffee-700">Phí ship (VNĐ)</label>
              <input
                type="number"
                value={settings.shippingFee as number}
                onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-coffee-700">Free ship từ (VNĐ)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold as number}
                onChange={(e) =>
                  setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-warm-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Globe className="h-5 w-5 text-purple-700" />
            </div>
            <h2 className="font-display text-lg font-semibold text-coffee-900">Tính năng</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: 'enableReviews', label: 'Cho phép đánh giá sản phẩm' },
              { key: 'enableCoupons', label: 'Cho phép mã giảm giá' },
              { key: 'enableWishlist', label: 'Cho phép danh sách yêu thích' },
            ].map((f) => (
              <label
                key={f.key}
                className="flex items-center justify-between rounded-lg border border-warm-200 p-3 hover:bg-cream-50"
              >
                <span className="text-sm font-medium text-coffee-900">{f.label}</span>
                <input
                  type="checkbox"
                  checked={settings[f.key] as boolean}
                  onChange={(e) => setSettings({ ...settings, [f.key]: e.target.checked })}
                  className="h-5 w-5 rounded border-coffee-300 text-amber-600 focus:ring-amber-500"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" loading={saving}>
            <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>
      </form>
    </div>
  );
}
