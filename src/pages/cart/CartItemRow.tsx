import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/stores/cartStore';

export interface CartItemRowProps {
  item: import('@/stores/cartStore').CartLineItem;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const { product, quantity } = item;
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const unitPrice = product.salePrice ?? product.price;
  const lineTotal = unitPrice * quantity;
  const originalPrice = product.salePrice ? product.price : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card padding="sm" className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
        <Link
          to={`/product/${product.slug}`}
          className="h-24 w-full flex-shrink-0 overflow-hidden rounded-lg bg-stone-100 sm:w-24 dark:bg-zinc-700"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={`/product/${product.slug}`}
            className="line-clamp-2 font-semibold text-stone-800 hover:text-amber-700 dark:text-stone-100 dark:hover:text-amber-500"
          >
            {product.name}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" size="sm">
              {product.category}
            </Badge>
            <span className="text-xs text-stone-500 dark:text-stone-400">{product.weight}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-semibold text-amber-700 dark:text-amber-500">
              {formatCurrency(unitPrice)}
            </span>
            {originalPrice && (
              <span className="text-sm text-stone-400 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2 sm:text-right">
          <QuantitySelector
            value={quantity}
            onChange={(q) => updateQuantity(item.id, q)}
            min={1}
            max={product.stock}
          />
          <p className="font-bold text-stone-800 dark:text-stone-100">
            {formatCurrency(lineTotal)}
          </p>
          <button
            type="button"
            onClick={() => removeItem(product.id)}
            className="inline-flex items-center gap-1 text-sm text-red-500 transition-colors hover:text-red-700"
            aria-label={`Xóa ${product.name} khỏi giỏ hàng`}
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
