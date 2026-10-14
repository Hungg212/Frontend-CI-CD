import { create } from 'zustand';
import type {
  AdminCategory,
  AdminOrder,
  AdminOrderTimeline,
  AdminCustomer,
  AdminCoupon,
  AdminReview,
  AdminSettings,
} from '@/types/admin';
import {
  mockAdminCategories,
  mockAdminOrders,
  mockAdminCustomers,
  mockAdminCoupons,
  mockAdminReviews,
  mockAdminSettings,
} from '@/data/adminMockData';
import type { Product } from '@/types';

interface AdminState {
  // Categories
  categories: AdminCategory[];
  addCategory: (category: Omit<AdminCategory, 'id' | 'productCount'>) => AdminCategory;
  updateCategory: (id: string, data: Partial<AdminCategory>) => void;
  deleteCategory: (id: string) => void;

  // Orders
  orders: AdminOrder[];
  updateOrderStatus: (id: string, status: AdminOrder['status'], note?: string) => void;
  updatePaymentStatus: (id: string, status: AdminOrder['paymentStatus']) => void;

  // Customers (read-only in this demo)
  customers: AdminCustomer[];

  // Coupons
  coupons: AdminCoupon[];
  addCoupon: (coupon: Omit<AdminCoupon, 'id' | 'usedCount'>) => AdminCoupon;
  updateCoupon: (id: string, data: Partial<AdminCoupon>) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponActive: (id: string) => void;

  // Reviews
  reviews: AdminReview[];
  approveReview: (id: string) => void;
  deleteReview: (id: string) => void;

  // Products (in-store list, drives the products admin table)
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  deleteProducts: (ids: string[]) => void;

  // Settings
  settings: AdminSettings;
  updateSettings: (data: Partial<AdminSettings>) => void;
}

