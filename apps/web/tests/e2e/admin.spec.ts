import { test, expect } from './fixtures';

test.describe('Admin Panel', () => {
  test('admin dashboard loads', async ({ adminPage: page }) => {
    await page.goto('/admin');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 });
  });

  test('user management page loads', async ({ adminPage: page }) => {
    await page.goto('/admin/users');
    await expect(page.getByRole('table').or(
      page.locator('[data-testid="user-list"]')
    ).first()).toBeVisible({ timeout: 8_000 });
  });

  test('user list shows data rows', async ({ adminPage: page }) => {
    await page.goto('/admin/users');
    const rows = page.getByRole('row');
    // Header + at least 1 data row
    await expect(rows).toHaveCount({ min: 2 }, { timeout: 8_000 });
  });

  test('can search users', async ({ adminPage: page }) => {
    await page.goto('/admin/users');
    const search = page.getByPlaceholder(/axtar|search/i);
    await expect(search).toBeVisible({ timeout: 5_000 });
    await search.fill('test');
    await page.waitForTimeout(500); // debounce
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('CSV export button is present', async ({ adminPage: page }) => {
    await page.goto('/admin/users');
    const exportBtn = page.getByRole('button', { name: /export|ixrac|csv/i });
    await expect(exportBtn).toBeVisible({ timeout: 5_000 });
  });

  test('analytics page loads', async ({ adminPage: page }) => {
    await page.goto('/admin/analytics');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 });
    // Charts or loading state
    await expect(
      page.locator('svg, canvas, [data-testid="chart"]').or(
        page.getByText(/yüklənir|loading/i)
      ).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test('word lists page loads', async ({ adminPage: page }) => {
    await page.goto('/admin/words');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 });
  });

  test('competitions page loads', async ({ adminPage: page }) => {
    await page.goto('/admin/competitions');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 });
  });

  test('audit log page loads', async ({ adminPage: page }) => {
    await page.goto('/admin/audit-logs');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 });
  });

  test('student cannot access admin routes', async ({ studentPage: page }) => {
    await page.goto('/admin/users');
    // Should redirect or show forbidden
    await expect(page).not.toHaveURL('/admin/users', { timeout: 5_000 });
  });
});
