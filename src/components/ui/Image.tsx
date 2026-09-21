import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';
import { ImageIcon } from 'lucide-react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  skeleton?: boolean;
  fallback?: React.ReactNode;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  auto: '',
};

export function Image({
  src,
  alt = '',
  skeleton = true,
  fallback,
  aspectRatio = 'auto',
  className,
  ...props
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-stone-100 dark:bg-zinc-800',
          aspectRatio !== 'auto' && aspectRatioClasses[aspectRatio],
          className
        )}
      >
        {fallback || (
          <div className="flex flex-col items-center gap-2 text-stone-400">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">Không thể tải ảnh</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        aspectRatio !== 'auto' && aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {skeleton && isLoading && (
        <div className="absolute inset-0">
          <Skeleton className="h-full w-full" />
        </div>
      )}
      <img
        src={src ?? ''}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        {...props}
      />
    </div>
  );
}

// Responsive image with multiple sources
export function ResponsiveImage({
  src,
  alt,
  srcSet,
  sizes,
  ...props
}: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'srcSet' | 'sizes'> & {
  srcSet?: string;
  sizes?: string;
}) {
  return (
    <Image
      src={src ?? ''}
      alt={alt}
      srcSet={srcSet}
      sizes={sizes}
      {...props}
    />
  );
}
