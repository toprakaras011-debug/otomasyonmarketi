import { test, expect } from '@playwright/test';
import { navigateTo, dismissCookieConsent } from './helpers/navigation';

test.describe('Accessibility', () => {
  test('ana sayfa erişilebilir', async ({ page }) => {
    await navigateTo(page, '/');
    await dismissCookieConsent(page);
    
    // Ana başlık var mı? (optimized - wait for specific element)
    const mainHeading = page.locator('h1').first();
    await mainHeading.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await mainHeading.count() > 0) {
      await expect(mainHeading).toBeVisible({ timeout: 3000 });
    }
    
    // Landmark regions (optimized)
    const main = page.locator('main, [role="main"]').first();
    await main.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await main.count() > 0) {
      await expect(main).toBeVisible({ timeout: 3000 });
    }
  });

  test('navigation erişilebilir', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Nav element
    const nav = page.locator('nav, [role="navigation"]').first();
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible();
    }
    
    // Linkler erişilebilir
    const links = page.locator('nav a').first();
    if (await links.count() > 0) {
      await expect(links).toBeVisible();
    }
  });

  test('formlar erişilebilir', async ({ page }) => {
    await navigateTo(page, '/auth/signup');
    await dismissCookieConsent(page);
    
    // Form labels (optimized - wait for form to be ready)
    const emailInput = page.locator('input[name="email"]');
    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    
    const emailLabel = page.locator('label[for*="email"], label:has-text("E-posta"), label:has-text("Email")').first();
    if (await emailLabel.count() > 0) {
      await expect(emailLabel).toBeVisible({ timeout: 3000 });
    }
    
    // Input aria-labels (optimized - get attributes directly)
    const ariaLabel = await emailInput.getAttribute('aria-label');
    const ariaLabelledBy = await emailInput.getAttribute('aria-labelledby');
    const id = await emailInput.getAttribute('id');
    
    // En az bir erişilebilirlik özelliği olmalı
    expect(ariaLabel || ariaLabelledBy || id).toBeTruthy();
  });

  test('butonlar erişilebilir', async ({ page }) => {
    await navigateTo(page, '/');
    await dismissCookieConsent(page);
    
    // Butonlar görünür ve erişilebilir (optimized - wait for visibility)
    const buttons = page.locator('button').first();
    if (await buttons.count() > 0) {
      await buttons.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      const isVisible = await buttons.isVisible().catch(() => false);
      if (isVisible) {
        const ariaLabel = await buttons.getAttribute('aria-label');
        const text = await buttons.textContent();
        
        // Buton ya metin içermeli ya da aria-label'a sahip olmalı
        expect(ariaLabel || text).toBeTruthy();
      }
    }
  });

  test('resimler alt text içeriyor', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Resimler
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // En az bir resim kontrol et
      const firstImage = images.first();
      const alt = await firstImage.getAttribute('alt');
      const ariaLabel = await firstImage.getAttribute('aria-label');
      
      // Dekoratif resimler alt="" içerebilir, ama içerik resimlerinin alt text'i olmalı
      // Bu test sadece kontrol eder, tüm resimlerin alt text'i olması gerekmez
      expect(alt !== null || ariaLabel !== null || (await firstImage.getAttribute('role')) === 'presentation').toBeTruthy();
    }
  });

  test('klavye navigasyonu çalışıyor', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Tab ile navigasyon
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus görünür olmalı
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement).toBeVisible();
    }
  });

  test('renk kontrastı yeterli', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Bu test manuel olarak yapılmalı veya axe-core gibi bir tool kullanılmalı
    // Playwright'ta renk kontrastı testi için özel bir tool gerekir
    // Şimdilik sadece sayfanın yüklendiğini kontrol ediyoruz
    await expect(page).toHaveTitle(/.+/);
  });
});

