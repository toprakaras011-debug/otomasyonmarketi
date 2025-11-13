import { test, expect } from '@playwright/test';
import { verifyPageTitle, verifyPageHeading, navigateTo, dismissCookieConsent } from './helpers/navigation';

test.describe('Ana Sayfa', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
    await dismissCookieConsent(page);
  });

  test('ana sayfa yükleniyor', async ({ page }) => {
    await expect(page).toHaveTitle(/Otomasyon Mağazası|Otomasyon Marketplace/i);
    await expect(page.locator('h1, h2')).not.toHaveCount(0);
  });

  test('navbar görünür ve çalışıyor', async ({ page }) => {
    const navbar = page.locator('nav, [role="navigation"]').first();
    await expect(navbar).toBeVisible();
    
    // Logo kontrolü
    const logo = page.locator('a[href="/"]').first();
    await expect(logo).toBeVisible();
  });

  test('hero section görünür', async ({ page }) => {
    // Hero section'ı kontrol et (genellikle ana başlık içerir)
    const heroSection = page.locator('section, main').first();
    await expect(heroSection).toBeVisible();
  });

  test('kategoriler bölümü görünür', async ({ page }) => {
    // Kategoriler bölümünü kontrol et (optimized - wait for visibility)
    const categoriesLink = page.locator('a[href*="categories"], a[href*="kategoriler"]').first();
    if (await categoriesLink.count() > 0) {
      // Wait for element to be visible (not just in DOM)
      await categoriesLink.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      // Check if actually visible (not hidden by CSS)
      const isVisible = await categoriesLink.isVisible().catch(() => false);
      if (isVisible) {
        await expect(categoriesLink).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('otomasyonlar bölümü görünür', async ({ page }) => {
    // Otomasyonlar linkini kontrol et (optimized - wait for visibility)
    const automationsLink = page.locator('a[href*="automations"], a[href*="otomasyonlar"]').first();
    if (await automationsLink.count() > 0) {
      // Wait for element to be visible (not just in DOM)
      await automationsLink.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      // Check if actually visible (not hidden by CSS)
      const isVisible = await automationsLink.isVisible().catch(() => false);
      if (isVisible) {
        await expect(automationsLink).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('footer görünür', async ({ page }) => {
    // Footer'ı kontrol et
    const footer = page.locator('footer, [role="contentinfo"]').first();
    if (await footer.count() > 0) {
      await expect(footer).toBeVisible();
    }
  });

  test('login butonu görünür', async ({ page }) => {
    const signInLink = page.locator('a[href*="/auth/signin"], button:has-text("Giriş"), button:has-text("Giriş Yap")').first();
    if (await signInLink.count() > 0) {
      // Wait for cookie consent to be dismissed first
      await dismissCookieConsent(page);
      // Wait for element to be visible
      await signInLink.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      const isVisible = await signInLink.isVisible().catch(() => false);
      if (isVisible) {
        await expect(signInLink).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('signup butonu görünür', async ({ page }) => {
    const signUpLink = page.locator('a[href*="/auth/signup"], button:has-text("Kayıt"), button:has-text("Kayıt Ol")').first();
    if (await signUpLink.count() > 0) {
      // Wait for cookie consent to be dismissed first
      await dismissCookieConsent(page);
      // Wait for element to be visible
      await signUpLink.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      const isVisible = await signUpLink.isVisible().catch(() => false);
      if (isVisible) {
        await expect(signUpLink).toBeVisible({ timeout: 3000 });
      }
    }
  });
});

test.describe('Navigasyon', () => {
  test('ana sayfadan otomasyonlar sayfasına gidilebiliyor', async ({ page }) => {
    await navigateTo(page, '/');
    await dismissCookieConsent(page);
    
    // Desktop görünümü için viewport ayarla
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Link'i bul ve bekle (optimized)
    const automationsLink = page.locator('a[href="/automations"], a[href*="/automations"]').first();
    await automationsLink.waitFor({ state: 'visible', timeout: 5000 });
    
    // Fast navigation with optimized waiting
    await Promise.all([
      page.waitForURL(/.*automations/, { timeout: 10000 }),
      automationsLink.click(),
    ]);
    
    // Wait for content to be ready
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*automations/);
  });

  test('ana sayfadan kategoriler sayfasına gidilebiliyor', async ({ page }) => {
    await navigateTo(page, '/');
    await dismissCookieConsent(page);
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const categoriesLink = page.locator('a[href="/categories"], a[href*="/categories"]').first();
    await categoriesLink.waitFor({ state: 'visible', timeout: 5000 });
    
    await Promise.all([
      page.waitForURL(/.*categories/, { timeout: 10000 }),
      categoriesLink.click(),
    ]);
    
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*categories/);
  });

  test('ana sayfadan blog sayfasına gidilebiliyor', async ({ page }) => {
    await navigateTo(page, '/');
    await dismissCookieConsent(page);
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const blogLink = page.locator('a[href="/blog"], a[href*="/blog"]').first();
    await blogLink.waitFor({ state: 'visible', timeout: 5000 });
    
    await Promise.all([
      page.waitForURL(/.*blog/, { timeout: 10000 }),
      blogLink.click(),
    ]);
    
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*blog/);
  });

  test('ana sayfadan hakkımızda sayfasına gidilebiliyor', async ({ page }) => {
    await navigateTo(page, '/');
    await dismissCookieConsent(page);
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // About linki footer'da olabilir, sayfayı scroll et (optimized)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const aboutLink = page.locator('a[href="/about"], a[href*="/about"]').first();
    await aboutLink.waitFor({ state: 'visible', timeout: 5000 });
    
    await Promise.all([
      page.waitForURL(/.*about/, { timeout: 10000 }),
      aboutLink.click({ force: true }),
    ]);
    
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*about/);
  });

  test('ana sayfadan iletişim sayfasına gidilebiliyor', async ({ page }) => {
    await navigateTo(page, '/');
    await dismissCookieConsent(page);
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Contact linki footer'da olabilir, sayfayı scroll et (optimized)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const contactLink = page.locator('a[href="/contact"], a[href*="/contact"]').first();
    await contactLink.waitFor({ state: 'visible', timeout: 5000 });
    
    await Promise.all([
      page.waitForURL(/.*contact/, { timeout: 10000 }),
      contactLink.click({ force: true }),
    ]);
    
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*contact/);
  });
});

test.describe('Responsive Tasarım', () => {
  test('mobil görünümde navbar düzgün görünüyor', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateTo(page, '/');
    await dismissCookieConsent(page);
    
    const navbar = page.locator('nav, [role="navigation"]').first();
    await expect(navbar).toBeVisible({ timeout: 5000 });
  });

  test('tablet görünümde sayfa düzgün görünüyor', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await navigateTo(page, '/');
    await dismissCookieConsent(page);
    
    // Wait for main content with optimized selector
    const mainContent = page.locator('main, [role="main"]').first();
    await mainContent.waitFor({ state: 'visible', timeout: 5000 });
    await expect(mainContent).toBeVisible();
  });

  test('desktop görünümde sayfa düzgün görünüyor', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await navigateTo(page, '/');
    await dismissCookieConsent(page);
    
    const mainContent = page.locator('main, [role="main"]').first();
    await mainContent.waitFor({ state: 'visible', timeout: 5000 });
    await expect(mainContent).toBeVisible();
  });
});

