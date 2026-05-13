import { test, expect } from './fixtures';

test.describe('Student Dashboard', () => {
  test('renders key stats', async ({ studentPage: page }) => {
    await page.goto('/student/dashboard');
    // XP, streak, level stats should be visible
    await expect(page.getByText(/xp|streak|səviyyə|level/i).first()).toBeVisible({ timeout: 8_000 });
  });

  test('shows navigation items', async ({ studentPage: page }) => {
    await page.goto('/student/dashboard');
    // Sidebar or bottom nav should exist
    const nav = page.getByRole('navigation').first();
    await expect(nav).toBeVisible();
  });

  test('mobile bottom nav is visible on small screen', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await context.newPage();

    // Need to log in
    await page.goto('/login');
    await page.getByLabel(/e-poçt|email/i).fill(process.env.E2E_STUDENT_EMAIL ?? 'student@test.com');
    await page.getByLabel(/şifrə|password/i).fill(process.env.E2E_STUDENT_PASSWORD ?? 'password');
    await page.getByRole('button', { name: /daxil ol|login|sign in/i }).click();
    await page.waitForURL(/\/student/, { timeout: 10_000 });

    await page.goto('/student/dashboard');
    // Bottom nav should be visible on mobile (not hidden by lg:hidden)
    const bottomNav = page.locator('nav').last();
    await expect(bottomNav).toBeVisible();
    await context.close();
  });

  test('leaderboard tab loads', async ({ studentPage: page }) => {
    await page.goto('/student/leaderboard');
    await expect(page.getByRole('table').or(page.locator('[role="list"]')).first()).toBeVisible({ timeout: 8_000 });
  });

  test('profile page loads with user data', async ({ studentPage: page }) => {
    await page.goto('/student/profile');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 5_000 });
  });

  test('notifications page loads', async ({ studentPage: page }) => {
    await page.goto('/student/notifications');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('main')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('login page has no obvious ARIA violations', async ({ page }) => {
    await page.goto('/login');
    // Check that form inputs have labels
    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      const hasLabel = id
        ? await page.locator(`label[for="${id}"]`).count() > 0
        : false;
      expect(hasLabel || ariaLabel || ariaLabelledby).toBeTruthy();
    }
  });
});
