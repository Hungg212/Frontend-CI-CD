// API Response Types matching backend
export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  imageUrl?: string;
  gallery: string[];
  origin?: string;
  roastLevel?: 'light' | 'medium' | 'dark';
  weight?: number;
  stock: number;
  featured: boolean;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
}

export interface ApiReview {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface ApiOrder {
  id: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ApiShippingAddress | null;
  note?: string;
  createdAt: string;
  items: ApiOrderItem[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApiShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  ward?: string;
}

export interface ApiOrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
  };
}

export interface ApiProductsResponse {
  products: ApiProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiPaymentResponse {
  success: boolean;
  paymentUrl: string;
  transactionId: string;
  orderId: string;
  amount: number;
  method: string;
}
