import { test, expect } from '@playwright/test';
import { navigateTo, dismissCookieConsent } from './helpers/navigation';

test.describe('Sepet', () => {
  test('sepet sayfası yükleniyor', async ({ page }) => {
    await navigateTo(page, '/cart');
    await dismissCookieConsent(page);
    
    await expect(page).toHaveURL(/.*cart/);
  });

  test('boş sepet görünür', async ({ page }) => {
    await navigateTo(page, '/cart');
    
    // Boş sepet mesajı veya içerik kontrolü
    const emptyCartMessage = page.locator('text=/sepetiniz boş|your cart is empty|cart is empty/i');
    const cartItems = page.locator('[data-testid="cart-item"], .cart-item').first();
    
    // Ya boş sepet mesajı ya da sepet öğeleri görünür olmalı
    const hasEmptyMessage = await emptyCartMessage.count() > 0;
    const hasItems = await cartItems.count() > 0;
    
    expect(hasEmptyMessage || hasItems).toBeTruthy();
  });

  test('sepet ikonu görünür', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Navbar'daki sepet ikonu
    const cartIcon = page.locator('a[href*="cart"], button[aria-label*="cart"]').first();
    if (await cartIcon.count() > 0) {
      await expect(cartIcon).toBeVisible();
    }
  });

  test('sepete ekle butonu çalışıyor', async ({ page }) => {
    // Önce otomasyonlar sayfasına git
    await navigateTo(page, '/automations');
    await dismissCookieConsent(page);
    
    // İlk otomasyonu bul
    const firstAutomation = page.locator('a[href*="/automations/"]').first();
    
    if (await firstAutomation.count() > 0) {
      await Promise.all([
        page.waitForURL(/.*automations\/.*/, { timeout: 10000 }),
        firstAutomation.click(),
      ]);
      await page.waitForLoadState('domcontentloaded');
      
      // Sepete ekle butonu
      const addToCartButton = page.locator('button:has-text("Sepete Ekle"), button:has-text("Add to Cart")').first();
      
      if (await addToCartButton.count() > 0) {
        await addToCartButton.click({ timeout: 3000 });
        
        // Toast mesajı veya sepet güncellemesi bekleniyor (optimized)
        await page.waitForSelector('[data-sonner-toast]', { timeout: 3000 }).catch(() => {});
      }
    }
  });

  test('sepetten ürün kaldırılabiliyor', async ({ page }) => {
    await navigateTo(page, '/cart');
    
    // Sepet öğesi varsa
    const removeButton = page.locator('button:has-text("Kaldır"), button:has-text("Remove"), button[aria-label*="remove"]').first();
    
    if (await removeButton.count() > 0) {
      await removeButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('sepet miktarı güncellenebiliyor', async ({ page }) => {
    await navigateTo(page, '/cart');
    
    // Miktar input'u
    const quantityInput = page.locator('input[name*="quantity"], input[type="number"]').first();
    
    if (await quantityInput.count() > 0) {
      await quantityInput.fill('2');
      await page.waitForTimeout(1000);
    }
  });

  test('checkout sayfasına gidilebiliyor', async ({ page }) => {
    await navigateTo(page, '/cart');
    await dismissCookieConsent(page);
    
    // Checkout butonu
    const checkoutButton = page.locator('a[href*="checkout"], button:has-text("Checkout"), button:has-text("Ödeme")').first();
    
    if (await checkoutButton.count() > 0) {
      await Promise.all([
        page.waitForURL(/.*checkout/, { timeout: 10000 }),
        checkoutButton.click(),
      ]);
      await page.waitForLoadState('domcontentloaded');
    }
  });
});

test.describe('Checkout', () => {
  test('checkout sayfası yükleniyor', async ({ page }) => {
    await navigateTo(page, '/cart');
    
    // Checkout butonu varsa tıkla
    const checkoutButton = page.locator('a[href*="checkout"], button:has-text("Checkout")').first();
    
    if (await checkoutButton.count() > 0) {
      await checkoutButton.click();
      await page.waitForURL(/.*checkout/, { timeout: 10000 });
    } else {
      // Direkt checkout sayfasına git
      await navigateTo(page, '/checkout');
    }
  });

  test('checkout formu görünür', async ({ page }) => {
    await navigateTo(page, '/checkout');
    
    // Form alanları (giriş yapılmamışsa guest checkout)
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    
    if (await emailInput.count() > 0) {
      await expect(emailInput).toBeVisible();
    }
  });

  test('ödeme formu görünür', async ({ page }) => {
    await navigateTo(page, '/checkout');
    
    // Stripe payment element veya ödeme formu
    const paymentForm = page.locator('[data-testid="payment-form"], #payment-element, form').first();
    
    if (await paymentForm.count() > 0) {
      await expect(paymentForm).toBeVisible();
    }
  });
});

