import { describe, it, expect } from 'vitest';
import { cn } from './utils';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  truncateText,
  generateOrderNumber,
  generateId,
  slugify,
} from '../utils/formatters';

describe('utils', () => {
  describe('cn()', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
    });

    it('should handle undefined and false values', () => {
      const result = cn('base-class', undefined, false, 'valid-class');
      expect(result).toContain('base-class');
      expect(result).toContain('valid-class');
    });

    it('should merge tailwind classes with clsx', () => {
      const result = cn('px-2 py-1', 'px-4'); // px-4 should win
      expect(result).toContain('py-1');
    });

    it('should handle empty inputs', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle object inputs', () => {
      const result = cn({ active: true, disabled: false });
      expect(result).toContain('active');
      expect(result).not.toContain('disabled');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in VND', () => {
      const result = formatCurrency(250000);
      expect(result).toContain('250');
      // Vietnamese VND uses ₫ symbol
      expect(result).toMatch(/₫|VND/);
    });

    it('should format large amounts correctly', () => {
      const result = formatCurrency(1500000);
      expect(result).toContain('1.500.000');
    });

    it('should format zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });

    it('should handle custom currency', () => {
      const result = formatCurrency(100, 'USD');
      expect(result).toBeDefined();
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with Vietnamese locale', () => {
      const result = formatNumber(1500000);
      expect(result).toContain('1.500.000');
    });

    it('should format small numbers', () => {
      const result = formatNumber(100);
      expect(result).toContain('100');
    });
  });

  describe('formatDate', () => {
    it('should format date string', () => {
      const result = formatDate('2025-09-20T10:00:00Z');
      expect(result).toContain('20');
      expect(result).toContain('09');
      expect(result).toContain('2025');
    });

    it('should format Date object', () => {
      const date = new Date('2025-09-20');
      const result = formatDate(date);
      expect(result).toContain('2025');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const result = formatDateTime('2025-09-20T10:30:00Z');
      expect(result).toContain('20');
      expect(result).toContain('2025');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "Vừa xong" for recent dates', () => {
      const now = new Date();
      const result = formatRelativeTime(now);
      expect(result).toBe('Vừa xong');
    });

    it('should format minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = formatRelativeTime(fiveMinutesAgo);
      expect(result).toContain('phút');
    });

    it('should format hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = formatRelativeTime(twoHoursAgo);
      expect(result).toContain('giờ');
    });

    it('should format days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(threeDaysAgo);
      expect(result).toContain('ngày');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText =
        'This is a very long text that should be truncated because it exceeds the maximum length allowed.';
      const result = truncateText(longText, 50);
      expect(result.length).toBeLessThanOrEqual(53); // 50 + '...'
      expect(result).toContain('...');
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 50);
      expect(result).toBe(shortText);
    });

    it('should use default max length of 100', () => {
      const longText = 'a'.repeat(150);
      const result = truncateText(longText);
      expect(result.length).toBe(103); // 100 + '...'
    });
  });

  describe('generateOrderNumber', () => {
    it('should generate order number with correct format', () => {
      const result = generateOrderNumber();
      expect(result).toMatch(/^CHB-\d{8}-\d{3}$/);
    });

    it('should generate unique order numbers', () => {
      const result1 = generateOrderNumber();
      const result2 = generateOrderNumber();
      expect(result1).not.toBe(result2);
    });
  });

  describe('generateId', () => {
    it('should generate id with prefix', () => {
      const result = generateId('user');
      expect(result).toMatch(/^user-\d+-[a-z0-9]+$/);
    });

    it('should generate id with default prefix', () => {
      const result = generateId();
      expect(result).toMatch(/^id-\d+-[a-z0-9]+$/);
    });

    it('should generate unique ids', () => {
      const result1 = generateId('test');
      const result2 = generateId('test');
      expect(result1).not.toBe(result2);
    });
  });

  describe('slugify', () => {
    it('should convert text to slug', () => {
      const result = slugify('Cà Phê Arabica Việt Nam');
      expect(result).toBe('ca-phe-arabica-viet-nam');
    });

    it('should handle special characters', () => {
      const result = slugify('Cà Phê Arabica!@#$%^&*()');
      expect(result).toBe('ca-phe-arabica');
    });

    it('should handle Vietnamese characters', () => {
      const result = slugify('Đắk Lắk');
      expect(result).toBe('dak-lak');
    });

    it('should handle multiple spaces', () => {
      const result = slugify('multiple   spaces');
      expect(result).toBe('multiple-spaces');
    });

    it('should handle empty string', () => {
      const result = slugify('');
      expect(result).toBe('');
    });
  });
});
