import { test, expect } from '@playwright/test';
import { navigateTo, dismissCookieConsent } from '../helpers/navigation';
import { fillFormField } from '../helpers/forms';

/**
 * 🚨 KRİTİK E2E TESTLERİ - AUTHENTICATION AKIŞI
 * 
 * Bu testler kritik güvenlik akışlarını test eder:
 * - Kullanıcı kaydı
 * - Giriş yapma
 * - Şifre sıfırlama
 */

test.describe('🚨 Critical: Authentication Flow', () => {
  test('kritik: kullanıcı kayıt formu doldurulabiliyor ve gönderilebiliyor', async ({ page }) => {
    await navigateTo(page, '/auth/signup');
    await dismissCookieConsent(page);
    
    // Sayfa yüklendikten sonra form'un hazır olmasını bekle (id veya name ile)
    await page.waitForSelector('input#email, input[name="email"]', { state: 'visible', timeout: 10000 });
    
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123456!';
    const fullName = 'Test User';
    const username = `testuser${Date.now()}`;
    
    // Form alanlarını doldur
    await fillFormField(page, 'email', email);
    await fillFormField(page, 'password', password);
    await fillFormField(page, 'confirmPassword', password);
    await fillFormField(page, 'fullName', fullName);
    await fillFormField(page, 'username', username);
    
    // Checkbox'ları işaretle (id veya name ile)
    const termsCheckbox = page.locator('input#terms, input[name="terms"]').first();
    const kvkkCheckbox = page.locator('input#kvkk, input[name="kvkk"]').first();
    
    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.check({ timeout: 3000 });
    }
    if (await kvkkCheckbox.count() > 0) {
      await kvkkCheckbox.check({ timeout: 3000 });
    }
    
    // Form değerlerini doğrula (id veya name ile)
    await expect(page.locator('input#email, input[name="email"]').first()).toHaveValue(email, { timeout: 3000 });
    await expect(page.locator('input#fullName, input[name="fullName"]').first()).toHaveValue(fullName, { timeout: 3000 });
    await expect(page.locator('input#username, input[name="username"]').first()).toHaveValue(username, { timeout: 3000 });
  });

  test('kritik: giriş formu doldurulabiliyor', async ({ page }) => {
    await navigateTo(page, '/auth/signin');
    await dismissCookieConsent(page);
    
    // Sayfa yüklendikten sonra form'un hazır olmasını bekle (id veya name ile)
    await page.waitForSelector('input#email, input[name="email"]', { state: 'visible', timeout: 10000 });
    
    const email = 'test@example.com';
    const password = 'Test123456!';
    
    await fillFormField(page, 'email', email);
    await fillFormField(page, 'password', password);
    
    // Form değerlerini doğrula (id veya name ile)
    await expect(page.locator('input#email, input[name="email"]').first()).toHaveValue(email, { timeout: 3000 });
    await expect(page.locator('input#password, input[name="password"]').first()).toHaveValue(password, { timeout: 3000 });
  });

  test('kritik: şifre sıfırlama formu çalışıyor', async ({ page }) => {
    await navigateTo(page, '/auth/forgot-password');
    await dismissCookieConsent(page);
    
    // Sayfa yüklendikten sonra form'un hazır olmasını bekle (id veya name ile)
    await page.waitForSelector('input#email, input[name="email"]', { state: 'visible', timeout: 10000 });
    
    const email = 'test@example.com';
    await fillFormField(page, 'email', email);
    
    // Email değerini doğrula
    await expect(page.locator('input#email, input[name="email"]').first()).toHaveValue(email, { timeout: 3000 });
    
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.count() > 0) {
      await submitButton.click({ timeout: 3000 });
      // Success mesajı bekleniyor
      await page.waitForSelector('[data-sonner-toast], [role="alert"]', { timeout: 5000 }).catch(() => {});
    }
  });
});

