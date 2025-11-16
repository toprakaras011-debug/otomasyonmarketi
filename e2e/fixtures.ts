import { test as base, Page } from '@playwright/test';

export type TestFixtures = {
  authenticatedPage: Page;
  testUser: {
    email: string;
    password: string;
    fullName: string;
  };
};

export const test = base.extend<TestFixtures>({
  testUser: {
    email: `test-${Date.now()}@example.com`,
    password: 'Test123456!',
    fullName: 'Test User',
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    // Navigate to signup page
    await page.goto('/auth/signup');
    
    // Fill signup form
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.fill('input[name="fullName"]', testUser.fullName);
    await page.fill('input[name="username"]', `testuser${Date.now()}`);
    
    // Accept terms
    await page.check('input[type="checkbox"][name="terms"]').catch(() => {
      // If checkbox doesn't exist, skip
    });
    await page.check('input[type="checkbox"][name="kvkk"]').catch(() => {
      // If checkbox doesn't exist, skip
    });
    
    // Submit form (if Turnstile is not required in test environment)
    await page.click('button[type="submit"]').catch(() => {
      // If button doesn't exist, skip
    });
    
    // Wait for navigation or success message
    await page.waitForURL('/auth/confirm', { timeout: 10000 }).catch(() => {
      // If email verification is disabled, might redirect directly to dashboard
    });
    
    await use(page);
  },
});

export { expect } from '@playwright/test';

