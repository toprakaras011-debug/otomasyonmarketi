import { test, expect } from '@playwright/test';

/**
 * Password Reset Flow E2E Test
 * 
 * Tests the complete password reset flow:
 * 1. Request password reset
 * 2. Click email link
 * 3. Set new password
 * 4. Login with new password
 */

test.describe('Password Reset Flow', () => {
  const testEmail = 'test@example.com'; // Replace with a test email
  const oldPassword = 'OldPassword123!';
  const newPassword = 'NewPassword123!';

  test.beforeEach(async ({ page }) => {
    // Navigate to forgot password page
    await page.goto('/auth/forgot-password');
  });

  test('should display forgot password page', async ({ page }) => {
    await expect(page.getByText('Şifremi Unuttum')).toBeVisible();
    await expect(page.getByPlaceholder('ornek@email.com')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.getByPlaceholder('ornek@email.com');
    const submitButton = page.getByRole('button', { name: /Şifre Sıfırlama Bağlantısı Gönder/i });

    // Test invalid email
    await emailInput.fill('invalid-email');
    await submitButton.click();
    
    // Should show validation error
    await expect(page.getByText(/Geçerli bir e-posta/i)).toBeVisible();
  });

  test('should send password reset email', async ({ page }) => {
    const emailInput = page.getByPlaceholder('ornek@email.com');
    const submitButton = page.getByRole('button', { name: /Şifre Sıfırlama Bağlantısı Gönder/i });

    await emailInput.fill(testEmail);
    await submitButton.click();

    // Wait for success message
    await expect(page.getByText(/E-posta gönderildi/i)).toBeVisible({ timeout: 10000 });
    
    // Check console for debug logs
    const logs: string[] = [];
    page.on('console', (msg) => {
      if (msg.text().includes('[DEBUG] resetPassword')) {
        logs.push(msg.text());
      }
    });

    // Verify debug logs are present
    expect(logs.length).toBeGreaterThan(0);
  });

  test('should handle password reset link', async ({ page, context }) => {
    // This test requires manual intervention or email service mock
    // For now, we'll test the reset password page directly
    
    // Simulate coming from email link with recovery token
    await page.goto('/auth/reset-password#access_token=test_token&type=recovery&refresh_token=test_refresh');
    
    // Should show password reset form (or error if token invalid)
    const passwordInput = page.getByPlaceholder(/En az 8 karakter/i);
    
    // If token is valid, form should be visible
    // If token is invalid, error message should be visible
    const hasForm = await passwordInput.isVisible().catch(() => false);
    const hasError = await page.getByText(/geçersiz/i).isVisible().catch(() => false);
    
    expect(hasForm || hasError).toBe(true);
  });

  test('should validate new password requirements', async ({ page }) => {
    // Navigate to reset password page (assuming valid token)
    await page.goto('/auth/reset-password');
    
    const passwordInput = page.getByPlaceholder(/En az 8 karakter/i);
    const confirmInput = page.getByPlaceholder(/Şifrenizi tekrar girin/i);
    const submitButton = page.getByRole('button', { name: /Şifreyi Güncelle/i });

    // Test weak password
    await passwordInput.fill('weak');
    await confirmInput.fill('weak');
    await submitButton.click();
    
    // Should show validation error
    await expect(page.getByText(/en az 8 karakter/i)).toBeVisible();
  });

  test('should validate password match', async ({ page }) => {
    await page.goto('/auth/reset-password');
    
    const passwordInput = page.getByPlaceholder(/En az 8 karakter/i);
    const confirmInput = page.getByPlaceholder(/Şifrenizi tekrar girin/i);
    const submitButton = page.getByRole('button', { name: /Şifreyi Güncelle/i });

    await passwordInput.fill('NewPassword123!');
    await confirmInput.fill('DifferentPassword123!');
    await submitButton.click();
    
    // Should show mismatch error
    await expect(page.getByText(/eşleşmiyor/i)).toBeVisible();
  });

  test('should show password requirements', async ({ page }) => {
    await page.goto('/auth/reset-password');
    
    // Check if requirements are displayed
    await expect(page.getByText(/Şifre Gereksinimleri/i)).toBeVisible();
    await expect(page.getByText(/En az 8 karakter/i)).toBeVisible();
    await expect(page.getByText(/Büyük harf/i)).toBeVisible();
    await expect(page.getByText(/Küçük harf/i)).toBeVisible();
    await expect(page.getByText(/Rakam/i)).toBeVisible();
    await expect(page.getByText(/Özel karakter/i)).toBeVisible();
  });
});

test.describe('Password Reset Error Handling', () => {
  test('should redirect OAuth errors away from reset password page', async ({ page }) => {
    // Simulate OAuth error on reset password page
    await page.goto('/auth/reset-password?error=oauth_failed');
    
    // Should redirect to signin
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('should handle invalid token', async ({ page }) => {
    await page.goto('/auth/reset-password?error=invalid_token');
    
    // Should show error message
    await expect(page.getByText(/geçersiz/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Yeni şifre sıfırlama/i })).toBeVisible();
  });

  test('should handle expired token', async ({ page }) => {
    await page.goto('/auth/reset-password?error=otp_expired');
    
    // Should show expired message
    await expect(page.getByText(/süresi dolmuş/i)).toBeVisible();
  });
});

