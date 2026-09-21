import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';

const WishlistPage: React.FC = () => {
  const items = useWishlistStore((s) => s.items);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const addProduct = useCartStore((s) => s.addProduct);
  const pushNotification = useUIStore((s) => s.pushNotification);
  const navigate = useNavigate();

  const handleMoveToCart = (productId: string) => {
    const wishlistItem = items.find((i) => i.product.id === productId);
    if (!wishlistItem) return;
    const product = wishlistItem.product;
    if (product.stock <= 0) {
      pushNotification({
        type: 'warning',
        title: 'Hết hàng',
        message: `${product.name} hiện đang hết hàng.`,
      });
      return;
    }
    addProduct(product, 1);
    removeFromWishlist(productId);
    pushNotification({
      type: 'success',
      title: 'Đã thêm vào giỏ hàng',
      message: `${product.name} đã được chuyển sang giỏ hàng.`,
    });
    navigate('/cart');
  };

  const handleRemove = (productId: string, productName: string) => {
    removeFromWishlist(productId);
    pushNotification({
      type: 'info',
      title: 'Đã xóa',
      message: `${productName} đã được xóa khỏi danh sách yêu thích.`,
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-2 flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
          <Link to="/" className="hover:text-amber-700 dark:hover:text-amber-500">
            Trang chủ
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-stone-700 dark:text-stone-200">Danh sách yêu thích</span>
        </nav>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">
              Danh Sách Yêu Thích
            </h1>
            <p className="mt-1 text-stone-600 dark:text-stone-400">
              {items.length > 0 ? `${items.length} sản phẩm` : 'Chưa có sản phẩm nào'}
            </p>
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => clearWishlist()}
            >
              Xóa tất cả
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-white py-16 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
              <Heart className="h-12 w-12 text-rose-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-stone-800 dark:text-stone-100">
              Danh Sách Yêu Thích Trống
            </h2>
            <p className="mb-6 max-w-md text-center text-stone-600 dark:text-stone-400">
              Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Hãy khám phá và lưu lại những sản
              phẩm yêu thích nhé!
            </p>
            <Link to="/products">
              <Button variant="primary" size="lg">
                Khám Phá Sản Phẩm
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {items.map((wishlistItem) => {
                const product = wishlistItem.product;
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <ProductCard
                      product={product}
                      isInWishlist
                      onAddToCart={(p) => handleMoveToCart(p.id)}
                      onToggleWishlist={(p) => toggleWishlist(p)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(product.id, product.name)}
                      className="absolute left-3 top-3 z-30 rounded-full bg-red-500 p-2 text-white shadow transition-colors hover:bg-red-600"
                      aria-label={`Xóa ${product.name} khỏi yêu thích`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
