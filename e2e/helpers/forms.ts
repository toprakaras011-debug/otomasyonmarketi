import { Page, expect } from '@playwright/test';

/**
 * Fast form field fill with optimized waiting
 */
export async function fillFormField(
  page: Page,
  fieldName: string,
  value: string,
  fieldType: 'input' | 'textarea' | 'select' = 'input'
) {
  const selector = `${fieldType}[name="${fieldName}"]`;
  // Wait for field to be ready, but with shorter timeout
  await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
  await page.fill(selector, value, { timeout: 5000 });
}

export async function selectOption(
  page: Page,
  selectName: string,
  optionValue: string
) {
  await page.selectOption(`select[name="${selectName}"]`, optionValue);
}

export async function checkCheckbox(page: Page, checkboxName: string) {
  await page.check(`input[type="checkbox"][name="${checkboxName}"]`);
}

export async function uncheckCheckbox(page: Page, checkboxName: string) {
  await page.uncheck(`input[type="checkbox"][name="${checkboxName}"]`);
}

export async function submitForm(page: Page, formSelector?: string) {
  if (formSelector) {
    await page.click(`${formSelector} button[type="submit"]`);
  } else {
    await page.click('button[type="submit"]');
  }
}

export async function verifyFieldError(
  page: Page,
  fieldName: string,
  expectedError: string | RegExp
) {
  const errorElement = page.locator(`[data-field="${fieldName}"] ~ *[role="alert"], input[name="${fieldName}"] ~ *[role="alert"]`).first();
  if (typeof expectedError === 'string') {
    await expect(errorElement).toContainText(expectedError);
  } else {
    await expect(errorElement).toHaveText(expectedError);
  }
}

export async function verifyFieldValue(
  page: Page,
  fieldName: string,
  expectedValue: string
) {
  const field = page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"]`);
  await expect(field).toHaveValue(expectedValue);
}

/**
 * Fast toast wait with optimized timeout
 */
export async function waitForToast(page: Page, message?: string | RegExp) {
  const toast = page.locator('[data-sonner-toast], [data-sonner-toaster] [role="status"]').first();
  await toast.waitFor({ state: 'visible', timeout: 3000 });
  
  if (message) {
    if (typeof message === 'string') {
      await expect(toast).toContainText(message, { timeout: 2000 });
    } else {
      await expect(toast).toHaveText(message, { timeout: 2000 });
    }
  }
}

