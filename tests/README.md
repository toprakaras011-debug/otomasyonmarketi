# 🧪 Katmanlı Test Stratejisi

Bu proje **3 katmanlı test stratejisi** kullanır:

## 📊 Test Piramidi

```
        /\
       /  \
      / E2E \        ← Kritik kullanıcı akışları (az sayıda)
     /______\
    /        \
   /Integration\     ← API, DB, modül entegrasyonları
  /____________\
 /              \
/    Unit Test   \   ← Fonksiyon, component testleri (çok sayıda)
/________________\
```

## 🧠 1. Unit Testler (Vitest)

**Amaç:** Kod mantığının doğruluğunu test eder  
**Ne test eder:** Utility fonksiyonları, helper'lar, pure functions  
**Konum:** `lib/**/__tests__/*.test.ts`

### Örnekler:
- ✅ IBAN validasyonu (`lib/utils/__tests__/iban-bank.test.ts`)
- ✅ Username masking (`lib/utils/__tests__/username-mask.test.ts`)
- ✅ ClassName merge (`lib/utils/__tests__/cn.test.ts`)

### Çalıştırma:
```bash
npm run test:unit              # Tüm unit testler
npm run test:unit:watch        # Watch mode
npm run test:unit:coverage     # Coverage raporu
```

## ⚙️ 2. Integration Testler (Vitest)

**Amaç:** Modüllerin birlikte çalışmasını test eder  
**Ne test eder:** API routes, DB işlemleri, servis entegrasyonları  
**Konum:** `tests/integration/**/*.test.ts`

### Örnekler:
- ✅ Notification preferences API (`tests/integration/api/notification-preferences.test.ts`)
- ✅ Contact form API (`tests/integration/api/contact.test.ts`)

### Çalıştırma:
```bash
npm run test:integration       # Tüm integration testler
```

## 🌐 3. E2E Testler (Playwright)

**Amaç:** Gerçek kullanıcı akışlarını test eder  
**Ne test eder:** Tarayıcı + backend entegrasyonu  
**Konum:** `e2e/**/*.spec.ts`

### Kritik E2E Testler (Para Kaybettiren Akışlar)
**Konum:** `e2e/critical/**/*.spec.ts`

- 🚨 **Checkout Flow** (`e2e/critical/checkout.spec.ts`)
  - Sepete ekleme
  - Checkout sayfası
  - Ödeme formu
  - Sipariş onayı

- 🚨 **Authentication Flow** (`e2e/critical/auth.spec.ts`)
  - Kullanıcı kaydı
  - Giriş yapma
  - Şifre sıfırlama

### Diğer E2E Testler
- Ana sayfa navigasyonu
- Form validasyonları
- Accessibility
- Responsive tasarım

### Çalıştırma:
```bash
npm run test:e2e               # Tüm E2E testler
npm run test:e2e:critical      # Sadece kritik akışlar
npm run test:e2e:ui            # UI mode
npm run test:e2e:headed        # Headed mode
npm run test:e2e:debug         # Debug mode
```

## 🚀 Tüm Testleri Çalıştırma

```bash
npm run test:all               # Unit + Integration + Critical E2E
```

## 📈 Test Coverage

Unit testler için coverage raporu:
```bash
npm run test:unit:coverage
```

Rapor `coverage/` klasöründe oluşturulur.

## 🎯 Test Stratejisi Prensipleri

1. **Unit Testler:** Hızlı, izole, çok sayıda
2. **Integration Testler:** Orta hız, modül entegrasyonları
3. **E2E Testler:** Yavaş ama gerçekçi, sadece kritik akışlar

### E2E Testlerde Dikkat Edilmesi Gerekenler:

✅ **Yapılmalı:**
- Kritik akışları test et (checkout, login, payment)
- Optimize edilmiş bekleme stratejileri kullan
- Cookie consent'i otomatik kapat

❌ **Yapılmamalı:**
- Her UI değişikliğini E2E ile test etme
- Gereksiz `waitForTimeout` kullanma
- `networkidle` beklemek (çok yavaş)

## 📝 Test Yazma Rehberi

### Unit Test Örneği:
```typescript
import { describe, it, expect } from 'vitest';
import { validateIban } from '../iban-bank';

describe('validateIban', () => {
  it('should validate correct Turkish IBAN', () => {
    expect(validateIban('TR330006100519786457841326')).toBe(true);
  });
});
```

### Integration Test Örneği:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/notification-preferences/route';

describe('API: Notification Preferences', () => {
  it('should return 401 if user is not authenticated', async () => {
    // Mock setup
    const response = await GET();
    expect(response.status).toBe(401);
  });
});
```

### E2E Test Örneği:
```typescript
import { test, expect } from '@playwright/test';
import { navigateTo, dismissCookieConsent } from '../helpers/navigation';

test('kritik: checkout flow', async ({ page }) => {
  await navigateTo(page, '/checkout');
  await dismissCookieConsent(page);
  // Test implementation
});
```

## 🔧 Konfigürasyon

- **Vitest:** `vitest.config.ts`
- **Playwright:** `playwright.config.ts`
- **Test Setup:** `tests/setup.ts`

## 📊 Test Metrikleri

İdeal test dağılımı:
- **Unit Tests:** %70 (hızlı, çok sayıda)
- **Integration Tests:** %20 (orta hız, orta sayıda)
- **E2E Tests:** %10 (yavaş, az sayıda ama kritik)

