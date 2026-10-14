export interface AdminStats {
  revenue: number;
  revenueChange: number;
  orderCount: number;
  orderCountChange: number;
  customerCount: number;
  customerCountChange: number;
  averageOrderValue: number;
  averageOrderValueChange: number;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
}

export interface OrdersByDay {
  day: string;
  orders: number;
}

export interface CategorySales {
  name: string;
  value: number;
  color: string;
}

export interface CustomerGrowth {
  month: string;
  customers: number;
}

export interface AdminRecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  itemCount: number;
}

export interface AdminTopProduct {
  id: string;
  name: string;
  image: string;
  soldCount: number;
  revenue: number;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  parentId?: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: AdminOrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO' | 'CREDIT_CARD';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  shippingAddress: AdminAddress;
  note?: string;
  createdAt: string;
  updatedAt: string;
  timeline: AdminOrderTimeline[];
}

export interface AdminOrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface AdminAddress {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
}

export interface AdminOrderTimeline {
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  timestamp: string;
  note?: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
  addresses: AdminAddress[];
}

export interface AdminCoupon {
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
  description?: string;
}

export interface AdminReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  isVerified: boolean;
  status: 'APPROVED' | 'PENDING';
}

export interface AdminSettings {
  shopName: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  paymentMethods: {
    cod: boolean;
    bankTransfer: boolean;
    vnpay: boolean;
    momo: boolean;
    creditCard: boolean;
  };
  shipping: {
    defaultFee: number;
    freeShippingThreshold: number;
  };
  smtp: {
    host: string;
    port: number;
    username: string;
    password: string;
    fromEmail: string;
  };
  notifications: {
    newOrderEmail: boolean;
    lowStockEmail: boolean;
    newCustomerEmail: boolean;
    reviewEmail: boolean;
  };
}
