import React, { useState } from 'react';
import { Star, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useAuthStore } from '@/stores/authStore';
import { useReviewStore } from '@/stores/reviewStore';
import { useUIStore } from '@/stores/uiStore';
import type { Product } from '@/types';

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const user = useAuthStore((s) => s.user);
  const addReview = useReviewStore((s) => s.addReview);
  const pushNotification = useUIStore((s) => s.pushNotification);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setComment('');
      setImages([]);
    }
  }, [isOpen]);

  const handleImageAdd = () => {
    if (images.length >= 5) {
      pushNotification({
        type: 'warning',
        title: 'Giới hạn ảnh',
        message: 'Bạn chỉ có thể thêm tối đa 5 ảnh.',
      });
      return;
    }
    const placeholder = `https://picsum.photos/seed/${Date.now()}/200/200`;
    setImages([...images, placeholder]);
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;
    if (rating === 0) {
      pushNotification({ type: 'error', title: 'Lỗi', message: 'Vui lòng chọn số sao đánh giá.' });
      return;
    }
    if (comment.trim().length < 10) {
      pushNotification({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng nhập nhận xét ít nhất 10 ký tự.',
      });
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      addReview({
        productId: product.id,
        rating,
        comment: comment.trim(),
        images: images.length > 0 ? images : undefined,
        userId: user.id,
        userName: user.name,
      });
      pushNotification({
        type: 'success',
        title: 'Đánh giá thành công',
        message: 'Cảm ơn bạn đã chia sẻ đánh giá!',
      });
      onSuccess?.();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Viết Đánh Giá" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-stone-50 p-3 dark:bg-zinc-700/50">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-14 w-14 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-stone-500 dark:text-stone-400">{product.category}</p>
            <p className="line-clamp-1 font-medium text-stone-800 dark:text-stone-100">
              {product.name}
            </p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-200">
            Đánh giá của bạn *
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
                aria-label={`${star} sao`}
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-stone-200 text-stone-200 dark:fill-zinc-700 dark:text-zinc-700'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-stone-600 dark:text-stone-400">
                {rating === 5
                  ? 'Tuyệt vời'
                  : rating === 4
                    ? 'Tốt'
                    : rating === 3
                      ? 'Bình thường'
                      : rating === 2
                        ? 'Tệ'
                        : 'Rất tệ'}
              </span>
            )}
          </div>
        </div>

        <Textarea
          label="Nhận xét của bạn *"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
          rows={4}
          helperText={`${comment.length} ký tự (tối thiểu 10)`}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-200">
            Hình ảnh (tùy chọn, tối đa 5)
          </label>
          <div className="flex flex-wrap gap-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative h-20 w-20 overflow-hidden rounded-lg bg-stone-100 dark:bg-zinc-700"
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                  aria-label="Xóa ảnh"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                onClick={handleImageAdd}
                className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 text-stone-400 transition-colors hover:border-amber-600 hover:text-amber-600 dark:border-zinc-600"
              >
                <ImageIcon className="h-5 w-5" />
                <span className="mt-0.5 text-xs">Thêm</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-stone-200 pt-3 dark:border-zinc-700">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            isLoading={submitting}
            leftIcon={submitting ? <Loader2 className="h-4 w-4" /> : undefined}
          >
            Gửi Đánh Giá
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewModal;
