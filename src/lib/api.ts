const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '';
// Normalize: env should NOT include trailing /api; we append it here.
const API_BASE_URL = (() => {
  const base = RAW_BASE.replace(/\/+$/, '');
  if (!base) return '/api';
  if (base.endsWith('/api')) return base;
  return `${base}/api`;
})();

interface RequestOptions extends globalThis.RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  } as Record<string, string>;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }

  return response.json();
}

// Auth
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    request<{ token: string; user: unknown }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: unknown }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: (token: string) =>
    request<unknown>('/auth/me', { token }),
};

// Products
export const productApi = {
  getAll: (params?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return request<{ products: unknown[]; pagination: unknown }>(`/products${query ? `?${query}` : ''}`);
  },

  getAllAdmin: (token: string) =>
    request<{ products: unknown[]; pagination: unknown }>('/admin/products', { token }),

  getFeatured: () =>
    request<unknown[]>('/products/featured'),

  getBySlug: (slug: string) =>
    request<unknown>(`/products/${slug}`),

  getReviews: (productId: string) =>
    request<unknown[]>(`/products/${productId}/reviews`),

  addReview: (productId: string, data: { rating: number; comment?: string }, token: string) =>
    request<unknown>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
};

// Categories
export const categoryApi = {
  getAll: () =>
    request<unknown[]>('/categories'),

  getBySlug: (slug: string) =>
    request<unknown>(`/categories/${slug}`),
};

// Orders
export const orderApi = {
  create: (data: unknown, token: string) =>
    request<unknown>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getAll: (token: string) =>
    request<unknown[]>('/orders', { token }),

  getById: (id: string, token: string) =>
    request<unknown>(`/orders/${id}`, { token }),
};

// Payment
export const paymentApi = {
  create: (data: { orderId: string; method: string }, token: string) =>
    request<unknown>('/payment/create', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  confirm: (data: { orderId: string; transactionId?: string }, token: string) =>
    request<unknown>('/payment/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
};

// Admin
export const adminApi = {
  getProducts: (token: string) =>
    request<unknown[]>('/admin/products', { token }),

  createProduct: (data: unknown, token: string) =>
    request<unknown>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  updateProduct: (id: string, data: unknown, token: string) =>
    request<unknown>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  deleteProduct: (id: string, token: string) =>
    request<{ message: string }>(`/admin/products/${id}`, {
      method: 'DELETE',
      token,
    }),

  getOrders: (token: string) =>
    request<unknown[]>('/admin/orders', { token }),

  updateOrderStatus: (id: string, status: string, token: string) =>
    request<unknown>(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      token,
    }),

  getUsers: (token: string) =>
    request<unknown[]>('/admin/users', { token }),

  getCategories: (token: string) =>
    request<unknown[]>('/admin/categories', { token }),

  createCategory: (data: unknown, token: string) =>
    request<unknown>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
};

export { ApiError };
export { API_BASE_URL };
