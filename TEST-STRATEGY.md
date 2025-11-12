# 🧪 Katmanlı Test Stratejisi - Özet

## 📊 Test Piramidi

```
        /\
       /  \
      / E2E \        ← %10 - Kritik akışlar (checkout, login, payment)
     /______\
    /        \
   /Integration\     ← %20 - API, DB entegrasyonları
  /____________\
 /              \
/    Unit Test   \   ← %70 - Utility fonksiyonları (hızlı, çok sayıda)
/________________\
```

## 🎯 Test Kategorileri

### 🧠 Unit Testler (Vitest)
**Hız:** ⚡⚡⚡ Çok Hızlı  
**Sayı:** Çok fazla  
**Kapsam:** Utility fonksiyonları, pure functions

**Örnekler:**
- ✅ IBAN validasyonu
- ✅ Username masking
- ✅ ClassName merge
- ✅ Form validators

**Çalıştırma:**
```bash
npm run test:unit              # Tüm unit testler
npm run test:unit:watch        # Watch mode
npm run test:unit:coverage     # Coverage raporu
```

### ⚙️ Integration Testler (Vitest)
**Hız:** ⚡⚡ Orta  
**Sayı:** Orta  
**Kapsam:** API routes, DB işlemleri, servis entegrasyonları

**Örnekler:**
- ✅ Notification preferences API
- ✅ Contact form API
- ✅ Authentication API
- ✅ Database queries

**Çalıştırma:**
```bash
npm run test:integration       # Tüm integration testler
```

### 🌐 E2E Testler (Playwright)
**Hız:** ⚡ Yavaş  
**Sayı:** Az (sadece kritik)  
**Kapsam:** Gerçek kullanıcı akışları

#### 🚨 Kritik E2E Testler (Para Kaybettiren Akışlar)
- ✅ **Checkout Flow** - Sepet → Checkout → Ödeme
- ✅ **Authentication Flow** - Kayıt → Giriş → Şifre Sıfırlama
- ✅ **Payment Flow** - Ödeme işlemi ve onay

#### 📋 Diğer E2E Testler
- Ana sayfa navigasyonu
- Form validasyonları
- Accessibility
- Responsive tasarım

**Çalıştırma:**
```bash
npm run test:e2e               # Tüm E2E testler
npm run test:e2e:critical      # Sadece kritik akışlar (hızlı)
npm run test:e2e:ui            # UI mode
```

## 🚀 Hızlı Başlangıç

### Tüm Testleri Çalıştır
```bash
npm run test:all               # Unit + Integration + Critical E2E
```

### Sadece Kritik Testler (CI/CD için)
```bash
npm run test:unit              # Unit testler
npm run test:integration       # Integration testler
npm run test:e2e:critical      # Kritik E2E testler
```

## 📈 Test Coverage

```bash
npm run test:unit:coverage     # Coverage raporu oluştur
```

Rapor `coverage/` klasöründe HTML formatında oluşturulur.

## 🎯 Test Yazma Prensipleri

### ✅ Yapılmalı:
1. **Unit Testler:** Her utility fonksiyonu için test yaz
2. **Integration Testler:** API route'ları ve DB işlemlerini test et
3. **E2E Testler:** Sadece kritik akışları test et (checkout, login, payment)

### ❌ Yapılmamalı:
1. Her UI değişikliğini E2E ile test etme
2. Gereksiz `waitForTimeout` kullanma
3. `networkidle` beklemek (çok yavaş)
4. Aynı şeyi hem unit hem E2E'de test etme

## 📁 Dosya Yapısı

```
project/
├── lib/
│   └── utils/
│       └── __tests__/          # Unit testler
│           ├── iban-bank.test.ts
│           ├── username-mask.test.ts
│           └── cn.test.ts
├── tests/
│   ├── setup.ts                 # Test setup
│   ├── integration/             # Integration testler
│   │   └── api/
│   │       ├── notification-preferences.test.ts
│   │       └── contact.test.ts
│   └── README.md                # Detaylı dokümantasyon
├── e2e/
│   ├── critical/                # 🚨 Kritik E2E testler
│   │   ├── checkout.spec.ts
│   │   └── auth.spec.ts
│   ├── helpers/                 # Test helper'ları
│   └── *.spec.ts                # Diğer E2E testler
├── vitest.config.ts             # Vitest konfigürasyonu
└── playwright.config.ts         # Playwright konfigürasyonu
```

## 🔧 Konfigürasyon Dosyaları

- **Vitest:** `vitest.config.ts` - Unit ve Integration testler için
- **Playwright:** `playwright.config.ts` - E2E testler için
- **Test Setup:** `tests/setup.ts` - Global test setup

## 📊 Performans Metrikleri

| Test Tipi | Ortalama Süre | Paralel Çalışma | Coverage Hedefi |
|-----------|---------------|-----------------|-----------------|
| Unit | < 1 saniye | ✅ Evet | %80+ |
| Integration | 2-5 saniye | ✅ Evet | %70+ |
| E2E Critical | 10-30 saniye | ⚠️ Sınırlı | %100 (kritik akışlar) |
| E2E Full | 5-10 dakika | ⚠️ Sınırlı | %60+ |

## 🎓 Öğrenme Kaynakları

- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Test Stratejisi Rehberi](./tests/README.md)

## 🐛 Sorun Giderme

### Unit testler çalışmıyor
```bash
npm install --save-dev vitest @vitejs/plugin-react jsdom
```

### Integration testler çalışmıyor
Mock'ların doğru kurulduğundan emin ol: `tests/setup.ts`

### E2E testler çok yavaş
- Sadece kritik testleri çalıştır: `npm run test:e2e:critical`
- `networkidle` yerine `domcontentloaded` kullan
- Gereksiz `waitForTimeout` kaldır

## 📝 Notlar

- **E2E testler sadece kritik akışlar için kullanılmalı**
- **Unit testler en hızlı ve en çok sayıda olmalı**
- **Integration testler API ve DB işlemlerini kapsamalı**
- **Test coverage %80+ hedeflenmeli (unit testler için)**

