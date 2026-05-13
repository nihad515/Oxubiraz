import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('login page renders correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Oxubiraz/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page.locator('[class*="destructive"]')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.getByLabel(/username/i).fill('wronguser');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 });
  });

  test('register page has role tabs', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('button', { name: /student/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /teacher/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /parent/i })).toBeVisible();
  });

  test('locale switcher works', async ({ page }) => {
    const switcher = page.locator('[aria-label="English"]');
    await switcher.click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('mobile: login page is touch-friendly', async ({ page }) => {
    const loginBtn = page.getByRole('button', { name: /login/i });
    const box = await loginBtn.boundingBox();
    // Minimum 44px touch target
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  });

  test('forgot password link navigates correctly', async ({ page }) => {
    await page.getByRole('link', { name: /forgot/i }).click();
    await expect(page).toHaveURL('/forgot-password');
  });
});
