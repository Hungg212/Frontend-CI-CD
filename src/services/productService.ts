import type { Product, FilterOptions } from '../types';
import { products as mockProducts, getProductById, getProductBySlug } from '../data/products';

export type ProductFilters = FilterOptions;
export type SortOption = FilterOptions['sortBy'];

const simulateDelay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const filterAndSort = (items: Product[], filters?: FilterOptions): Product[] => {
  let result = [...items];

  if (filters?.search) {
    const query = filters.search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query)) ||
        p.origin.toLowerCase().includes(query),
    );
  }

  if (filters?.category) {
    result = result.filter((p) => p.categorySlug === filters.category);
  }

  if (filters?.minPrice !== undefined) {
    result = result.filter((p) => (p.salePrice ?? p.price) >= filters.minPrice!);
  }

  if (filters?.maxPrice !== undefined) {
    result = result.filter((p) => (p.salePrice ?? p.price) <= filters.maxPrice!);
  }

  if (filters?.rating !== undefined) {
    result = result.filter((p) => p.rating >= filters.rating!);
  }

  if (filters?.inStock) {
    result = result.filter((p) => p.stock > 0);
  }

  switch (filters?.sortBy) {
    case 'price_asc':
      result.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
      break;
    case 'price_desc':
      result.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'bestseller':
      result.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
  }

  return result;
};

export const productService = {
  async getProducts(filters?: FilterOptions): Promise<Product[]> {
    await simulateDelay();
    const filtered = filterAndSort(mockProducts, filters);

    if (filters?.page && filters?.limit) {
      const start = (filters.page - 1) * filters.limit;
      return filtered.slice(start, start + filters.limit);
    }

    return filtered;
  },

  async getAll(): Promise<Product[]> {
    await simulateDelay(300);
    return mockProducts;
  },

  async getProductById(id: string): Promise<Product> {
    await simulateDelay(200);
    const product = getProductById(id);
    if (!product) throw new Error(`Không tìm thấy sản phẩm với ID: ${id}`);
    return product;
  },

  async getProductBySlug(slug: string): Promise<Product> {
    await simulateDelay(200);
    const product = getProductBySlug(slug);
    if (!product) throw new Error(`Không tìm thấy sản phẩm với slug: ${slug}`);
    return product;
  },

  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    await simulateDelay();
    return mockProducts.filter((p) => p.categorySlug === categorySlug);
  },

  async getFeaturedProducts(): Promise<Product[]> {
    await simulateDelay();
    return mockProducts.filter((p) => p.isFeatured);
  },

  async getNewArrivals(): Promise<Product[]> {
    await simulateDelay();
    return mockProducts.filter((p) => p.isNewArrival);
  },

  async getBestSellers(): Promise<Product[]> {
    await simulateDelay();
    return mockProducts.filter((p) => p.isBestSeller);
  },

  async searchProducts(query: string): Promise<Product[]> {
    await simulateDelay();
    return filterAndSort(mockProducts, { search: query });
  },

  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    await simulateDelay(200);
    const product = getProductById(productId);
    if (!product) return [];

    return mockProducts
      .filter((p) => p.id !== productId && p.categorySlug === product.categorySlug)
      .slice(0, limit);
  },
};
