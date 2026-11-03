import { couponApi } from '@/lib/api';
import type { Coupon } from '@/types';

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
  subtotal: number = 0
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

// Validate a coupon against the backend, which owns the real codes, expiry
// dates and usage counters.
export async function validateCoupon(code: string): Promise<Coupon> {
  const normalizedCode = code.trim().toUpperCase();
  const coupon = (await couponApi.validate(normalizedCode)) as Coupon;
  if (!coupon) {
    throw new Error('Mã giảm giá không tồn tại');
  }
  return coupon;
}

export async function applyCoupon(code: string, subtotal: number): Promise<CouponResult> {
  try {
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
