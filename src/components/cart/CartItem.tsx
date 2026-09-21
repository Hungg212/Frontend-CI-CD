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
    <div className="flex gap-3 py-4 border-b border-stone-200 dark:border-zinc-700 last:border-0">
      <Link
        to={`/product/${item.slug}`}
        className="flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg bg-stone-100 dark:bg-zinc-700"
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          to={`/product/${item.slug}`}
          className="font-medium text-sm text-stone-800 dark:text-stone-100 hover:text-amber-700 dark:hover:text-amber-500 line-clamp-2"
        >
          {item.name}
        </Link>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          Khối lượng: {item.weight}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-500">
            {formatPrice(item.price)}
          </span>
          {item.originalPrice && (
            <span className="text-xs text-stone-400 line-through">
              {formatPrice(item.originalPrice)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <QuantitySelector
            value={item.quantity}
            onChange={q => updateQuantity(item.id, q)}
            min={1}
            max={99}
          />
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            aria-label="Xóa sản phẩm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
