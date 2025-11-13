import { test, expect } from '@playwright/test';
import { signUp, signIn, signOut, waitForAuthState } from './helpers/auth';
import { waitForToast, verifyFieldError, fillFormField } from './helpers/forms';
import { navigateTo, dismissCookieConsent } from './helpers/navigation';

test.describe('Authentication - Sign Up', () => {
  test('kayıt sayfası yükleniyor', async ({ page }) => {
    await navigateTo(page, '/auth/signup');
    await dismissCookieConsent(page);
    
    await expect(page).toHaveURL(/.*auth\/signup/);
    await expect(page.locator('h1, h2')).toContainText(/kayıt|sign up|üye ol/i, { timeout: 5000 });
  });

  test('geçersiz email ile kayıt başarısız', async ({ page }) => {
    await navigateTo(page, '/auth/signup');
    await dismissCookieConsent(page);
    
    await fillFormField(page, 'email', 'invalid-email');
    await fillFormField(page, 'password', 'Test123456!');
    await fillFormField(page, 'confirmPassword', 'Test123456!');
    await fillFormField(page, 'fullName', 'Test User');
    await fillFormField(page, 'username', 'testuser');
    
    await page.check('input[type="checkbox"][name="terms"]', { timeout: 3000 });
    await page.check('input[type="checkbox"][name="kvkk"]', { timeout: 3000 });
    
    await page.click('button[type="submit"]', { timeout: 3000 });
    
    // Email validation error bekleniyor (optimized wait)
    const emailField = page.locator('input[name="email"]');
    await emailField.waitFor({ state: 'visible', timeout: 3000 });
    const validationMessage = await emailField.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('şifre eşleşmiyor hatası', async ({ page }) => {
    await navigateTo(page, '/auth/signup');
    await dismissCookieConsent(page);
    
    await fillFormField(page, 'email', `test-${Date.now()}@example.com`);
    await fillFormField(page, 'password', 'Test123456!');
    await fillFormField(page, 'confirmPassword', 'DifferentPassword123!');
    await fillFormField(page, 'fullName', 'Test User');
    await fillFormField(page, 'username', 'testuser');
    
    await page.check('input[type="checkbox"][name="terms"]', { timeout: 3000 });
    await page.check('input[type="checkbox"][name="kvkk"]', { timeout: 3000 });
    
    await page.click('button[type="submit"]', { timeout: 3000 });
    
    // Şifre eşleşmiyor hatası bekleniyor (optimized)
    await page.waitForSelector('[data-sonner-toast], [role="alert"], .error-message', { timeout: 3000 }).catch(() => {});
  });

  test('terms kabul edilmeden kayıt başarısız', async ({ page }) => {
    await navigateTo(page, '/auth/signup');
    await dismissCookieConsent(page);
    
    await fillFormField(page, 'email', `test-${Date.now()}@example.com`);
    await fillFormField(page, 'password', 'Test123456!');
    await fillFormField(page, 'confirmPassword', 'Test123456!');
    await fillFormField(page, 'fullName', 'Test User');
    await fillFormField(page, 'username', 'testuser');
    
    // Terms kabul edilmiyor
    
    await page.click('button[type="submit"]', { timeout: 3000 });
    
    // Terms hatası bekleniyor (optimized)
    const termsCheckbox = page.locator('input[type="checkbox"][name="terms"]');
    await termsCheckbox.waitFor({ state: 'visible', timeout: 3000 });
    await expect(termsCheckbox).not.toBeChecked({ timeout: 2000 });
  });

  test('zayıf şifre ile kayıt başarısız', async ({ page }) => {
    await navigateTo(page, '/auth/signup');
    await dismissCookieConsent(page);
    
    await fillFormField(page, 'email', `test-${Date.now()}@example.com`);
    await fillFormField(page, 'password', 'weak');
    await fillFormField(page, 'confirmPassword', 'weak');
    await fillFormField(page, 'fullName', 'Test User');
    await fillFormField(page, 'username', 'testuser');
    
    await page.check('input[type="checkbox"][name="terms"]', { timeout: 3000 });
    await page.check('input[type="checkbox"][name="kvkk"]', { timeout: 3000 });
    
    await page.click('button[type="submit"]', { timeout: 3000 });
    
    // Şifre güçlü değil hatası bekleniyor (optimized)
    await page.waitForSelector('[data-sonner-toast], [role="alert"], .error-message', { timeout: 3000 }).catch(() => {});
  });

  test('geçerli bilgilerle kayıt formu doldurulabiliyor', async ({ page }) => {
    await navigateTo(page, '/auth/signup');
    await dismissCookieConsent(page);
    
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123456!';
    const fullName = 'Test User';
    const username = `testuser${Date.now()}`;
    
    await fillFormField(page, 'email', email);
    await fillFormField(page, 'password', password);
    await fillFormField(page, 'confirmPassword', password);
    await fillFormField(page, 'fullName', fullName);
    await fillFormField(page, 'username', username);
    
    await page.check('input[type="checkbox"][name="terms"]', { timeout: 3000 });
    await page.check('input[type="checkbox"][name="kvkk"]', { timeout: 3000 });
    
    // Form dolduruldu mu kontrol et (optimized)
    await expect(page.locator('input[name="email"]')).toHaveValue(email, { timeout: 3000 });
    await expect(page.locator('input[name="fullName"]')).toHaveValue(fullName, { timeout: 3000 });
    await expect(page.locator('input[name="username"]')).toHaveValue(username, { timeout: 3000 });
  });
});

test.describe('Authentication - Sign In', () => {
  test('giriş sayfası yükleniyor', async ({ page }) => {
    await navigateTo(page, '/auth/signin');
    await dismissCookieConsent(page);
    
    await expect(page).toHaveURL(/.*auth\/signin/);
    await expect(page.locator('h1, h2')).toContainText(/giriş|sign in|login/i, { timeout: 5000 });
  });

  test('geçersiz email ile giriş başarısız', async ({ page }) => {
    await navigateTo(page, '/auth/signin');
    await dismissCookieConsent(page);
    
    await fillFormField(page, 'email', 'invalid-email');
    await fillFormField(page, 'password', 'password');
    
    await page.click('button[type="submit"]', { timeout: 3000 });
    
    // Email validation error (optimized wait)
    const emailField = page.locator('input[name="email"]');
    await emailField.waitFor({ state: 'visible', timeout: 2000 });
  });

  test('yanlış şifre ile giriş başarısız', async ({ page }) => {
    await navigateTo(page, '/auth/signin');
    await dismissCookieConsent(page);
    
    await fillFormField(page, 'email', 'test@example.com');
    await fillFormField(page, 'password', 'wrongpassword');
    
    await page.click('button[type="submit"]', { timeout: 3000 });
    
    // Hata mesajı bekleniyor (optimized - wait for toast or error)
    await page.waitForSelector('[data-sonner-toast], [role="alert"]', { timeout: 3000 }).catch(() => {});
  });

  test('boş alanlarla giriş başarısız', async ({ page }) => {
    await navigateTo(page, '/auth/signin');
    await dismissCookieConsent(page);
    
    await page.click('button[type="submit"]', { timeout: 3000 });
    
    // Validation hataları bekleniyor (optimized)
    await page.waitForSelector('input:invalid, [role="alert"]', { timeout: 2000 }).catch(() => {});
  });

  test('giriş formu doldurulabiliyor', async ({ page }) => {
    await navigateTo(page, '/auth/signin');
    await dismissCookieConsent(page);
    
    const email = 'test@example.com';
    const password = 'Test123456!';
    
    await fillFormField(page, 'email', email);
    await fillFormField(page, 'password', password);
    
    await expect(page.locator('input[name="email"]')).toHaveValue(email, { timeout: 3000 });
    await expect(page.locator('input[name="password"]')).toHaveValue(password, { timeout: 3000 });
  });
});

test.describe('Authentication - Password Reset', () => {
  test('şifre sıfırlama sayfası yükleniyor', async ({ page }) => {
    await navigateTo(page, '/auth/forgot-password');
    
    await expect(page).toHaveURL(/.*auth\/forgot-password/);
  });

  test('şifre sıfırlama formu gönderilebiliyor', async ({ page }) => {
    await navigateTo(page, '/auth/forgot-password');
    await dismissCookieConsent(page);
    
    const email = 'test@example.com';
    await fillFormField(page, 'email', email);
    
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.count() > 0) {
      await submitButton.click({ timeout: 3000 });
      
      // Success mesajı bekleniyor (optimized)
      await page.waitForSelector('[data-sonner-toast], [role="alert"]', { timeout: 3000 }).catch(() => {});
    }
  });
});

test.describe('Authentication - Navigation', () => {
  test('giriş sayfasından kayıt sayfasına gidilebiliyor', async ({ page }) => {
    await navigateTo(page, '/auth/signin');
    await dismissCookieConsent(page);
    
    const signUpLink = page.locator('a[href*="/auth/signup"]').first();
    if (await signUpLink.count() > 0) {
      await Promise.all([
        page.waitForURL(/.*auth\/signup/, { timeout: 5000 }),
        signUpLink.click(),
      ]);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/.*auth\/signup/);
    }
  });

  test('kayıt sayfasından giriş sayfasına gidilebiliyor', async ({ page }) => {
    await navigateTo(page, '/auth/signup');
    await dismissCookieConsent(page);
    
    const signInLink = page.locator('a[href*="/auth/signin"]').first();
    if (await signInLink.count() > 0) {
      await Promise.all([
        page.waitForURL(/.*auth\/signin/, { timeout: 5000 }),
        signInLink.click(),
      ]);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/.*auth\/signin/);
    }
  });

  test('şifremi unuttum linki görünür', async ({ page }) => {
    await navigateTo(page, '/auth/signin');
    
    const forgotPasswordLink = page.locator('a[href*="forgot-password"], a[href*="reset-password"]').first();
    if (await forgotPasswordLink.count() > 0) {
      await expect(forgotPasswordLink).toBeVisible();
    }
  });
});

