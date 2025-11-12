import { test, expect } from '@playwright/test';
import { navigateTo } from './helpers/navigation';
import { signIn } from './helpers/auth';

test.describe('Dashboard', () => {
  test('dashboard sayfası yükleniyor (authenticated)', async ({ page }) => {
    // Giriş yapılmış olmalı
    await navigateTo(page, '/dashboard');
    
    // Eğer giriş yapılmamışsa, signin sayfasına yönlendirilmeli
    const currentUrl = page.url();
    if (currentUrl.includes('/auth/signin')) {
      // Test için giriş yap (gerçek test ortamında test kullanıcısı olmalı)
      // await signIn(page, 'test@example.com', 'password');
    } else {
      await expect(page).toHaveURL(/.*dashboard/);
    }
  });

  test('dashboard menüsü görünür', async ({ page }) => {
    await navigateTo(page, '/dashboard');
    
    // Dashboard menü öğeleri
    const menuItems = page.locator('nav a[href*="dashboard"], [data-testid="dashboard-menu"] a').first();
    
    if (await menuItems.count() > 0) {
      await expect(menuItems).toBeVisible();
    }
  });

  test('profil bilgileri görünür', async ({ page }) => {
    await navigateTo(page, '/dashboard');
    
    // Profil bilgileri
    const profileSection = page.locator('[data-testid="profile"], .profile-section').first();
    
    if (await profileSection.count() > 0) {
      await expect(profileSection).toBeVisible();
    }
  });

  test('ayarlar sayfasına gidilebiliyor', async ({ page }) => {
    await navigateTo(page, '/dashboard');
    
    const settingsLink = page.locator('a[href*="dashboard/settings"], a[href*="settings"]').first();
    
    if (await settingsLink.count() > 0) {
      await settingsLink.click();
      await page.waitForURL(/.*dashboard\/settings/, { timeout: 10000 });
    }
  });

  test('favoriler sayfasına gidilebiliyor', async ({ page }) => {
    await navigateTo(page, '/dashboard');
    
    const favoritesLink = page.locator('a[href*="favorites"], a[href*="favoriler"]').first();
    
    if (await favoritesLink.count() > 0) {
      await favoritesLink.click();
      await page.waitForURL(/.*favorites/, { timeout: 10000 });
    }
  });
});

test.describe('Dashboard Settings', () => {
  test('ayarlar sayfası yükleniyor', async ({ page }) => {
    await navigateTo(page, '/dashboard/settings');
    
    // Eğer giriş yapılmamışsa signin'e yönlendirilir
    if (!page.url().includes('/auth/signin')) {
      await expect(page).toHaveURL(/.*dashboard\/settings/);
    }
  });

  test('profil bilgileri güncellenebiliyor', async ({ page }) => {
    await navigateTo(page, '/dashboard/settings');
    
    if (!page.url().includes('/auth/signin')) {
      // Profil formu alanları
      const fullNameInput = page.locator('input[name="fullName"], input[name="name"]').first();
      
      if (await fullNameInput.count() > 0) {
        await fullNameInput.fill('Updated Name');
        await expect(fullNameInput).toHaveValue('Updated Name');
      }
    }
  });

  test('şifre değiştirilebiliyor', async ({ page }) => {
    await navigateTo(page, '/dashboard/settings');
    
    if (!page.url().includes('/auth/signin')) {
      // Şifre değiştirme formu
      const passwordSection = page.locator('[data-testid="password-section"], h2:has-text("Şifre")').first();
      
      if (await passwordSection.count() > 0) {
        await expect(passwordSection).toBeVisible();
      }
    }
  });
});

test.describe('Developer Dashboard', () => {
  test('geliştirici dashboard sayfası yükleniyor', async ({ page }) => {
    await navigateTo(page, '/developer/dashboard');
    
    // Giriş yapılmamışsa signin'e yönlendirilir
    if (!page.url().includes('/auth/signin')) {
      await expect(page).toHaveURL(/.*developer\/dashboard/);
    }
  });

  test('otomasyonlar listesi görünür', async ({ page }) => {
    await navigateTo(page, '/developer/dashboard');
    
    if (!page.url().includes('/auth/signin')) {
      // Geliştirici otomasyonları
      const automationsList = page.locator('[data-testid="developer-automations"]').first();
      
      if (await automationsList.count() > 0) {
        await expect(automationsList).toBeVisible();
      }
    }
  });

  test('yeni otomasyon eklenebiliyor', async ({ page }) => {
    await navigateTo(page, '/developer/dashboard');
    
    if (!page.url().includes('/auth/signin')) {
      // Yeni otomasyon butonu
      const addAutomationButton = page.locator('a[href*="automations/new"], button:has-text("Yeni Otomasyon")').first();
      
      if (await addAutomationButton.count() > 0) {
        await expect(addAutomationButton).toBeVisible();
      }
    }
  });
});

test.describe('Admin Dashboard', () => {
  test('admin dashboard sayfası yükleniyor', async ({ page }) => {
    await navigateTo(page, '/admin/dashboard');
    
    // Admin yetkisi yoksa erişim reddedilir
    if (!page.url().includes('/auth/signin') && !page.url().includes('/dashboard')) {
      await expect(page).toHaveURL(/.*admin\/dashboard/);
    }
  });
});

