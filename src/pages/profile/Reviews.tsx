import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronRight, Star, Trash2, Edit3, Loader2, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Rating } from '@/components/ui/Rating';
import { Textarea } from '@/components/ui/Textarea';
import { useAuthStore } from '@/stores/authStore';
import { useReviewStore } from '@/stores/reviewStore';
import { useUIStore } from '@/stores/uiStore';

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const ReviewsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const reviews = useReviewStore((s) => s.reviews);
  const updateReview = useReviewStore((s) => s.updateReview);
  const deleteReview = useReviewStore((s) => s.deleteReview);
  const pushNotification = useUIStore((s) => s.pushNotification);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  const userReviews = reviews.filter((r) => r.userId === user.id);

  const handleOpenEdit = (reviewId: string) => {
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return;
    setEditingId(reviewId);
    setEditComment(review.comment);
    setEditRating(review.rating);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (editRating === 0) {
      pushNotification({ type: 'error', title: 'Lỗi', message: 'Vui lòng chọn số sao.' });
      return;
    }
    if (editComment.trim().length < 10) {
      pushNotification({
        type: 'error',
        title: 'Lỗi',
        message: 'Nhận xét phải có ít nhất 10 ký tự.',
      });
      return;
    }
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      updateReview(editingId, { comment: editComment.trim(), rating: editRating });
      pushNotification({
        type: 'success',
        title: 'Đã cập nhật',
        message: 'Đánh giá của bạn đã được cập nhật.',
      });
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      deleteReview(deleteId);
      pushNotification({ type: 'info', title: 'Đã xóa', message: 'Đánh giá đã được xóa.' });
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-2 flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
          <Link to="/" className="hover:text-amber-700 dark:hover:text-amber-500">
            Trang chủ
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/profile" className="hover:text-amber-700 dark:hover:text-amber-500">
            Tài khoản
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-stone-700 dark:text-stone-200">Đánh giá của tôi</span>
        </nav>
        <h1 className="mb-1 text-3xl font-bold text-stone-800 dark:text-stone-100">
          Đánh Giá Của Tôi
        </h1>
        <p className="mb-6 text-stone-600 dark:text-stone-400">
          {userReviews.length > 0 ? `${userReviews.length} đánh giá` : 'Chưa có đánh giá nào'}
        </p>

        {userReviews.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="flex flex-col items-center py-8">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <MessageSquare className="h-10 w-10 text-amber-600 dark:text-amber-500" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-stone-800 dark:text-stone-100">
                Chưa có đánh giá nào
              </h2>
              <p className="mb-4 text-stone-600 dark:text-stone-400">
                Sau khi mua hàng, bạn có thể đánh giá sản phẩm tại đây
              </p>
              <Link to="/products">
                <Button variant="primary">Khám phá sản phẩm</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {userReviews.map((review) => (
              <Card key={review.id} padding="md">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 font-semibold text-white">
                    {user.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-stone-800 dark:text-stone-100">
                          {user.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <Rating value={review.rating} size="sm" />
                          <span className="text-xs text-stone-500 dark:text-stone-400">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(review.id)}
                          className="p-1.5 text-stone-500 hover:text-amber-700 dark:hover:text-amber-500"
                          aria-label="Chỉnh sửa"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(review.id)}
                          className="p-1.5 text-stone-500 hover:text-red-500"
                          aria-label="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-stone-700 dark:text-stone-300">
                      {review.comment}
                    </p>
                    {review.images && review.images.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {review.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt=""
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!editingId}
        onClose={() => setEditingId(null)}
        title="Chỉnh sửa đánh giá"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-200">
              Số sao
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEditRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                  aria-label={`${star} sao`}
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= editRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-stone-200 text-stone-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            label="Nhận xét"
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-2 border-t border-stone-200 pt-3 dark:border-zinc-700">
            <Button variant="ghost" onClick={() => setEditingId(null)} disabled={saving}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveEdit}
              isLoading={saving}
              disabled={saving}
              leftIcon={saving ? <Loader2 className="h-4 w-4" /> : undefined}
            >
              Lưu
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Xóa đánh giá" size="sm">
        <p className="mb-4 text-stone-700 dark:text-stone-300">
          Bạn có chắc chắn muốn xóa đánh giá này không?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteId(null)} disabled={deleting}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleting}
            disabled={deleting}
            leftIcon={deleting ? <Loader2 className="h-4 w-4" /> : undefined}
          >
            Xóa
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ReviewsPage;
