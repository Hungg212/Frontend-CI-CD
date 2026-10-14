import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { useCartStore } from '@/stores/cartStore';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

interface CartItemRowProps {
  item: {
    productId: string;
    slug: string;
    name: string;
    imageUrl: string;
    price: number;
    originalPrice?: number;
    weight?: string;
    quantity: number;
  };
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const { productId, slug, name, imageUrl, price, originalPrice, weight, quantity } = item;
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const unitPrice = price;
  const lineTotal = unitPrice * quantity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card padding="sm" className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
        <Link
          to={`/products/${slug}`}
          className="h-24 w-full flex-shrink-0 overflow-hidden rounded-lg bg-stone-100 sm:w-24 dark:bg-zinc-700"
        >
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={`/products/${slug}`}
            className="line-clamp-2 font-semibold text-stone-800 hover:text-amber-700 dark:text-stone-100 dark:hover:text-amber-500"
          >
            {name}
          </Link>
          {weight && (
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{weight}</p>
          )}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-semibold text-amber-700 dark:text-amber-500">
              {formatCurrency(unitPrice)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-stone-400 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2 sm:text-right">
          <QuantitySelector
            value={quantity}
            onChange={(q) => updateQuantity(productId, q)}
            min={1}
            max={99}
          />
          <p className="font-bold text-stone-800 dark:text-stone-100">
            {formatCurrency(lineTotal)}
          </p>
          <button
            type="button"
            onClick={() => removeItem(productId)}
            className="inline-flex items-center gap-1 text-sm text-red-500 transition-colors hover:text-red-700"
            aria-label={`Xóa ${name} khỏi giỏ hàng`}
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </button>
        </div>
      </Card>
    </motion.div>
  );
};

export default CartItemRow;
