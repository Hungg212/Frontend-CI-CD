import type { Category } from '../types';
import {
  categories as mockCategories,
  getCategoryBySlug as findCategoryBySlug,
} from '../data/categories';

const simulateDelay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    await simulateDelay();
    return mockCategories;
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    await simulateDelay(200);
    const category = findCategoryBySlug(slug);
    if (!category) throw new Error(`Không tìm thấy danh mục với slug: ${slug}`);
    return category;
  },
};
