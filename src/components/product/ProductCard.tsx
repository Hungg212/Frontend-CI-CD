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
        className={`group flex gap-4 overflow-hidden rounded-xl border border-stone-200 bg-white p-3 transition-shadow hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800 ${className}`}
      >
        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-zinc-700">
          {!imageError ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone-400">
              <EyeOff className="h-6 w-6" />
            </div>
          )}
          {hasDiscount && (
            <Badge variant="sale" size="sm" className="absolute left-2 top-2">
              -{discountPercent}%
            </Badge>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs text-stone-500 dark:text-stone-400">{product.category}</p>
          <h3 className="mb-2 line-clamp-2 font-semibold text-stone-800 dark:text-stone-100">
            {product.name}
          </h3>
          <Rating value={product.rating} size="sm" reviewCount={product.reviewCount} />
          <div className="mt-2 flex items-center gap-2">
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
        className={`group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white p-3 transition-shadow hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800 ${className}`}
      >
        <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-stone-100 dark:bg-zinc-700">
          {!imageError ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone-400">
              <EyeOff className="h-6 w-6" />
            </div>
          )}
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-stone-800 dark:text-stone-100">
          {product.name}
        </h3>
        <span className="mt-1 text-sm font-bold text-amber-700 dark:text-amber-500">
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
      className={`group relative overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-800 ${className}`}
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
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone-400">
              <EyeOff className="h-12 w-12" />
            </div>
          )}

          {hasDiscount && (
            <Badge variant="sale" size="md" className="absolute left-3 top-3 z-10">
              -{discountPercent}%
            </Badge>
          )}

          {product.isNewArrival && (
            <Badge variant="new" size="sm" className="absolute left-3 top-3 z-10 mt-8">
              MỚI
            </Badge>
          )}

          {product.isBestSeller && (
            <Badge variant="bestseller" size="sm" className="absolute right-3 top-3 z-10">
              BÁN CHẠY
            </Badge>
          )}

          {isHovered && inStock && (
            <div className="absolute inset-x-0 bottom-0 z-10 flex gap-2 bg-gradient-to-t from-black/60 to-transparent p-3">
              {onAddToCart && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onAddToCart(product);
                  }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-100"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Thêm
                </button>
              )}
              <Link
                to={`/product/${product.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center rounded-lg bg-amber-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-800"
              >
                <Eye className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onToggleWishlist?.(product);
        }}
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute right-3 top-3 z-20 rounded-full bg-white/90 p-2 shadow-sm transition-transform hover:scale-110 dark:bg-zinc-800/90"
      >
        <Heart
          className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-stone-600 dark:text-stone-300'}`}
        />
      </button>

      {!inStock && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/40">
          <Badge variant="secondary" size="lg">
            HẾT HÀNG
          </Badge>
        </div>
      )}

      <div className="p-4">
        <Link
          to={`/category/${product.categorySlug}`}
          className="text-xs text-stone-500 hover:text-amber-700 dark:text-stone-400 dark:hover:text-amber-500"
        >
          {product.category}
        </Link>
        <Link to={`/product/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 min-h-[3rem] font-semibold text-stone-800 transition-colors hover:text-amber-700 dark:text-stone-100 dark:hover:text-amber-500">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2">
          <Rating value={product.rating} size="sm" reviewCount={product.reviewCount} />
        </div>
        <div className="mt-3 flex items-center justify-between">
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
            onClick={(e) => {
              e.preventDefault();
              if (onAddToCart && inStock) {
                onAddToCart(product);
              }
            }}
            disabled={!inStock}
            className="rounded-lg bg-amber-700 p-2 text-white transition-colors hover:bg-amber-800 disabled:bg-stone-300"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
