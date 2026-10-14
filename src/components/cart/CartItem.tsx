import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { QuantitySelector } from '@/components/ui/QuantitySelector';

export interface CartItemProps {
  item: {
    id: string;
    productId: string;
    name: string;
    image: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    weight: string;
    slug: string;
  };
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-3 border-b border-stone-200 py-4 last:border-0 dark:border-zinc-700">
      <Link
        to={`/product/${item.slug}`}
        className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-zinc-700"
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to={`/product/${item.slug}`}
          className="line-clamp-2 text-sm font-medium text-stone-800 hover:text-amber-700 dark:text-stone-100 dark:hover:text-amber-500"
        >
          {item.name}
        </Link>
        <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
          Khối lượng: {item.weight}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-500">
            {formatPrice(item.price)}
          </span>
          {item.originalPrice && (
            <span className="text-xs text-stone-400 line-through">
              {formatPrice(item.originalPrice)}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <QuantitySelector
            value={item.quantity}
            onChange={(q) => updateQuantity(item.id, q)}
            min={1}
            max={99}
          />
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            aria-label="Xóa sản phẩm"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
