# Testing Guide

## Test Coverage

### Current Coverage
- **Unit Tests:** ~30%
- **Integration Tests:** ~20%
- **E2E Tests:** ~40%

### Target Coverage
- **Unit Tests:** 80%
- **Integration Tests:** 60%
- **E2E Tests:** 80%

---

## Running Tests

### All Tests
```bash
npm run test:all
```

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:unit:coverage
```

---

## Test Files

### Password Reset Flow Test
**File:** `tests/e2e/password-reset-flow.spec.ts`

**Tests:**
- Forgot password page display
- Email validation
- Password reset email sending
- Password reset link handling
- Password validation
- Password match validation
- Error handling

### Authentication Unit Tests
**File:** `tests/unit/lib/auth.test.ts`

**Tests:**
- Sign up validation
- Sign in validation
- Password reset validation
- Password update validation

### Monitoring Tests
**File:** `tests/unit/lib/monitoring.test.ts`

**Tests:**
- Error capture
- Warning capture
- Performance tracking
- Event tracking

---

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { signUp } from '@/lib/auth';

describe('signUp', () => {
  it('should validate email', async () => {
    await expect(
      signUp('', 'password', 'username', 'user')
    ).rejects.toThrow('E-posta adresi gereklidir');
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('should sign in', async ({ page }) => {
  await page.goto('/auth/signin');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

---

## Test Data

### Test Users
- **Email:** test@example.com
- **Password:** TestPassword123!
- **Username:** testuser

### Test Admin
- **Email:** admin@example.com
- **Password:** AdminPassword123!
- **Role:** admin

---

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Manual trigger

---

**Last Updated:** 2025-01-13

