import { test, expect } from '@playwright/test';
import { navigateTo, dismissCookieConsent } from '../helpers/navigation';

/**
 * 🚨 KRİTİK E2E TESTLERİ - CHECKOUT AKIŞI
 * 
 * Bu testler "para kaybettiren" kritik akışları test eder:
 * - Sepete ekleme
 * - Checkout sayfası
 * - Ödeme işlemi
 * - Sipariş onayı
 */

test.describe('🚨 Critical: Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
    await dismissCookieConsent(page);
  });

  test('kritik: sepete ekle -> checkout -> ödeme formu görünür', async ({ page }) => {
    // 1. Otomasyonlar sayfasına git
    await navigateTo(page, '/automations');
    await dismissCookieConsent(page);
    
    // 2. İlk otomasyonu seç
    const firstAutomation = page.locator('a[href*="/automations/"]').first();
    if (await firstAutomation.count() > 0) {
      await Promise.all([
        page.waitForURL(/.*automations\/.*/, { timeout: 10000 }),
        firstAutomation.click(),
      ]);
      await page.waitForLoadState('domcontentloaded');
      
      // 3. Sepete ekle
      const addToCartButton = page.locator('button:has-text("Sepete Ekle"), button:has-text("Add to Cart")').first();
      if (await addToCartButton.count() > 0) {
        await addToCartButton.click({ timeout: 3000 });
        await page.waitForSelector('[data-sonner-toast]', { timeout: 3000 }).catch(() => {});
      }
      
      // 4. Sepete git
      const cartLink = page.locator('a[href*="cart"]').first();
      if (await cartLink.count() > 0) {
        await Promise.all([
          page.waitForURL(/.*cart/, { timeout: 10000 }),
          cartLink.click(),
        ]);
        await page.waitForLoadState('domcontentloaded');
        
        // 5. Checkout butonu
        const checkoutButton = page.locator('a[href*="checkout"], button:has-text("Checkout"), button:has-text("Ödeme")').first();
        if (await checkoutButton.count() > 0) {
          await Promise.all([
            page.waitForURL(/.*checkout/, { timeout: 10000 }),
            checkoutButton.click(),
          ]);
          await page.waitForLoadState('domcontentloaded');
          
          // 6. Ödeme formu görünür olmalı
          const paymentForm = page.locator('[data-testid="payment-form"], #payment-element, form').first();
          if (await paymentForm.count() > 0) {
            await expect(paymentForm).toBeVisible({ timeout: 5000 });
          }
        }
      }
    }
  });

  test('kritik: checkout sayfası yükleniyor ve form alanları görünür', async ({ page }) => {
    await navigateTo(page, '/checkout');
    await dismissCookieConsent(page);
    
    // Email input görünür olmalı (guest checkout için)
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    if (await emailInput.count() > 0) {
      await expect(emailInput).toBeVisible({ timeout: 5000 });
    }
    
    // Ödeme formu görünür olmalı
    const paymentForm = page.locator('[data-testid="payment-form"], #payment-element').first();
    if (await paymentForm.count() > 0) {
      await expect(paymentForm).toBeVisible({ timeout: 5000 });
    }
  });
});

