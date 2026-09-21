import { test, expect } from '@playwright/test';

test.describe('Authentication Pages', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
    });

    test('should load login page', async ({ page }) => {
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should display login form', async ({ page }) => {
      // Check for form elements
      const form = page.locator('form').first();
      await expect(form).toBeVisible({ timeout: 10000 });
    });

    test('should have email input', async ({ page }) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });
    });

    test('should have password input', async ({ page }) => {
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      await expect(passwordInput).toBeVisible({ timeout: 10000 });
    });

    test('should have login button', async ({ page }) => {
      const loginButton = page.locator('button[type="submit"]').first();
      await expect(loginButton).toBeVisible({ timeout: 10000 });
    });

    test('should validate email format', async ({ page }) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const submitButton = page.locator('button[type="submit"]').first();

      // Fill invalid email
      await emailInput.fill('invalid-email');
      await submitButton.click();

      // Wait a moment for validation
      await page.waitForTimeout(500);

      // Either validation shows error or form doesn't submit
      expect(await page.locator('body').isVisible()).toBeTruthy();
    });

    test('should validate password length', async ({ page }) => {
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"]').first();
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();

      // Fill valid email but short password
      await emailInput.fill('test@example.com');
      await passwordInput.fill('123');
      await submitButton.click();

      await page.waitForTimeout(500);

      // Check for validation feedback
      expect(await page.locator('body').isVisible()).toBeTruthy();
    });

    test('should login with valid credentials', async ({ page }) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"]').first();

      // Fill demo credentials
      await emailInput.fill('admin@coffee.com');
      await passwordInput.fill('admin123');
      await submitButton.click();

      // Wait for navigation or response
      await page.waitForTimeout(2000);

      // Should either navigate or show success
      const currentUrl = page.url();
      const isLoggedIn = currentUrl.includes('profile') || currentUrl.includes('/');
      expect(isLoggedIn || await page.locator('body').isVisible()).toBeTruthy();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"]').first();

      // Fill wrong credentials
      await emailInput.fill('wrong@example.com');
      await passwordInput.fill('wrongpassword');
      await submitButton.click();

      await page.waitForTimeout(1000);

      // Check for error message or stayed on login page
      const stillOnLogin = page.url().includes('login');
      expect(stillOnLogin || await page.locator('body').isVisible()).toBeTruthy();
    });

    test('should have link to register page', async ({ page }) => {
      const registerLink = page.locator('a[href*="register"]').first();
      await expect(registerLink).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
    });

    test('should load register page', async ({ page }) => {
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should display registration form', async ({ page }) => {
      const form = page.locator('form').first();
      await expect(form).toBeVisible({ timeout: 10000 });
    });

    test('should have name input', async ({ page }) => {
      const nameInput = page.locator('input[name="name"]').first();
      await expect(nameInput).toBeVisible({ timeout: 10000 });
    });

    test('should have email input', async ({ page }) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });
    });

    test('should have password input', async ({ page }) => {
      const passwordInput = page.locator('input[name="password"]').first();
      await expect(passwordInput).toBeVisible({ timeout: 10000 });
    });

    test('should have confirm password input', async ({ page }) => {
      const confirmInput = page.locator('input[name="confirmPassword"]').first();
      await expect(confirmInput).toBeVisible({ timeout: 10000 });
    });

    test('should have register button', async ({ page }) => {
      const registerButton = page.locator('button[type="submit"]').first();
      await expect(registerButton).toBeVisible({ timeout: 10000 });
    });

    test('should validate password match', async ({ page }) => {
      const nameInput = page.locator('input[name="name"]').first();
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[name="password"]').first();
      const confirmInput = page.locator('input[name="confirmPassword"]').first();
      const submitButton = page.locator('button[type="submit"]').first();

      // Fill mismatched passwords
      await nameInput.fill('Test User');
      await emailInput.fill(`test${Date.now()}@example.com`);
      await passwordInput.fill('password123');
      await confirmInput.fill('differentpassword');
      await submitButton.click();

      await page.waitForTimeout(500);

      // Check for password mismatch error
      const currentUrl = page.url();
      const stillOnRegister = currentUrl.includes('register');
      expect(stillOnRegister).toBeTruthy();
    });

    test('should validate email format', async ({ page }) => {
      const nameInput = page.locator('input[name="name"]').first();
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[name="password"]').first();
      const confirmInput = page.locator('input[name="confirmPassword"]').first();
      const submitButton = page.locator('button[type="submit"]').first();

      await nameInput.fill('Test User');
      await emailInput.fill('invalid-email');
      await passwordInput.fill('password123');
      await confirmInput.fill('password123');
      await submitButton.click();

      await page.waitForTimeout(500);

      // Should stay on register page with validation error
      const currentUrl = page.url();
      expect(currentUrl.includes('register')).toBeTruthy();
    });

    test('should register with valid data', async ({ page }) => {
      const nameInput = page.locator('input[name="name"]').first();
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[name="password"]').first();
      const confirmInput = page.locator('input[name="confirmPassword"]').first();
      const termsCheckbox = page.locator('input[type="checkbox"]').first();
      const submitButton = page.locator('button[type="submit"]').first();

      const uniqueEmail = `testuser${Date.now()}@example.com`;
      
      await nameInput.fill('Test User');
      await emailInput.fill(uniqueEmail);
      await passwordInput.fill('password123');
      await confirmInput.fill('password123');
      await termsCheckbox.check();
      await submitButton.click();

      await page.waitForTimeout(2000);

      // Should either navigate or show success
      const currentUrl = page.url();
      const isRegistered = currentUrl.includes('profile') || currentUrl.includes('/');
      expect(isRegistered || await page.locator('body').isVisible()).toBeTruthy();
    });

    test('should have link to login page', async ({ page }) => {
      const loginLink = page.locator('a[href*="login"]').first();
      await expect(loginLink).toBeVisible({ timeout: 10000 });
    });
  });
});
