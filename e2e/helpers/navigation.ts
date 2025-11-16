import { Page, expect } from '@playwright/test';

/**
 * Optimized navigation - uses domcontentloaded instead of networkidle for faster tests
 */
export async function navigateTo(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  // Wait for main content instead of all network requests
  await page.waitForSelector('main, [role="main"], body', { timeout: 5000 }).catch(() => {});
}

/**
 * Fast link click with optimized waiting
 */
export async function clickLink(page: Page, text: string | RegExp) {
  await page.click(`a:has-text("${text}")`);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Dismiss cookie consent if visible (optimizes test speed)
 * Multiple strategies to ensure cookie consent is dismissed
 */
export async function dismissCookieConsent(page: Page) {
  try {
    // Strategy 1: Try to find and click the accept button
    const cookieButton = page.locator('button:has-text("Kabul Ediyorum"), button:has-text("Accept"), button:has-text("Kabul")').first();
    
    // Wait a bit for cookie consent to appear
    const isVisible = await cookieButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isVisible) {
      // Scroll into view if needed
      await cookieButton.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});
      
      // Try clicking with force if normal click doesn't work
      await cookieButton.click({ timeout: 3000, force: true }).catch(async () => {
        // Fallback: Try JavaScript click
        await cookieButton.evaluate((el: HTMLElement) => el.click()).catch(() => {});
      });
      
      // Wait for cookie consent to disappear
      await cookieButton.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
      
      // Brief wait for any animations
      await page.waitForTimeout(300);
    }
    
    // Strategy 2: Set cookie directly in localStorage (fallback)
    await page.evaluate(() => {
      try {
        localStorage.setItem('cookie-consent', 'accepted');
      } catch (e) {
        // Ignore localStorage errors
      }
    });
  } catch (error) {
    // If all strategies fail, try to set localStorage directly
    await page.evaluate(() => {
      try {
        localStorage.setItem('cookie-consent', 'accepted');
      } catch (e) {
        // Ignore
      }
    });
  }
}

/**
 * Fast click with optimized waiting - for Next.js client-side navigation
 */
export async function clickAndWaitForNavigation(page: Page, selector: string, urlPattern: RegExp, timeout = 10000) {
  await Promise.all([
    page.waitForURL(urlPattern, { timeout }),
    page.click(selector),
  ]);
  // Wait for content to be ready
  await page.waitForLoadState('domcontentloaded');
}

export async function verifyPageTitle(page: Page, expectedTitle: string | RegExp) {
  if (typeof expectedTitle === 'string') {
    await expect(page).toHaveTitle(new RegExp(expectedTitle, 'i'));
  } else {
    await expect(page).toHaveTitle(expectedTitle);
  }
}

export async function verifyPageHeading(page: Page, expectedHeading: string | RegExp) {
  const heading = page.locator('h1').first();
  if (typeof expectedHeading === 'string') {
    await expect(heading).toContainText(expectedHeading);
  } else {
    await expect(heading).toHaveText(expectedHeading);
  }
}

export async function verifyUrl(page: Page, expectedUrl: string | RegExp) {
  if (typeof expectedUrl === 'string') {
    await expect(page).toHaveURL(expectedUrl);
  } else {
    await expect(page).toHaveURL(expectedUrl);
  }
}

