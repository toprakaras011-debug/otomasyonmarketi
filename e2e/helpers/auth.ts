import { Page } from '@playwright/test';

export async function signUp(
  page: Page,
  userData: {
    email: string;
    password: string;
    confirmPassword?: string;
    fullName: string;
    username: string;
    phone?: string;
  }
) {
  await page.goto('/auth/signup');
  
  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="password"]', userData.password);
  await page.fill('input[name="confirmPassword"]', userData.confirmPassword || userData.password);
  await page.fill('input[name="fullName"]', userData.fullName);
  await page.fill('input[name="username"]', userData.username);
  
  if (userData.phone) {
    await page.fill('input[name="phone"]', userData.phone);
  }
  
  // Accept terms
  await page.check('input[type="checkbox"][name="terms"]');
  await page.check('input[type="checkbox"][name="kvkk"]');
  
  // Wait for Turnstile if present (might not be loaded in test environment)
  const turnstileFrame = page.frameLocator('iframe[title*="Turnstile"]');
  if (await turnstileFrame.count() > 0) {
    // Wait a bit for Turnstile to complete
    await page.waitForTimeout(2000);
  }
  
  await page.click('button[type="submit"]');
}

export async function signIn(
  page: Page,
  email: string,
  password: string
) {
  await page.goto('/auth/signin');
  
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForURL(/\/(dashboard|auth\/confirm)/, { timeout: 10000 });
}

export async function signOut(page: Page) {
  // Navigate to dashboard or profile
  await page.goto('/dashboard');
  
  // Click on user menu (adjust selector based on your UI)
  const userMenuButton = page.locator('button[aria-label*="user"], button[aria-label*="menu"], [data-testid="user-menu"]').first();
  if (await userMenuButton.count() > 0) {
    await userMenuButton.click();
    
    // Click sign out
    const signOutButton = page.locator('text=/çıkış|sign out|logout/i');
    if (await signOutButton.count() > 0) {
      await signOutButton.click();
    }
  }
}

export async function waitForAuthState(page: Page, authenticated: boolean) {
  if (authenticated) {
    // Wait for authenticated state (e.g., user menu visible)
    await page.waitForSelector('button[aria-label*="user"], [data-testid="user-menu"]', { timeout: 10000 }).catch(() => {
      // If not found, check URL
      const url = page.url();
      if (!url.includes('/dashboard') && !url.includes('/auth/confirm')) {
        throw new Error('User is not authenticated');
      }
    });
  } else {
    // Wait for unauthenticated state
    await page.waitForSelector('a[href*="/auth/signin"]', { timeout: 10000 });
  }
}

