// Product types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice?: number;
  discount?: number;
  category: string;
  categorySlug: string;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  tags: string[];
  origin: string;
  roastLevel: 'Light' | 'Medium' | 'Medium-Dark' | 'Dark';
  flavorNotes: string[];
  brewingMethod: string[];
  weight: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  parentId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  message?: string;
  success?: boolean;
  addresses: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  label: 'home' | 'office' | 'other';
  name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  note?: string;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimeline[];
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  review?: Review;
}

export type OrderStatus =
  'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'SHIPPED';
export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO' | 'CREDIT_CARD' | 'CARD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type ShippingMethod = 'STANDARD' | 'EXPRESS' | 'SAME_DAY';

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  isVerified: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'bestseller';
  page?: number;
  limit?: number;
}

export interface CreateOrderData {
  items: { product: Product; quantity: number }[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  note?: string;
  couponCode?: string;
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
  addresses?: Address[];
}