const initialProducts: Product[] = [
  {
    id: 'p-1',
    name: 'Cà Phê Arabica Cầu Đất',
    slug: 'ca-phe-arabica-cau-dat',
    description:
      'Cà phê Arabica Cầu Đất được trồng tại độ cao 1.500-1.900m, hương vị chua thanh, hậu ngọt tự nhiên.',
    shortDescription: 'Hạt Arabica Cầu Đất chất lượng cao',
    price: 285000,
    salePrice: 250000,
    category: 'Cà Phê Hạt',
    categorySlug: 'ca-phe-hat',
    images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop'],
    rating: 4.8,
    reviewCount: 234,
    stock: 156,
    sku: 'CPH-001',
    tags: ['arabica', 'cau-dat'],
    origin: 'Đà Lạt - Cầu Đất',
    roastLevel: 'Medium',
    flavorNotes: ['Chua thanh', 'Hậu ngọt', 'Citrus'],
    brewingMethod: ['Pour Over', 'Espresso', 'French Press'],
    weight: '500g',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    createdAt: '2026-01-15',
    updatedAt: '2026-09-01',
  },
  {
    id: 'p-2',
    name: 'Cà Phê Robusta Buôn Ma Thuột',
    slug: 'ca-phe-robusta-buon-ma-thuot',
    description:
      'Cà phê Robusta Buôn Ma Thuột nổi tiếng với hàm lượng caffeine cao, vị đắng đậm đà.',
    shortDescription: 'Robusta Buôn Ma Thuột đắng đậm',
    price: 145000,
    category: 'Cà Phê Hạt',
    categorySlug: 'ca-phe-hat',
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop'],
    rating: 4.6,
    reviewCount: 189,
    stock: 234,
    sku: 'CPH-002',
    tags: ['robusta'],
    origin: 'Buôn Ma Thuột',
    roastLevel: 'Dark',
    flavorNotes: ['Đắng', 'Đậm'],
    brewingMethod: ['Pha Phin', 'Espresso'],
    weight: '500g',
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    createdAt: '2026-01-10',
    updatedAt: '2026-08-15',
  },
  {
    id: 'p-3',
    name: 'Cà Phê Mokka Cần Thơ',
    slug: 'ca-phe-mokka-can-tho',
    description: 'Cà phê Mokka Cần Thơ mang hương vị đặc trưng của vùng Tây Nam Bộ.',
    shortDescription: 'Giống Mokka đặc sản Cần Thơ',
    price: 320000,
    salePrice: 280000,
    category: 'Cà Phê Hạt',
    categorySlug: 'ca-phe-hat',
    images: ['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&h=400&fit=crop'],
    rating: 4.9,
    reviewCount: 156,
    stock: 78,
    sku: 'CPH-003',
    tags: ['mokka'],
    origin: 'Cần Thơ',
    roastLevel: 'Light',
    flavorNotes: ['Chua dịu', 'Ngọt hậu'],
    brewingMethod: ['Pour Over'],
    weight: '500g',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    createdAt: '2026-09-01',
    updatedAt: '2026-09-12',
  },
  {
    id: 'p-4',
    name: 'Cà Phê Hữu Cơ Sapa',
    slug: 'ca-phe-huu-co-sapa',
    description: 'Cà phê hữu cơ Sapa được trồng theo tiêu chuẩn hữu cơ quốc tế.',
    shortDescription: 'Cà phê hữu cơ Sapa',
    price: 420000,
    salePrice: 380000,
    category: 'Cà Phê Hữu Cơ',
    categorySlug: 'ca-phe-huu-co',
    images: ['https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=400&fit=crop'],
    rating: 4.7,
    reviewCount: 98,
    stock: 45,
    sku: 'CPH-004',
    tags: ['huu-co', 'sapa'],
    origin: 'Sapa - Lào Cai',
    roastLevel: 'Medium',
    flavorNotes: ['Tinh khiết', 'Đậm đà'],
    brewingMethod: ['Pour Over', 'French Press'],
    weight: '500g',
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    createdAt: '2026-08-20',
    updatedAt: '2026-09-05',
  },
  {
    id: 'p-5',
    name: 'Cà Phê Espresso Blend',
    slug: 'ca-phe-espresso-blend',
    description: 'Cà phê Espresso Blend là sự kết hợp hoàn hảo giữa Arabica và Robusta.',
    shortDescription: 'Blend Arabica-Robusta hoàn hảo',
    price: 265000,
    category: 'Cà Phê Blend',
    categorySlug: 'ca-phe-blend',
    images: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop'],
    rating: 4.5,
    reviewCount: 312,
    stock: 189,
    sku: 'CPH-005',
    tags: ['espresso', 'blend'],
    origin: 'Đắk Lắk',
    roastLevel: 'Medium-Dark',
    flavorNotes: ['Đậm', 'Đắng nhẹ', 'Crema'],
    brewingMethod: ['Espresso'],
    weight: '500g',
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    createdAt: '2026-02-01',
    updatedAt: '2026-08-30',
  },
  {
    id: 'p-6',
    name: 'Cà Phê Bột Rang Mộc',
    slug: 'ca-phe-bot-rang-moc',
    description: 'Cà phê bột rang mộc, xay mịn, tiện lợi.',
    shortDescription: 'Bột Arabica rang vừa',
    price: 195000,
    salePrice: 165000,
    category: 'Cà Phê Bột',
    categorySlug: 'ca-phe-bot',
    images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop'],
    rating: 4.6,
    reviewCount: 445,
    stock: 267,
    sku: 'CPH-006',
    tags: ['bot', 'rang-moc'],
    origin: 'Cầu Đất - Đà Lạt',
    roastLevel: 'Medium',
    flavorNotes: ['Chua thanh', 'Hậu ngọt'],
    brewingMethod: ['Pha Phin'],
    weight: '500g',
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    createdAt: '2026-01-20',
    updatedAt: '2026-07-15',
  },
  {
    id: 'p-7',
    name: 'Cà Phê Pha Máy Chuyên Dụng',
    slug: 'ca-phe-pha-may-chuyen-dung',
    description: 'Hạt cà phê chuyên dụng cho máy pha espresso.',
    shortDescription: 'Hạt rang chuyên dụng cho máy pha',
    price: 350000,
    category: 'Cà Phê Pha Máy',
    categorySlug: 'ca-phe-pha-may',
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop'],
    rating: 4.4,
    reviewCount: 178,
    stock: 123,
    sku: 'CPH-007',
    tags: ['pha-may'],
    origin: 'Đắk Lắk',
    roastLevel: 'Dark',
    flavorNotes: ['Đậm', 'Caramel'],
    brewingMethod: ['Espresso'],
    weight: '1kg',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    createdAt: '2026-08-15',
    updatedAt: '2026-09-10',
  },
  {
    id: 'p-8',
    name: 'Cà Phê Cherry Sơn La',
    slug: 'ca-phe-cherry-son-la',
    description: 'Cà phê Cherry Sơn La là giống cà phê đặc sản vùng Tây Bắc.',
    shortDescription: 'Giống Cherry đặc sản Sơn La',
    price: 385000,
    salePrice: 350000,
    category: 'Cà Phê Hạt',
    categorySlug: 'ca-phe-hat',
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop'],
    rating: 4.8,
    reviewCount: 87,
    stock: 56,
    sku: 'CPH-008',
    tags: ['cherry', 'son-la'],
    origin: 'Sơn La',
    roastLevel: 'Light',
    flavorNotes: ['Chua thanh', 'Trái cây', 'Mật ong'],
    brewingMethod: ['Pour Over'],
    weight: '500g',
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    createdAt: '2026-09-05',
    updatedAt: '2026-09-20',
  },
];

