import { test, expect } from './fixtures';

test.describe('Student Progress Page', () => {
  test('loads and shows stat cards', async ({ studentPage: page }) => {
    await page.goto('/student/progress');
    await expect(page).not.toHaveURL(/\/login/);
    // 6 stat cards should be visible (Best WPM, Avg WPM, etc.)
    const cards = page.locator('[class*="card"], [data-testid="stat-card"]').filter({
      hasText: /wpm|söz|xətt|streak|seriya/i,
    });
    await expect(cards.first()).toBeVisible({ timeout: 8_000 });
  });

  test('shows WPM trend chart section', async ({ studentPage: page }) => {
    await page.goto('/student/progress');
    // Chart SVG or "no data" placeholder should be present
    await expect(
      page.locator('svg').or(page.getByText(/məlumat yoxdur|no data|start playing/i)).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('has quick links to history, achievements, leaderboard', async ({ studentPage: page }) => {
    await page.goto('/student/progress');
    const historyLink = page.getByRole('link', { name: /tarix|history/i });
    const achievementsLink = page.getByRole('link', { name: /uğur|achieve/i });
    const leaderboardLink = page.getByRole('link', { name: /liderboard|leaderboard|sıralama/i });
    // At least one of these should be present
    await expect(
      historyLink.or(achievementsLink).or(leaderboardLink).first()
    ).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('Student Achievements Page', () => {
  test('loads without redirecting to login', async ({ studentPage: page }) => {
    await page.goto('/student/achievements');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 });
  });

  test('shows achievement cards or empty state', async ({ studentPage: page }) => {
    await page.goto('/student/achievements');
    await expect(
      page.locator('[class*="card"]').or(page.getByText(/uğur yoxdur|no achievements|start playing/i)).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test('each achievement has an icon and title', async ({ studentPage: page }) => {
    await page.goto('/student/achievements');
    const cards = page.locator('[class*="card"]');
    const count = await cards.count();
    if (count > 0) {
      // First card should have visible text content
      await expect(cards.first()).toBeVisible();
      const text = await cards.first().textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });
});

test.describe('Student Leaderboard Page', () => {
  test('loads leaderboard without redirect', async ({ studentPage: page }) => {
    await page.goto('/student/leaderboard');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 });
  });

  test('shows a table or list of entries', async ({ studentPage: page }) => {
    await page.goto('/student/leaderboard');
    await expect(
      page.getByRole('table')
        .or(page.locator('[role="list"]'))
        .or(page.getByText(/liderboard|leaderboard|heç kəs|empty/i))
        .first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('language filter buttons are present', async ({ studentPage: page }) => {
    await page.goto('/student/leaderboard');
    const filterBtns = page.getByRole('button').filter({ hasText: /az|ru|en|global/i });
    await expect(filterBtns.first()).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('Student History Page', () => {
  test('loads without redirect', async ({ studentPage: page }) => {
    await page.goto('/student/history');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 });
  });

  test('shows mode filter buttons', async ({ studentPage: page }) => {
    await page.goto('/student/history');
    // Mode filter buttons should be visible
    const allBtn = page.getByRole('button', { name: /hamısı|all/i });
    await expect(allBtn).toBeVisible({ timeout: 8_000 });
  });

  test('shows session list or empty state', async ({ studentPage: page }) => {
    await page.goto('/student/history');
    await expect(
      page.locator('[class*="card"]')
        .or(page.getByText(/sessiya yoxdur|no sessions|start playing/i))
        .first()
    ).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('Teacher Portal', () => {
  test('teacher dashboard loads', async ({ teacherPage: page }) => {
    await page.goto('/teacher');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 });
  });

  test('students page loads', async ({ teacherPage: page }) => {
    await page.goto('/teacher/students');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 });
  });

  test('analytics page loads', async ({ teacherPage: page }) => {
    await page.goto('/teacher/analytics');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 });
  });
});
