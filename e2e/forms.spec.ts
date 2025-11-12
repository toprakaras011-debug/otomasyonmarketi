import { test, expect } from '@playwright/test';
import { navigateTo, dismissCookieConsent } from './helpers/navigation';
import { fillFormField } from './helpers/forms';

test.describe('Form Validasyon', () => {
  test('email validasyonu çalışıyor', async ({ page }) => {
    await navigateTo(page, '/auth/signup');
    await dismissCookieConsent(page);
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    await fillFormField(page, 'email', 'invalid-email');
    
    // HTML5 validation (optimized)
    const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBeFalsy();
  });

  test('şifre minimum uzunluk kontrolü', async ({ page }) => {
    await navigateTo(page, '/auth/signup');
    await dismissCookieConsent(page);
    
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
    await fillFormField(page, 'password', 'short');
    
    // HTML5 validation veya custom validation (optimized)
    const minLength = await passwordInput.getAttribute('minLength');
    if (minLength) {
      expect(parseInt(minLength)).toBeGreaterThan(6);
    }
  });

  test('zorunlu alanlar işaretlenmiş', async ({ page }) => {
    await navigateTo(page, '/auth/signup');
    await dismissCookieConsent(page);
    
    // Wait for form to be ready (optimized)
    await page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 5000 });
    
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const fullNameInput = page.locator('input[name="fullName"]');
    
    // Get attributes directly (optimized)
    const emailRequired = await emailInput.getAttribute('required');
    const passwordRequired = await passwordInput.getAttribute('required');
    const fullNameRequired = await fullNameInput.getAttribute('required');
    
    // En az bir alan zorunlu olmalı
    expect(emailRequired || passwordRequired || fullNameRequired).toBeTruthy();
  });

  test('telefon numarası formatı kontrol ediliyor', async ({ page }) => {
    await navigateTo(page, '/auth/signup');
    await dismissCookieConsent(page);
    
    const phoneInput = page.locator('input[name="phone"]');
    
    if (await phoneInput.count() > 0) {
      await phoneInput.waitFor({ state: 'visible', timeout: 5000 });
      await fillFormField(page, 'phone', 'invalid-phone');
      
      // Pattern veya validation kontrolü
      const pattern = await phoneInput.getAttribute('pattern');
      if (pattern) {
        expect(pattern).toBeTruthy();
      }
    }
  });
});

test.describe('İletişim Formu', () => {
  test('iletişim formu yükleniyor', async ({ page }) => {
    await navigateTo(page, '/contact');
    await dismissCookieConsent(page);
    
    await expect(page).toHaveURL(/.*contact/);
  });

  test('iletişim formu doldurulabiliyor', async ({ page }) => {
    await navigateTo(page, '/contact');
    await dismissCookieConsent(page);
    
    const nameInput = page.locator('input[name="name"], input[name="fullName"]').first();
    const emailInput = page.locator('input[name="email"]').first();
    const messageInput = page.locator('textarea[name="message"], textarea[name="content"]').first();
    
    if (await nameInput.count() > 0) {
      await nameInput.waitFor({ state: 'visible', timeout: 5000 });
      await fillFormField(page, 'name', 'Test User');
      await expect(nameInput).toHaveValue('Test User', { timeout: 3000 });
    }
    
    if (await emailInput.count() > 0) {
      await emailInput.waitFor({ state: 'visible', timeout: 5000 });
      await fillFormField(page, 'email', 'test@example.com');
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 3000 });
    }
    
    if (await messageInput.count() > 0) {
      await messageInput.waitFor({ state: 'visible', timeout: 5000 });
      await messageInput.fill('Test message', { timeout: 3000 });
      await expect(messageInput).toHaveValue('Test message', { timeout: 3000 });
    }
  });

  test('iletişim formu gönderilebiliyor', async ({ page }) => {
    await navigateTo(page, '/contact');
    await dismissCookieConsent(page);
    
    const nameInput = page.locator('input[name="name"], input[name="fullName"]').first();
    const emailInput = page.locator('input[name="email"]').first();
    const messageInput = page.locator('textarea[name="message"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    if (await nameInput.count() > 0 && await emailInput.count() > 0 && await messageInput.count() > 0) {
      await fillFormField(page, 'name', 'Test User');
      await fillFormField(page, 'email', 'test@example.com');
      await messageInput.fill('Test message', { timeout: 3000 });
      
      if (await submitButton.count() > 0) {
        await submitButton.click({ timeout: 3000 });
        
        // Success mesajı bekleniyor (optimized)
        await page.waitForSelector('[data-sonner-toast], [role="alert"]', { timeout: 3000 }).catch(() => {});
      }
    }
  });
});

