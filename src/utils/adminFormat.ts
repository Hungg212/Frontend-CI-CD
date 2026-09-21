/**
 * Format a number as Vietnamese Dong currency.
 */
export const formatVND = (value: number): string => {
  if (Number.isNaN(value)) return '0₫';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)} tỷ₫`;
  }
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} triệu₫`;
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Compact number formatter for charts (e.g. 25tr, 1.2tỷ).
 */
export const formatCompactVND = (value: number): string => {
  if (Number.isNaN(value)) return '0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}tỷ`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}tr`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toString();
};

/**
 * Format a date string into Vietnamese-style date + time.
 */
export const formatDateTime = (iso: string): string => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return iso;
  }
};

/**
 * Format a date string into a short date.
 */
export const formatDate = (iso: string): string => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return iso;
  }
};

/**
 * Slugify a string for use as a URL slug.
 */
export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
