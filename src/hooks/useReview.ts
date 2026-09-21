import { useState } from 'react';
import { useOrderStore } from '@/stores/orderStore';
import { reviewSchema } from '@/utils/checkoutSchema';
import type { Review, CreateReviewData } from '@/types';

export interface UseReviewReturn {
  submitReview: (
    data: CreateReviewData
  ) => Promise<{ success: boolean; message: string; review?: Review }>;
  isSubmitting: boolean;
  error: string | null;
}

export function useReview(
  userId: string = 'user-001',
  userName: string = 'Nguyễn Văn A'
): UseReviewReturn {
  const addReviewStore = useOrderStore((s) => s.addReview);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReview = async (data: CreateReviewData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const validation = reviewSchema.safeParse({
        rating: data.rating,
        comment: data.comment,
        images: data.images,
      });

      if (!validation.success) {
        const msg = validation.error.errors[0]?.message || 'Dữ liệu không hợp lệ';
        setError(msg);
        return { success: false, message: msg };
      }

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Use first order as demo; in real app, link to actual order
      const created = addReviewStore('order-001', data);
      if (!created) {
        // Fallback: create review data manually if no order found
        const review: Review = {
          id: `rev-${Date.now()}`,
          userId,
          userName,
          productId: data.productId,
          rating: data.rating,
          comment: data.comment,
          images: data.images,
          createdAt: new Date().toISOString(),
          isVerified: true,
        };
        return { success: true, message: 'Đánh giá đã được gửi thành công', review };
      }
      return { success: true, message: 'Đánh giá đã được gửi thành công', review: created };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitReview, isSubmitting, error };
}

export default useReview;
