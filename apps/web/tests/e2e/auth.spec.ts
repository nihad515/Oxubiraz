import { test, expect, USERS } from './fixtures';

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('renders login page', async ({ page }) => {
      await page.goto('/login');
      await expect(page).toHaveTitle(/Oxubiraz/);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('shows validation errors on empty submit', async ({ page }) => {
      await page.goto('/login');
      await page.getByRole('button', { name: /daxil ol|login|sign in/i }).click();
      const error = page.getByRole('alert').or(page.locator('[data-slot="form-message"]')).first();
      await expect(error).toBeVisible();
    });

    test('shows error on wrong credentials', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/e-poçt|email/i).fill('wrong@example.com');
      await page.getByLabel(/şifrə|password/i).fill('wrongpassword');
      await page.getByRole('button', { name: /daxil ol|login|sign in/i }).click();
      const error = page.getByRole('alert').or(page.locator('[data-sonner-toast]')).first();
      await expect(error).toBeVisible({ timeout: 8_000 });
    });

    test('student can log in and reaches dashboard', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/e-poçt|email/i).fill(USERS.student.email);
      await page.getByLabel(/şifrə|password/i).fill(USERS.student.password);
      await page.getByRole('button', { name: /daxil ol|login|sign in/i }).click();
      await page.waitForURL(/\/student/, { timeout: 10_000 });
      await expect(page).toHaveURL(/\/student/);
    });

    test('admin can log in and reaches admin dashboard', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/e-poçt|email/i).fill(USERS.admin.email);
      await page.getByLabel(/şifrə|password/i).fill(USERS.admin.password);
      await page.getByRole('button', { name: /daxil ol|login|sign in/i }).click();
      await page.waitForURL(/\/admin/, { timeout: 10_000 });
      await expect(page).toHaveURL(/\/admin/);
    });

    test('redirects to login when accessing protected route unauthenticated', async ({ page }) => {
      await page.goto('/student/dashboard');
      await page.waitForURL(/\/login/, { timeout: 5_000 });
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Logout', () => {
    test('student can log out', async ({ studentPage: page }) => {
      await page.goto('/student');
      await page.getByRole('button', { name: /profil|profile|account|hesab/i }).click();
      await page.getByRole('menuitem', { name: /çıx|logout|sign out/i }).click();
      await page.waitForURL(/\/login/, { timeout: 5_000 });
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Registration', () => {
    test('renders register page', async ({ page }) => {
      await page.goto('/register');
      await expect(page).toHaveTitle(/Oxubiraz/);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('shows validation for required fields', async ({ page }) => {
      await page.goto('/register');
      await page.getByRole('button', { name: /qeydiyyat|register|sign up/i }).click();
      const errors = page.locator('[data-slot="form-message"], [role="alert"]');
      await expect(errors.first()).toBeVisible();
    });
  });
});
