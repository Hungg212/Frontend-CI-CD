import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | 'ellipsis')[] {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from({ length: 3 + 2 * siblingCount }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = Array.from(
      { length: 3 + 2 * siblingCount },
      (_, i) => totalPages - 2 - 2 * siblingCount + i
    );
    return [1, 'ellipsis', ...rightRange];
  }

  if (showLeftEllipsis && showRightEllipsis) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
  }

  return [];
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const pageNumbers = getPaginationRange(currentPage, totalPages, siblingCount);

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 transition-colors',
          'hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-zinc-800',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500'
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {pageNumbers.map((page, index) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-9 w-9 items-center justify-center text-stone-500"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors',
              currentPage === page
                ? 'bg-amber-700 text-white dark:bg-amber-600'
                : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-zinc-800',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500'
            )}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 transition-colors',
          'hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-zinc-800',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500'
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
}
