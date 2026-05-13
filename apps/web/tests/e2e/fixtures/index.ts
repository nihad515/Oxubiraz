import { test as base, expect, type Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  role: 'student' | 'admin' | 'teacher' | 'parent';
}

const USERS: Record<string, TestUser> = {
  student: {
    email: process.env.E2E_STUDENT_EMAIL ?? 'student@test.com',
    password: process.env.E2E_STUDENT_PASSWORD ?? 'password',
    role: 'student',
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? 'admin@test.com',
    password: process.env.E2E_ADMIN_PASSWORD ?? 'password',
    role: 'admin',
  },
};

async function loginAs(page: Page, user: TestUser) {
  await page.goto('/login');
  await page.getByLabel(/e-poçt|email/i).fill(user.email);
  await page.getByLabel(/şifrə|password/i).fill(user.password);
  await page.getByRole('button', { name: /daxil ol|login|sign in/i }).click();
  await page.waitForURL(/\/(student|admin|teacher|parent)/, { timeout: 10_000 });
}

type AuthFixtures = {
  studentPage: Page;
  adminPage: Page;
  loginAs: (user: TestUser) => Promise<void>;
};

export const test = base.extend<AuthFixtures>({
  studentPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, USERS.student);
    await use(page);
    await context.close();
  },
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, USERS.admin);
    await use(page);
    await context.close();
  },
  loginAs: async ({ page }, use) => {
    await use((user: TestUser) => loginAs(page, user));
  },
});

export { expect };
export { USERS };
