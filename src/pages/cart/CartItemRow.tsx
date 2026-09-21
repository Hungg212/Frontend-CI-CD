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
      <Card padding="sm" className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <Link
          to={`/product/${product.slug}`}
          className="flex-shrink-0 w-full sm:w-24 h-24 rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-700"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            to={`/product/${product.slug}`}
            className="font-semibold text-stone-800 dark:text-stone-100 hover:text-amber-700 dark:hover:text-amber-500 line-clamp-2"
          >
            {product.name}
          </Link>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
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

        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 sm:gap-2 sm:text-right">
          <QuantitySelector
            value={quantity}
            onChange={(q) => updateQuantity(item.id, q)}
            min={1}
            max={product.stock}
          />
          <p className="font-bold text-stone-800 dark:text-stone-100">{formatCurrency(lineTotal)}</p>
          <button
            type="button"
            onClick={() => removeItem(product.id)}
            className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
            aria-label={`Xóa ${product.name} khỏi giỏ hàng`}
          >
            <Trash2 className="w-4 h-4" />
            Xóa
          </button>
        </div>
      </Card>
    </motion.div>
  );
};

export default CartItemRow;
