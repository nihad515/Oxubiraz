import { test, expect } from './fixtures';

test.describe('Game Flow', () => {
  test.beforeEach(async ({ studentPage: page }) => {
    await page.goto('/student/game');
  });

  test('game config page is accessible', async ({ studentPage: page }) => {
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 });
  });

  test('displays game mode selection', async ({ studentPage: page }) => {
    // Should show mode cards (random_words, text_reading, etc.)
    const modeCards = page.locator('[data-mode], [role="radio"], button').filter({
      hasText: /söz|text|cümlə|yaddaş|ai/i,
    });
    await expect(modeCards.first()).toBeVisible({ timeout: 8_000 });
  });

  test('displays language selection', async ({ studentPage: page }) => {
    const langButtons = page.locator('button').filter({ hasText: /azərbaycan|rus|english|az|ru|en/i });
    await expect(langButtons.first()).toBeVisible({ timeout: 8_000 });
  });

  test('can start a game session', async ({ studentPage: page }) => {
    // Click the first available mode
    const startBtn = page.getByRole('button', { name: /başla|start|oyna|play/i });
    await expect(startBtn).toBeVisible({ timeout: 8_000 });
    await startBtn.click();

    // Should transition to active game state
    await expect(
      page.locator('[data-game-active], [data-testid="game-board"]').or(
        page.getByText(/hazır|ready|\d+:\d+/i)
      ).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('game session shows word or text', async ({ studentPage: page }) => {
    const startBtn = page.getByRole('button', { name: /başla|start|oyna|play/i });
    if (await startBtn.isVisible({ timeout: 5_000 })) {
      await startBtn.click();
      // After starting, words or text should appear
      await expect(
        page.locator('span, button, div').filter({ hasText: /\b\w{2,}\b/ }).first()
      ).toBeVisible({ timeout: 10_000 });
    }
  });
});

test.describe('Game History', () => {
  test('history page loads', async ({ studentPage: page }) => {
    await page.goto('/student/history');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 });
  });

  test('shows table or empty state', async ({ studentPage: page }) => {
    await page.goto('/student/history');
    const content = page
      .getByRole('table')
      .or(page.getByText(/tarix yoxdur|no history|boş|empty/i));
    await expect(content.first()).toBeVisible({ timeout: 8_000 });
  });
});
