import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Review, CreateReviewData } from '@/types';

interface ReviewState {
  reviews: Review[];
  addReview: (data: CreateReviewData & { userName: string; userId: string }) => Review;
  updateReview: (id: string, data: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  getReviewsByProduct: (productId: string) => Review[];
  getReviewsByUser: (userId: string) => Review[];
  hasReviewed: (productId: string, userId: string) => boolean;
}

const seedReviews = (): Review[] => [
  {
    id: 'review-1',
    userId: 'user-2',
    userName: 'Trần Thị B',
    productId: 'product-1',
    rating: 5,
    comment: 'Cà phê rất thơm ngon, đóng gói cẩn thận.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    isVerified: true,
  },
  {
    id: 'review-2',
    userId: 'user-3',
    userName: 'Lê Văn C',
    productId: 'product-2',
    rating: 4,
    comment: 'Hương vị đậm đà, sẽ mua lại.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isVerified: true,
  },
];

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: seedReviews(),
      addReview: (data) => {
        const review: Review = {
          id: `review-${Date.now()}`,
          userId: data.userId,
          userName: data.userName,
          productId: data.productId,
          rating: data.rating,
          comment: data.comment,
          images: data.images,
          createdAt: new Date().toISOString(),
          isVerified: true,
        };
        set({ reviews: [review, ...get().reviews] });
        return review;
      },
      updateReview: (id, data) => {
        set({
          reviews: get().reviews.map((r) => (r.id === id ? { ...r, ...data } : r)),
        });
      },
      deleteReview: (id) => {
        set({ reviews: get().reviews.filter((r) => r.id !== id) });
      },
      getReviewsByProduct: (productId) => get().reviews.filter((r) => r.productId === productId),
      getReviewsByUser: (userId) => get().reviews.filter((r) => r.userId === userId),
      hasReviewed: (productId, userId) =>
        get().reviews.some((r) => r.productId === productId && r.userId === userId),
    }),
    {
      name: 'review-storage',
    }
  )
);
