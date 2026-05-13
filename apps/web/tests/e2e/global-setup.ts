import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Verify the app is reachable before running tests
  const { baseURL } = config.projects[0].use;
  if (!baseURL) return;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(baseURL, { timeout: 30_000 });
  } catch {
    throw new Error(`App not reachable at ${baseURL}. Make sure the dev server is running.`);
  } finally {
    await browser.close();
  }
}

export default globalSetup;