const now = () => new Date().toISOString();

export const useAdminStore = create<AdminState>((set) => ({
  categories: mockAdminCategories,
  addCategory: (data) => {
    const newCategory: AdminCategory = {
      ...data,
      id: `cat-${Date.now()}`,
      productCount: 0,
    };
    set((s) => ({ categories: [newCategory, ...s.categories] }));
    return newCategory;
  },
  updateCategory: (id, data) =>
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  deleteCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

  orders: mockAdminOrders,
  updateOrderStatus: (id, status, note) =>
    set((s) => ({
      orders: s.orders.map((o) => {
        if (o.id !== id) return o;
        const timelineEntry: AdminOrderTimeline = { status, timestamp: now(), note };
        return {
          ...o,
          status,
          updatedAt: now(),
          timeline: [...o.timeline, timelineEntry],
        };
      }),
    })),
  updatePaymentStatus: (id, status) =>
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, paymentStatus: status, updatedAt: now() } : o
      ),
    })),

  customers: mockAdminCustomers,

  coupons: mockAdminCoupons,
  addCoupon: (data) => {
    const coupon: AdminCoupon = { ...data, id: `cp-${Date.now()}`, usedCount: 0 };
    set((s) => ({ coupons: [coupon, ...s.coupons] }));
    return coupon;
  },
  updateCoupon: (id, data) =>
    set((s) => ({
      coupons: s.coupons.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  deleteCoupon: (id) => set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) })),
  toggleCouponActive: (id) =>
    set((s) => ({
      coupons: s.coupons.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)),
    })),

  reviews: mockAdminReviews,
  approveReview: (id) =>
    set((s) => ({
      reviews: s.reviews.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r)),
    })),
  deleteReview: (id) => set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) })),

  products: initialProducts,
  setProducts: (products) => set({ products }),
  addProduct: (product) => set((s) => ({ products: [product, ...s.products] })),
  updateProduct: (id, data) =>
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? { ...p, ...data, updatedAt: now() } : p)),
    })),
  deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
  deleteProducts: (ids) =>
    set((s) => ({ products: s.products.filter((p) => !ids.includes(p.id)) })),

  settings: mockAdminSettings,
  updateSettings: (data) =>
    set((s) => ({
      settings: {
        ...s.settings,
        ...data,
        paymentMethods: { ...s.settings.paymentMethods, ...(data.paymentMethods ?? {}) },
        shipping: { ...s.settings.shipping, ...(data.shipping ?? {}) },
        smtp: { ...s.settings.smtp, ...(data.smtp ?? {}) },
        notifications: { ...s.settings.notifications, ...(data.notifications ?? {}) },
      },
    })),
}));
