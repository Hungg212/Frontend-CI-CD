import { z } from 'zod';

export const SHIPPING_METHODS = ['STANDARD', 'EXPRESS', 'SAME_DAY'] as const;
export const PAYMENT_METHODS = ['COD', 'BANK_TRANSFER', 'VNPAY', 'MOMO', 'CREDIT_CARD'] as const;

// Vietnamese phone regex: starts with 0, has 10-11 digits
const vietnamesePhoneRegex = /^(0|\+84)(3|5|7|8|9|1[2|6|8|9])\d{8}$/;

export const addressSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên không quá 50 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ tên chỉ chứa chữ cái và khoảng trắng'),
  phone: z.string().regex(vietnamesePhoneRegex, 'Số điện thoại không hợp lệ (VD: 0901234567)'),
  email: z.string().email('Email không hợp lệ'),
  province: z.string().min(1, 'Vui lòng chọn tỉnh / thành phố'),
  district: z.string().min(1, 'Vui lòng chọn quận / huyện'),
  ward: z.string().min(1, 'Vui lòng chọn phường / xã'),
  detail: z
    .string()
    .min(5, 'Địa chỉ chi tiết phải có ít nhất 5 ký tự')
    .max(200, 'Địa chỉ không quá 200 ký tự'),
});

export const checkoutSchema = z.object({
  fullName: addressSchema.shape.fullName,
  phone: addressSchema.shape.phone,
  email: addressSchema.shape.email,
  province: addressSchema.shape.province,
  district: addressSchema.shape.district,
  ward: addressSchema.shape.ward,
  detail: addressSchema.shape.detail,
  shippingMethod: z.enum(SHIPPING_METHODS, {
    errorMap: () => ({ message: 'Vui lòng chọn phương thức vận chuyển' }),
  }),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    errorMap: () => ({ message: 'Vui lòng chọn phương thức thanh toán' }),
  }),
  note: z.string().max(500, 'Ghi chú không quá 500 ký tự').optional().or(z.literal('')),
  saveAddress: z.boolean().optional(),
  differentBillingAddress: z.boolean().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type AddressFormValues = z.infer<typeof addressSchema>;

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Vui lòng chọn số sao').max(5, 'Số sao tối đa là 5'),
  comment: z
    .string()
    .min(10, 'Nhận xét phải có ít nhất 10 ký tự')
    .max(500, 'Nhận xét không quá 500 ký tự'),
  images: z
    .array(z.string().url('URL hình ảnh không hợp lệ'))
    .max(5, 'Tối đa 5 hình ảnh')
    .optional(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
