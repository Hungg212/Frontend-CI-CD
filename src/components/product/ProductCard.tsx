import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '@/data/products';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';

export interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'horizontal' | 'compact';
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isInWishlist?: boolean;
  className?: string;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

const _calculateDiscount = (originalPrice: number, salePrice: number): number => {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'default',
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
  className = '',
}) => {
  const [_imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasDiscount = product.salePrice !== undefined && product.salePrice > 0;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.salePrice ?? 0)) / product.price) * 100)
    : 0;
  const inStock = product.stock > 0;

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/product/${product.slug}`}
        className={`group flex gap-4 bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-shadow p-3 ${className}`}
      >
        <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-zinc-700">
          {!imageError ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400">
              <EyeOff className="w-6 h-6" />
            </div>
          )}
          {hasDiscount && (
            <Badge variant="sale" size="sm" className="absolute top-2 left-2">
              -{discountPercent}%
            </Badge>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">{product.category}</p>
          <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-2 line-clamp-2">
            {product.name}
          </h3>
          <Rating value={product.rating} size="sm" reviewCount={product.reviewCount} />
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-amber-700 dark:text-amber-500">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-stone-400 line-through">
                {formatPrice(product.price + (product.salePrice ?? 0))}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={`/product/${product.slug}`}
        className={`group flex flex-col bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-shadow p-3 ${className}`}
      >
        <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-100 dark:bg-zinc-700 mb-2">
          {!imageError ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400">
              <EyeOff className="w-6 h-6" />
            </div>
          )}
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">{product.category}</p>
        <h3 className="font-medium text-sm text-stone-800 dark:text-stone-100 line-clamp-2 mt-1">
          {product.name}
        </h3>
        <span className="text-sm font-bold text-amber-700 dark:text-amber-500 mt-1">
          {formatPrice(product.price)}
        </span>
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 overflow-hidden shadow-sm hover:shadow-xl transition-shadow ${className}`}
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-zinc-700">
          {!imageError ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400">
              <EyeOff className="w-12 h-12" />
            </div>
          )}

          {hasDiscount && (
            <Badge variant="sale" size="md" className="absolute top-3 left-3 z-10">
              -{discountPercent}%
            </Badge>
          )}

          {product.isNewArrival && (
            <Badge variant="new" size="sm" className="absolute top-3 left-3 z-10 mt-8">
              MỚI
            </Badge>
          )}

          {product.isBestSeller && (
            <Badge variant="bestseller" size="sm" className="absolute top-3 right-3 z-10">
              BÁN CHẠY
            </Badge>
          )}

          {isHovered && inStock && (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex gap-2 z-10">
              {onAddToCart && (
                <button
                  type="button"
                  onClick={e => {
                    e.preventDefault();
                    onAddToCart(product);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white text-stone-800 rounded-lg font-medium text-sm hover:bg-stone-100 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Thêm
                </button>
              )}
              <Link
                to={`/product/${product.slug}`}
                onClick={e => e.stopPropagation()}
                className="flex items-center justify-center px-3 py-2 bg-amber-700 text-white rounded-lg font-medium text-sm hover:bg-amber-800 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </Link>

      <button
        type="button"
        onClick={e => {
          e.preventDefault();
          onToggleWishlist?.(product);
        }}
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute top-3 right-3 z-20 p-2 bg-white/90 dark:bg-zinc-800/90 rounded-full shadow-sm hover:scale-110 transition-transform"
      >
        <Heart
          className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-stone-600 dark:text-stone-300'}`}
        />
      </button>

      {!inStock && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 pointer-events-none">
          <Badge variant="secondary" size="lg">
            HẾT HÀNG
          </Badge>
        </div>
      )}

      <div className="p-4">
        <Link to={`/category/${product.categorySlug}`} className="text-xs text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500">
          {product.category}
        </Link>
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-semibold text-stone-800 dark:text-stone-100 mt-1 line-clamp-2 hover:text-amber-700 dark:hover:text-amber-500 transition-colors min-h-[3rem]">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2">
          <Rating value={product.rating} size="sm" reviewCount={product.reviewCount} />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-amber-700 dark:text-amber-500">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && product.salePrice && (
              <span className="text-sm text-stone-400 line-through">
                {formatPrice(product.salePrice + product.price)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              if (onAddToCart && inStock) {
                onAddToCart(product);
              }
            }}
            disabled={!inStock}
            className="p-2 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white rounded-lg transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
