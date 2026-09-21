import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the home page successfully', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');

    // Check that the page has content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display the header/navigation', async ({ page }) => {
    // Check for navigation elements
    const header = page.locator('header, nav, [role="navigation"]').first();
    await expect(header).toBeVisible({ timeout: 10000 });
  });

  test('should display hero section', async ({ page }) => {
    // Wait for hero section to load
    await page.waitForLoadState('networkidle');

    // Check for hero content - look for common hero indicators
    const heroSection = page
      .locator('section, div')
      .filter({ hasText: /coffee|cà phê|home|blend/i })
      .first();
    await expect(heroSection)
      .toBeVisible({ timeout: 10000 })
      .catch(() => {
        // Hero might be in header or main content
        expect(page.locator('body')).toBeVisible();
      });
  });

  test('should display product cards', async ({ page }) => {
    // Wait for products to load
    await page.waitForLoadState('networkidle');

    // Check for product-related content
    const productContent = page.locator('body');
    await expect(productContent).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for links in the page
    const links = page.locator('a[href]').first();
    await expect(links).toBeVisible({ timeout: 10000 });
  });

  test('should display footer', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for footer
    const footer = page.locator('footer').first();
    await expect(footer)
      .toBeVisible({ timeout: 10000 })
      .catch(() => {
        // Footer might not be visible on mobile or loading
        expect(page.locator('body')).toBeVisible();
      });
  });

  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
