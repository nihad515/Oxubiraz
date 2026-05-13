import { test, expect, type Page } from '@playwright/test';

async function loginAsStudent(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/username/i).fill('test_student');
  await page.getByLabel(/password/i).fill('Password@123');
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL('**/student**');
}

test.describe('Game Engine', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await page.goto('/student/play');
  });

  test('game config page renders all modes', async ({ page }) => {
    for (const mode of ['random_words', 'text_reading', 'memory', 'ai']) {
      await expect(page.locator(`[data-mode="${mode}"]`)).toBeVisible();
    }
  });

  test('can select duration options', async ({ page }) => {
    for (const dur of ['30', '60', '90']) {
      await page.locator(`button:has-text("${dur}")`).click();
      await expect(page.locator(`button:has-text("${dur}")`)).toHaveClass(/primary/);
    }
  });

  test('start button initiates countdown', async ({ page }) => {
    await page.getByRole('button', { name: /start/i }).click();
    await expect(page.locator('text=/[1-3]/')).toBeVisible({ timeout: 5000 });
  });

  test('game board shows words after countdown', async ({ page }) => {
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(4000); // Wait for 3-2-1-GO
    await expect(page.locator('[data-word-index]')).toBeVisible({ timeout: 5000 });
  });

  test('game result shows after timer expires', async ({ page }) => {
    // Select 30s duration for faster test
    await page.locator('button:has-text("30")').click();
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(35000); // Wait 35s for 30s game + buffer
    await expect(page.locator('text=/WPM/i')).toBeVisible();
    await expect(page.getByRole('button', { name: /play again/i })).toBeVisible();
  });
});
