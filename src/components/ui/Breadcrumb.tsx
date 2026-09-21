import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  homeIcon?: boolean;
  className?: string;
}

export function Breadcrumb({
  items,
  separator = '/',
  homeIcon = true,
  className,
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-sm">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 text-stone-500 hover:text-amber-700 dark:text-stone-400 dark:hover:text-amber-500"
          >
            {homeIcon ? <Home className="h-4 w-4" /> : 'Trang chủ'}
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="text-stone-400">{separator}</span>
            {item.href ? (
              <Link
                to={item.href}
                className="text-stone-500 hover:text-amber-700 dark:text-stone-400 dark:hover:text-amber-500"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-stone-800 dark:text-stone-200">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Auto-generate breadcrumb from path
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  return paths.map((path, index) => {
    const href = `/${paths.slice(0, index + 1).join('/')}`;
    const label = path
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return { label, href };
  });
}
