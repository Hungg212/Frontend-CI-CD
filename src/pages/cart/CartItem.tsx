import React from 'react';
import { Minus, Plus, Trash2, Heart, Package } from 'lucide-react';
import { motion } from 'framer-motion';
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
      className="flex gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:gap-4 dark:border-zinc-700 dark:bg-zinc-800"
    >
      <div className="flex-shrink-0">
        <div className="h-20 w-20 overflow-hidden rounded-lg bg-stone-100 sm:h-24 sm:w-24 dark:bg-zinc-700">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-medium text-stone-800 dark:text-stone-100">
            {product.name}
          </h3>
          <button
            type="button"
            onClick={() => onRemove(product.id)}
            disabled={isUpdating}
            className="flex-shrink-0 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-900/20"
            aria-label={`Xóa ${product.name} khỏi giỏ hàng`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
          <Package className="h-3 w-3" />
          <span>SKU: {product.sku}</span>
          <span>•</span>
          <span>{product.weight}</span>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
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

          <div className="flex min-w-[180px] flex-1 items-center justify-between gap-3">
            <div className="flex items-center overflow-hidden rounded-lg border border-stone-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1 || isUpdating}
                className="flex h-8 w-8 items-center justify-center text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-300 dark:hover:bg-zinc-700"
                aria-label="Giảm số lượng"
              >
                <Minus className="h-3.5 w-3.5" />
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
                className="h-8 w-12 bg-transparent text-center text-sm font-medium text-stone-800 [appearance:textfield] focus:outline-none dark:text-stone-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label="Số lượng"
              />
              <button
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= product.stock || isUpdating}
                className="flex h-8 w-8 items-center justify-center text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-300 dark:hover:bg-zinc-700"
                aria-label="Tăng số lượng"
              >
                <Plus className="h-3.5 w-3.5" />
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
            className="mt-2 inline-flex items-center gap-1 text-xs text-stone-500 transition-colors hover:text-rose-600 disabled:opacity-50 dark:text-stone-400 dark:hover:text-rose-400"
          >
            <Heart className="h-3.5 w-3.5" />
            Chuyển sang yêu thích
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default CartItem;
