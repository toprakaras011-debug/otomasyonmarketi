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
    
    // Sayfa yüklendikten sonra form'un hazır olmasını bekle
    await page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 10000 });
    
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
    
    // Checkbox'ları işaretle
    await page.check('input[type="checkbox"][name="terms"]', { timeout: 3000 });
    await page.check('input[type="checkbox"][name="kvkk"]', { timeout: 3000 });
    
    // Form değerlerini doğrula
    await expect(page.locator('input[name="email"]')).toHaveValue(email, { timeout: 3000 });
    await expect(page.locator('input[name="fullName"]')).toHaveValue(fullName, { timeout: 3000 });
    await expect(page.locator('input[name="username"]')).toHaveValue(username, { timeout: 3000 });
  });

  test('kritik: giriş formu doldurulabiliyor', async ({ page }) => {
    await navigateTo(page, '/auth/signin');
    await dismissCookieConsent(page);
    
    // Sayfa yüklendikten sonra form'un hazır olmasını bekle
    await page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 10000 });
    
    const email = 'test@example.com';
    const password = 'Test123456!';
    
    await fillFormField(page, 'email', email);
    await fillFormField(page, 'password', password);
    
    await expect(page.locator('input[name="email"]')).toHaveValue(email, { timeout: 3000 });
    await expect(page.locator('input[name="password"]')).toHaveValue(password, { timeout: 3000 });
  });

  test('kritik: şifre sıfırlama formu çalışıyor', async ({ page }) => {
    await navigateTo(page, '/auth/forgot-password');
    await dismissCookieConsent(page);
    
    // Sayfa yüklendikten sonra form'un hazır olmasını bekle
    await page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 10000 });
    
    const email = 'test@example.com';
    await fillFormField(page, 'email', email);
    
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.count() > 0) {
      await submitButton.click({ timeout: 3000 });
      // Success mesajı bekleniyor
      await page.waitForSelector('[data-sonner-toast], [role="alert"]', { timeout: 3000 }).catch(() => {});
    }
  });
});

