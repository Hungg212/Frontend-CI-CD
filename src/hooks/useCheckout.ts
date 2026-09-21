import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { useOrderStore } from '@/stores/orderStore';
import { applyCoupon } from '@/services/checkoutService';
import { checkoutSchema } from '@/utils/checkoutSchema';
import type { CheckoutFormData } from '@/utils/checkoutSchema';
import type { Coupon, Order, Address, PaymentMethod } from '@/types';

export type ShippingMethod = 'STANDARD' | 'EXPRESS' | 'SAME_DAY';

export interface OrderTotals {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
}

export interface UseCheckoutReturn {
  formData: CheckoutFormData;
  updateField: <K extends keyof CheckoutFormData>(field: K, value: CheckoutFormData[K]) => void;
  updateAddressField: (field: string, value: string) => void;
  errors: Partial<Record<keyof CheckoutFormData, string>>;
  validate: () => boolean;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  handleApplyCoupon: (
    code: string
  ) => Promise<{ success: boolean; message: string; coupon?: Coupon }>;
  handleRemoveCoupon: () => void;
  totals: OrderTotals;
  isSubmitting: boolean;
  submitOrder: () => Promise<Order | null>;
}

const INITIAL_DATA: CheckoutFormData = {
  fullName: '',
  phone: '',
  email: '',
  province: '',
  district: '',
  ward: '',
  detail: '',
  shippingMethod: 'STANDARD',
  paymentMethod: 'COD',
  note: '',
  saveAddress: false,
  differentBillingAddress: false,
};

export function useCheckout(): UseCheckoutReturn {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const createOrderStore = useOrderStore((s) => s.createOrder);

  const [formData, setFormData] = useState<CheckoutFormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField: UseCheckoutReturn['updateField'] = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const updateAddressField = (field: string, value: string) => {
    const map: Record<string, keyof CheckoutFormData> = {
      fullName: 'fullName',
      phone: 'phone',
      email: 'email',
      province: 'province',
      district: 'district',
      ward: 'ward',
      detail: 'detail',
    };
    const key = map[field];
    if (key) {
      updateField(key, value as CheckoutFormData[typeof key]);
    }
  };

  const validate = useCallback((): boolean => {
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as keyof CheckoutFormData;
        if (path && !newErrors[path]) {
          newErrors[path] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [formData]);

  const handleApplyCoupon = useCallback(
    async (code: string) => {
      const subtotal = getSubtotal();
      const result = await applyCoupon(code, subtotal);
      if (result.success && result.coupon) {
        setAppliedCoupon(result.coupon);
        setDiscountAmount(result.discountAmount ?? 0);
      }
      return { success: result.success, message: result.message, coupon: result.coupon };
    },
    [getSubtotal]
  );

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  }, []);

  const subtotal = getSubtotal();
  const calculateShippingFee = (): number => {
    const feeMap: Record<ShippingMethod, number> = {
      STANDARD: 25000,
      EXPRESS: 50000,
      SAME_DAY: 80000,
    };
    let fee = feeMap[formData.shippingMethod as ShippingMethod];
    if (formData.shippingMethod === 'STANDARD' && subtotal >= 500000) fee = 0;
    if (formData.shippingMethod === 'SAME_DAY' && formData.province !== 'HCM') fee = feeMap.EXPRESS;
    return fee;
  };

  const shippingFee = calculateShippingFee();
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const submitOrder = useCallback(async (): Promise<Order | null> => {
    if (!validate()) return null;
    if (items.length === 0) return null;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const shippingAddress: Address = {
        id: `addr-${Date.now()}`,
        label: 'home',
        name: formData.fullName,
        phone: formData.phone,
        province: formData.province,
        district: formData.district,
        ward: formData.ward,
        detail: formData.detail,
        isDefault: false,
      };

      const orderItems = items.map((item) => ({ product: item.product, quantity: item.quantity }));

      const created = createOrderStore({
        items: orderItems,
        shippingAddress,
        paymentMethod: formData.paymentMethod as PaymentMethod,
        note: formData.note,
      });

      clearCart();

      setTimeout(() => {
        navigate(`/order-success/${created.id}`);
      }, 100);

      return created;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validate,
    items,
    formData,
    subtotal,
    shippingFee,
    discountAmount,
    total,
    createOrderStore,
    clearCart,
    navigate,
  ]);

  return {
    formData,
    updateField,
    updateAddressField,
    errors,
    validate,
    appliedCoupon,
    discountAmount,
    handleApplyCoupon,
    handleRemoveCoupon,
    totals: { subtotal, discount: discountAmount, shippingFee, total },
    isSubmitting,
    submitOrder,
  };
}

export default useCheckout;
