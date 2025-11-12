# End-to-End (E2E) Testler

Bu dizin, Playwright kullanılarak yazılmış end-to-end testleri içerir.

## Kurulum

1. Dependencies'leri yükleyin:
```bash
npm install
```

2. Playwright browser'larını yükleyin:
```bash
npx playwright install
```

## Testleri Çalıştırma

### Tüm Testleri Çalıştırma
```bash
npm run test:e2e
```

### UI Mode ile Test Çalıştırma
```bash
npm run test:e2e:ui
```

### Headed Mode (Browser Görünür)
```bash
npm run test:e2e:headed
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### Belirli bir Test Dosyası Çalıştırma
```bash
npx playwright test e2e/home.spec.ts
```

### Belirli bir Test Çalıştırma
```bash
npx playwright test e2e/home.spec.ts -g "ana sayfa yükleniyor"
```

## Test Yapısı

### Test Dosyaları

- `home.spec.ts` - Ana sayfa ve navigasyon testleri
- `auth.spec.ts` - Authentication testleri (signup, signin, logout)
- `automations.spec.ts` - Otomasyonlar sayfası ve detay testleri
- `cart.spec.ts` - Sepet ve checkout testleri
- `dashboard.spec.ts` - Dashboard testleri
- `forms.spec.ts` - Form validasyon testleri
- `accessibility.spec.ts` - Erişilebilirlik testleri
- `integration.spec.ts` - Integration testleri

### Helper Dosyaları

- `helpers/auth.ts` - Authentication helper fonksiyonları
- `helpers/navigation.ts` - Navigasyon helper fonksiyonları
- `helpers/forms.ts` - Form helper fonksiyonları
- `fixtures.ts` - Test fixtures

## Test Senaryoları

### Ana Sayfa Testleri
- Ana sayfa yükleniyor
- Navbar görünür ve çalışıyor
- Hero section görünür
- Kategoriler bölümü görünür
- Otomasyonlar bölümü görünür
- Footer görünür
- Login/Signup butonları görünür

### Authentication Testleri
- Kayıt sayfası yükleniyor
- Geçersiz email ile kayıt başarısız
- Şifre eşleşmiyor hatası
- Terms kabul edilmeden kayıt başarısız
- Zayıf şifre ile kayıt başarısız
- Geçerli bilgilerle kayıt formu doldurulabiliyor
- Giriş sayfası yükleniyor
- Geçersiz email ile giriş başarısız
- Yanlış şifre ile giriş başarısız
- Boş alanlarla giriş başarısız
- Şifre sıfırlama sayfası yükleniyor

### Otomasyonlar Testleri
- Otomasyonlar sayfası yükleniyor
- Otomasyon listesi görünür
- Otomasyon detay sayfasına gidilebiliyor
- Arama çalışıyor
- Filtreleme çalışıyor
- Sıralama çalışıyor
- Otomasyon bilgileri görünür
- Sepete ekle butonu görünür
- Favorilere ekle butonu görünür

### Sepet Testleri
- Sepet sayfası yükleniyor
- Boş sepet görünür
- Sepet ikonu görünür
- Sepete ekle butonu çalışıyor
- Sepetten ürün kaldırılabiliyor
- Sepet miktarı güncellenebiliyor
- Checkout sayfasına gidilebiliyor

### Dashboard Testleri
- Dashboard sayfası yükleniyor
- Dashboard menüsü görünür
- Profil bilgileri görünür
- Ayarlar sayfasına gidilebiliyor
- Favoriler sayfasına gidilebiliyor
- Profil bilgileri güncellenebiliyor
- Şifre değiştirilebiliyor

### Form Validasyon Testleri
- Email validasyonu çalışıyor
- Şifre minimum uzunluk kontrolü
- Zorunlu alanlar işaretlenmiş
- Telefon numarası formatı kontrol ediliyor
- İletişim formu doldurulabiliyor
- İletişim formu gönderilebiliyor

### Accessibility Testleri
- Ana sayfa erişilebilir
- Navigation erişilebilir
- Formlar erişilebilir
- Butonlar erişilebilir
- Resimler alt text içeriyor
- Klavye navigasyonu çalışıyor

### Integration Testleri
- Tam kullanıcı akışı: kayıt -> giriş -> otomasyon görüntüleme
- Tam satın alma akışı: otomasyon seç -> sepete ekle -> checkout
- Arama ve filtreleme akışı
- Dashboard navigasyon akışı
- Blog ve içerik sayfaları akışı
- Yardım ve destek sayfaları akışı
- Yasal sayfalar akışı

## Environment Variables

Testler için aşağıdaki environment variable'ları ayarlayabilirsiniz:

- `PLAYWRIGHT_TEST_BASE_URL` - Test base URL (varsayılan: http://localhost:3000)
- `CI` - CI ortamında çalıştığında otomatik olarak ayarlanır

## Test Ortamı

Testler, `playwright.config.ts` dosyasında yapılandırılmıştır:

- **Base URL**: http://localhost:3000 (development server)
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile Viewports**: Pixel 5, iPhone 12
- **Retries**: CI'da 2, local'de 0
- **Workers**: CI'da 1, local'de undefined (paralel çalışır)

## Test Sonuçları

Test sonuçları şu şekillerde görüntülenebilir:

1. **HTML Report**: `npx playwright show-report` komutu ile
2. **Terminal Output**: Test çalıştırıldığında terminalde görünür
3. **Screenshots**: Başarısız testler için otomatik olarak kaydedilir
4. **Videos**: Başarısız testler için otomatik olarak kaydedilir
5. **Traces**: Başarısız testler için otomatik olarak kaydedilir

## CI/CD Entegrasyonu

Testler CI/CD pipeline'ında otomatik olarak çalıştırılabilir:

```yaml
# GitHub Actions örneği
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

## Sorun Giderme

### Testler çalışmıyor
1. Development server'ın çalıştığından emin olun: `npm run dev`
2. Playwright browser'larının yüklü olduğundan emin olun: `npx playwright install`
3. Environment variable'ların doğru ayarlandığından emin olun

### Testler yavaş çalışıyor
1. `playwright.config.ts` dosyasında `workers` sayısını artırın
2. Gereksiz testleri kaldırın veya `test.skip()` ile atlayın
3. `fullyParallel: false` yaparak testleri sıralı çalıştırın

### Testler başarısız oluyor
1. Test sonuçlarını kontrol edin: `npx playwright show-report`
2. Screenshot'ları kontrol edin: `test-results/` klasörü
3. Trace dosyalarını kontrol edin: `test-results/` klasörü
4. Testleri debug mode'da çalıştırın: `npm run test:e2e:debug`

## Best Practices

1. **Test Isolation**: Her test bağımsız olmalı
2. **Page Object Model**: Sayfa nesnelerini kullanın
3. **Helper Functions**: Ortak işlemler için helper fonksiyonları kullanın
4. **Wait Strategies**: Doğru wait stratejilerini kullanın
5. **Assertions**: Açık ve anlaşılır assertion'lar kullanın
6. **Error Handling**: Hata durumlarını test edin
7. **Accessibility**: Erişilebilirlik testlerini dahil edin
8. **Performance**: Performans testlerini dahil edin

## Daha Fazla Bilgi

- [Playwright Dokümantasyonu](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API](https://playwright.dev/docs/api/class-playwright)

