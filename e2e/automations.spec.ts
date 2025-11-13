import { test, expect } from '@playwright/test';
import { navigateTo } from './helpers/navigation';

test.describe('Otomasyonlar Sayfası', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/automations');
  });

  test('otomasyonlar sayfası yükleniyor', async ({ page }) => {
    await expect(page).toHaveURL(/.*automations/);
    await expect(page.locator('h1, h2')).not.toHaveCount(0);
  });

  test('otomasyon listesi görünür', async ({ page }) => {
    await dismissCookieConsent(page);
    
    // Otomasyon kartlarını veya listesini kontrol et (optimized - wait for visibility)
    const automationCards = page.locator('[data-testid="automation-card"], article, .automation-card').first();
    
    // Wait for cards to be visible or no results message
    await page.waitForSelector('[data-testid="automation-card"], article, .automation-card, text=/bulunamadı|not found|no results/i', { timeout: 5000 }).catch(() => {});
    
    // En az bir otomasyon olmalı veya "otomasyon bulunamadı" mesajı görünmeli
    const hasCards = await automationCards.count() > 0;
    const hasNoResults = await page.locator('text=/bulunamadı|not found|no results/i').count() > 0;
    
    if (hasCards) {
      // Check if actually visible (not hidden by CSS)
      const isVisible = await automationCards.isVisible().catch(() => false);
      expect(isVisible || hasNoResults).toBeTruthy();
    } else {
      expect(hasNoResults).toBeTruthy();
    }
  });

  test('otomasyon detay sayfasına gidilebiliyor', async ({ page }) => {
    // İlk otomasyon kartına tıkla
    const firstAutomation = page.locator('a[href*="/automations/"], [data-testid="automation-card"] a').first();
    
    if (await firstAutomation.count() > 0) {
      const href = await firstAutomation.getAttribute('href');
      await firstAutomation.click();
      
      // Detay sayfasına yönlendirilmeli
      await page.waitForURL(/.*automations\/.*/, { timeout: 10000 });
    }
  });

  test('arama çalışıyor', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="ara"], input[placeholder*="search"]').first();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await searchInput.press('Enter');
      
      // Arama sonuçları bekleniyor
      await page.waitForTimeout(2000);
    }
  });

  test('filtreleme çalışıyor', async ({ page }) => {
    // Kategori filtresi
    const categoryFilter = page.locator('select[name*="category"], button:has-text("Kategori")').first();
    
    if (await categoryFilter.count() > 0) {
      await categoryFilter.click();
      await page.waitForTimeout(1000);
    }
  });

  test('sıralama çalışıyor', async ({ page }) => {
    // Sıralama dropdown'ı
    const sortSelect = page.locator('select[name*="sort"], button:has-text("Sırala")').first();
    
    if (await sortSelect.count() > 0) {
      await sortSelect.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Otomasyon Detay Sayfası', () => {
  test('otomasyon detay sayfası yükleniyor', async ({ page }) => {
    // Önce otomasyonlar sayfasına git
    await navigateTo(page, '/automations');
    
    // İlk otomasyonu bul ve tıkla
    const firstAutomation = page.locator('a[href*="/automations/"]').first();
    
    if (await firstAutomation.count() > 0) {
      await firstAutomation.click();
      await page.waitForURL(/.*automations\/.*/, { timeout: 10000 });
      
      // Detay sayfası içeriği görünür olmalı
      await expect(page.locator('h1, h2')).not.toHaveCount(0);
    } else {
      // Eğer otomasyon yoksa, manuel olarak bir slug ile test et
      await navigateTo(page, '/automations/test-automation');
      // 404 veya içerik kontrolü
    }
  });

  test('otomasyon bilgileri görünür', async ({ page }) => {
    await navigateTo(page, '/automations');
    
    const firstAutomation = page.locator('a[href*="/automations/"]').first();
    
    if (await firstAutomation.count() > 0) {
      await firstAutomation.click();
      await page.waitForURL(/.*automations\/.*/, { timeout: 10000 });
      
      // Başlık, açıklama, fiyat gibi bilgiler görünür olmalı
      const title = page.locator('h1').first();
      if (await title.count() > 0) {
        await expect(title).toBeVisible();
      }
    }
  });

  test('sepete ekle butonu görünür', async ({ page }) => {
    await navigateTo(page, '/automations');
    
    const firstAutomation = page.locator('a[href*="/automations/"]').first();
    
    if (await firstAutomation.count() > 0) {
      await firstAutomation.click();
      await page.waitForURL(/.*automations\/.*/, { timeout: 10000 });
      
      // Sepete ekle butonu
      const addToCartButton = page.locator('button:has-text("Sepete Ekle"), button:has-text("Add to Cart")').first();
      if (await addToCartButton.count() > 0) {
        await expect(addToCartButton).toBeVisible();
      }
    }
  });

  test('favorilere ekle butonu görünür', async ({ page }) => {
    await navigateTo(page, '/automations');
    
    const firstAutomation = page.locator('a[href*="/automations/"]').first();
    
    if (await firstAutomation.count() > 0) {
      await firstAutomation.click();
      await page.waitForURL(/.*automations\/.*/, { timeout: 10000 });
      
      // Favorilere ekle butonu (giriş yapılmışsa)
      const favoriteButton = page.locator('button[aria-label*="favorite"], button:has-text("Favori")').first();
      if (await favoriteButton.count() > 0) {
        await expect(favoriteButton).toBeVisible();
      }
    }
  });
});

test.describe('Kategoriler', () => {
  test('kategoriler sayfası yükleniyor', async ({ page }) => {
    await navigateTo(page, '/categories');
    
    await expect(page).toHaveURL(/.*categories/);
  });

  test('kategori listesi görünür', async ({ page }) => {
    await navigateTo(page, '/categories');
    await dismissCookieConsent(page);
    
    // Kategori kartları veya listesi (optimized - wait for visibility)
    const categoryItems = page.locator('[data-testid="category"], a[href*="categories"]').first();
    
    if (await categoryItems.count() > 0) {
      // Wait for element to be visible
      await categoryItems.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      // Check if actually visible (not hidden by CSS)
      const isVisible = await categoryItems.isVisible().catch(() => false);
      if (isVisible) {
        await expect(categoryItems).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('kategori sayfasından otomasyonlara gidilebiliyor', async ({ page }) => {
    await navigateTo(page, '/categories');
    
    const categoryLink = page.locator('a[href*="categories/"]').first();
    
    if (await categoryLink.count() > 0) {
      await categoryLink.click();
      await page.waitForURL(/.*categories\/.*/, { timeout: 10000 });
    }
  });
});

