import type { Address, Coupon } from '@/types';

export type ShippingMethod = 'STANDARD' | 'EXPRESS' | 'SAME_DAY';

export interface CouponResult {
  success: boolean;
  message: string;
  coupon?: Coupon;
  discountAmount?: number;
}

const SHIPPING_FEE_MAP: Record<ShippingMethod, number> = {
  STANDARD: 25000,
  EXPRESS: 50000,
  SAME_DAY: 80000,
};

const HCM_PROVINCE_CODE = 'HCM';

export function calculateShipping(
  address: { province: string } | null,
  method: ShippingMethod,
  subtotal: number = 0,
): number {
  const baseFee = SHIPPING_FEE_MAP[method] ?? 25000;

  // Free shipping for orders over 500,000 VND with STANDARD method
  if (method === 'STANDARD' && subtotal >= 500000) {
    return 0;
  }

  // Same-day only in HCM
  if (method === 'SAME_DAY' && address?.province !== HCM_PROVINCE_CODE) {
    return SHIPPING_FEE_MAP.EXPRESS;
  }

  return baseFee;
}

const MOCK_COUPONS: Record<string, Coupon> = {
  'WELCOME10': {
    id: 'cpn-001',
    code: 'WELCOME10',
    type: 'PERCENT',
    value: 10,
    minOrderValue: 100000,
    maxDiscount: 50000,
    usedCount: 0,
    usageLimit: 1000,
    validFrom: '2026-01-01T00:00:00Z',
    validTo: '2026-12-31T23:59:59Z',
    isActive: true,
  },
  'COFFEE50K': {
    id: 'cpn-002',
    code: 'COFFEE50K',
    type: 'FIXED',
    value: 50000,
    minOrderValue: 200000,
    usedCount: 0,
    usageLimit: 500,
    validFrom: '2026-01-01T00:00:00Z',
    validTo: '2026-12-31T23:59:59Z',
    isActive: true,
  },
  'FREESHIP': {
    id: 'cpn-003',
    code: 'FREESHIP',
    type: 'FIXED',
    value: 25000,
    minOrderValue: 0,
    usedCount: 0,
    usageLimit: 2000,
    validFrom: '2026-01-01T00:00:00Z',
    validTo: '2026-12-31T23:59:59Z',
    isActive: true,
  },
  'VIP20': {
    id: 'cpn-004',
    code: 'VIP20',
    type: 'PERCENT',
    value: 20,
    minOrderValue: 500000,
    maxDiscount: 200000,
    usedCount: 0,
    usageLimit: 200,
    validFrom: '2026-01-01T00:00:00Z',
    validTo: '2026-12-31T23:59:59Z',
    isActive: true,
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function validateCoupon(code: string): Promise<Coupon> {
  await delay(300);
  const normalizedCode = code.trim().toUpperCase();
  const coupon = MOCK_COUPONS[normalizedCode];

  if (!coupon) {
    throw new Error('Mã giảm giá không tồn tại');
  }
  if (!coupon.isActive) {
    throw new Error('Mã giảm giá đã hết hiệu lực');
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error('Mã giảm giá đã hết lượt sử dụng');
  }
  const now = new Date();
  if (now < new Date(coupon.validFrom) || now > new Date(coupon.validTo)) {
    throw new Error('Mã giảm giá không trong thời gian áp dụng');
  }

  return coupon;
}

export async function applyCoupon(code: string, subtotal: number): Promise<CouponResult> {
  try {
    await delay(400);
    const coupon = await validateCoupon(code);

    if (subtotal < coupon.minOrderValue) {
      return {
        success: false,
        message: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(coupon.minOrderValue)}đ để áp dụng mã này`,
      };
    }

    let discountAmount = 0;
    if (coupon.type === 'PERCENT') {
      discountAmount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.value;
    }

    return {
      success: true,
      message: `Áp dụng mã ${coupon.code} thành công`,
      coupon,
      discountAmount,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Mã giảm giá không hợp lệ',
    };
  }
}
