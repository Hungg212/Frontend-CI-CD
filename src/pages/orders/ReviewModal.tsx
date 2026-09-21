import React, { useState } from 'react';
import { Star, X, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useReview } from '@/hooks/useReview';
import type { Product } from '@/types';

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  existingRating?: number;
  existingComment?: string;
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
}

const MAX_IMAGES = 5;

export function ReviewModal({
  isOpen,
  onClose,
  product,
  existingRating = 0,
  existingComment = '',
  mode = 'create',
  onSuccess,
}: ReviewModalProps) {
  const { submitReview, isSubmitting, error } = useReview();
  const [rating, setRating] = useState(existingRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingComment);
  const [images, setImages] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (images.length >= MAX_IMAGES) {
        setLocalError(`Tối đa ${MAX_IMAGES} hình ảnh`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [...prev, reader.result as string].slice(0, MAX_IMAGES));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setLocalError(null);
    if (rating === 0) {
      setLocalError('Vui lòng chọn số sao');
      return;
    }
    if (comment.trim().length < 10) {
      setLocalError('Nhận xét phải có ít nhất 10 ký tự');
      return;
    }

    const result = await submitReview({ productId: product.id, rating, comment, images });

    if (result && result.success) {
      onSuccess?.();
      handleClose();
    } else {
      setLocalError(result?.message ?? 'Có lỗi xảy ra');
    }
  };

  const handleClose = () => {
    setRating(existingRating);
    setComment(existingComment);
    setImages([]);
    setLocalError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'edit' ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-stone-50 p-3 dark:bg-zinc-700/50">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-14 w-14 rounded object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-medium text-stone-800 dark:text-stone-100">
              {product.name}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">SKU: {product.sku}</p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-200">
            Đánh giá của bạn <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = star <= (hoverRating || rating);
              return (
                <motion.button
                  key={star}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="rounded p-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label={`${star} sao`}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      isActive
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-stone-300 dark:text-zinc-600'
                    }`}
                  />
                </motion.button>
              );
            })}
            {rating > 0 && (
              <span className="ml-2 text-sm text-stone-600 dark:text-stone-300">
                {rating === 1 && 'Rất tệ'}
                {rating === 2 && 'Tệ'}
                {rating === 3 && 'Bình thường'}
                {rating === 4 && 'Tốt'}
                {rating === 5 && 'Tuyệt vời'}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-200">
            Nhận xét <span className="text-red-500">*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            className="w-full resize-none rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
          />
          <p className="mt-1 text-right text-xs text-stone-500 dark:text-stone-400">
            {comment.length}/500
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-200">
            Hình ảnh (tùy chọn)
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {images.map((img, idx) => (
              <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg">
                <img src={img} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Xóa hình ảnh"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 transition-colors hover:border-amber-500 hover:bg-amber-50 dark:border-zinc-600 dark:hover:bg-amber-900/10">
                <Upload className="h-5 w-5 text-stone-400" />
                <span className="mt-1 text-xs text-stone-500">Tải lên</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Tối đa {MAX_IMAGES} hình ảnh
          </p>
        </div>

        {(localError || error) && (
          <p
            className="rounded-lg bg-red-50 p-2 text-sm text-red-500 dark:bg-red-900/20"
            role="alert"
          >
            {localError || error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-stone-200 pt-2 dark:border-zinc-700">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            {mode === 'edit' ? 'Cập nhật' : 'Gửi đánh giá'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ReviewModal;
