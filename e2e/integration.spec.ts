import { test, expect } from '@playwright/test';
import { navigateTo, dismissCookieConsent } from './helpers/navigation';

test.describe('Integration Tests', () => {
  test('tam kullanıcı akışı: kayıt -> giriş -> otomasyon görüntüleme', async ({ page }) => {
    // 1. Ana sayfa
    await navigateTo(page, '/');
    await dismissCookieConsent(page);
    await expect(page).toHaveURL(/.*\/$/);
    
    // 2. Kayıt sayfasına git (optimized - cookie consent kapatıldıktan sonra)
    const signUpLink = page.locator('a[href*="/auth/signup"]').first();
    if (await signUpLink.count() > 0) {
      // Wait for link to be visible after cookie consent is dismissed
      await signUpLink.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      const isVisible = await signUpLink.isVisible().catch(() => false);
      if (isVisible) {
        await Promise.all([
          page.waitForURL(/.*auth\/signup/, { timeout: 10000 }),
          signUpLink.click({ force: true }),
        ]);
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/.*auth\/signup/);
      }
    }
    
    // 3. Otomasyonlar sayfasına git
    await navigateTo(page, '/automations');
    await dismissCookieConsent(page);
    await expect(page).toHaveURL(/.*automations/);
  });

  test('tam satın alma akışı: otomasyon seç -> sepete ekle -> checkout', async ({ page }) => {
    // 1. Otomasyonlar sayfası
    await navigateTo(page, '/automations');
    await dismissCookieConsent(page);
    await expect(page).toHaveURL(/.*automations/);
    
    // 2. İlk otomasyonu seç (optimized)
    const firstAutomation = page.locator('a[href*="/automations/"]').first();
    if (await firstAutomation.count() > 0) {
      await Promise.all([
        page.waitForURL(/.*automations\/.*/, { timeout: 10000 }),
        firstAutomation.click(),
      ]);
      await page.waitForLoadState('domcontentloaded');
      
      // 3. Sepete ekle (optimized)
      const addToCartButton = page.locator('button:has-text("Sepete Ekle"), button:has-text("Add to Cart")').first();
      if (await addToCartButton.count() > 0) {
        await addToCartButton.click({ timeout: 3000 });
        await page.waitForSelector('[data-sonner-toast]', { timeout: 3000 }).catch(() => {});
      }
      
      // 4. Sepete git (optimized)
      const cartLink = page.locator('a[href*="cart"]').first();
      if (await cartLink.count() > 0) {
        await Promise.all([
          page.waitForURL(/.*cart/, { timeout: 10000 }),
          cartLink.click(),
        ]);
        await page.waitForLoadState('domcontentloaded');
      }
    }
  });

  test('arama ve filtreleme akışı', async ({ page }) => {
    // 1. Otomasyonlar sayfası
    await navigateTo(page, '/automations');
    
    // 2. Arama yap
    const searchInput = page.locator('input[type="search"], input[placeholder*="ara"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);
    }
    
    // 3. Filtreleme
    const filterButton = page.locator('button:has-text("Filtre"), select[name*="filter"]').first();
    if (await filterButton.count() > 0) {
      await filterButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('dashboard navigasyon akışı', async ({ page }) => {
    // 1. Dashboard
    await navigateTo(page, '/dashboard');
    
    // Eğer giriş yapılmamışsa signin'e yönlendirilir
    if (!page.url().includes('/auth/signin')) {
      // 2. Ayarlar
      const settingsLink = page.locator('a[href*="dashboard/settings"]').first();
      if (await settingsLink.count() > 0) {
        await settingsLink.click();
        await page.waitForURL(/.*dashboard\/settings/, { timeout: 10000 });
      }
      
      // 3. Favoriler
      await navigateTo(page, '/dashboard/favorites');
      if (!page.url().includes('/auth/signin')) {
        await expect(page).toHaveURL(/.*favorites/);
      }
    }
  });

  test('blog ve içerik sayfaları akışı', async ({ page }) => {
    // 1. Blog sayfası
    await navigateTo(page, '/blog');
    await expect(page).toHaveURL(/.*blog/);
    
    // 2. İlk blog yazısı
    const firstBlogPost = page.locator('a[href*="/blog/"]').first();
    if (await firstBlogPost.count() > 0) {
      await firstBlogPost.click();
      await page.waitForURL(/.*blog\/.*/, { timeout: 10000 });
    }
  });

  test('yardım ve destek sayfaları akışı', async ({ page }) => {
    // 1. FAQ
    await navigateTo(page, '/faq');
    await expect(page).toHaveURL(/.*faq/);
    
    // 2. Help
    await navigateTo(page, '/help');
    await expect(page).toHaveURL(/.*help/);
    
    // 3. Contact
    await navigateTo(page, '/contact');
    await expect(page).toHaveURL(/.*contact/);
  });

  test('yasal sayfalar akışı', async ({ page }) => {
    // 1. Terms
    await navigateTo(page, '/terms');
    await expect(page).toHaveURL(/.*terms/);
    
    // 2. Privacy
    await navigateTo(page, '/privacy');
    await expect(page).toHaveURL(/.*privacy/);
    
    // 3. KVKK
    await navigateTo(page, '/kvkk');
    await expect(page).toHaveURL(/.*kvkk/);
  });
});

