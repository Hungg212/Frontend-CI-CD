import React from 'react';
import { Minus, Plus, Trash2, Heart, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import type { CartItem as CartItemType } from '@/types';

export interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onMoveToWishlist?: (productId: string) => void;
  isUpdating?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
  onMoveToWishlist,
  isUpdating = false,
}: CartItemProps) {
  const { product, quantity } = item;
  const unitPrice = product.salePrice ?? product.price;
  const lineTotal = unitPrice * quantity;

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(product.id, quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < product.stock) {
      onQuantityChange(product.id, quantity + 1);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 sm:gap-4 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
    >
      <div className="flex-shrink-0">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-700">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-medium text-stone-800 dark:text-stone-100 line-clamp-2">
            {product.name}
          </h3>
          <button
            type="button"
            onClick={() => onRemove(product.id)}
            disabled={isUpdating}
            className="flex-shrink-0 p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            aria-label={`Xóa ${product.name} khỏi giỏ hàng`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-2">
          <Package className="w-3 h-3" />
          <span>SKU: {product.sku}</span>
          <span>•</span>
          <span>{product.weight}</span>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap mt-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold text-amber-700 dark:text-amber-500">
              {formatCurrency(unitPrice)}
            </span>
            {product.salePrice && (
              <span className="text-xs text-stone-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 flex-1 min-w-[180px]">
            <div className="flex items-center border border-stone-200 dark:border-zinc-700 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1 || isUpdating}
                className="w-8 h-8 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Giảm số lượng"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0 && val <= product.stock) {
                    onQuantityChange(product.id, val);
                  }
                }}
                disabled={isUpdating}
                min={1}
                max={product.stock}
                className="w-12 h-8 text-center text-sm font-medium bg-transparent text-stone-800 dark:text-stone-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Số lượng"
              />
              <button
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= product.stock || isUpdating}
                className="w-8 h-8 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Tăng số lượng"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-right">
              <p className="text-xs text-stone-500 dark:text-stone-400">Thành tiền</p>
              <p className="text-base font-bold text-stone-800 dark:text-stone-100">
                {formatCurrency(lineTotal)}
              </p>
            </div>
          </div>
        </div>

        {onMoveToWishlist && (
          <button
            type="button"
            onClick={() => onMoveToWishlist(product.id)}
            disabled={isUpdating}
            className="mt-2 inline-flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors disabled:opacity-50"
          >
            <Heart className="w-3.5 h-3.5" />
            Chuyển sang yêu thích
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default CartItem;
