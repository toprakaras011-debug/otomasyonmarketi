# 🎯 Son Kullanıcı Test Senaryosu

Bu test dosyası, gerçek bir kullanıcının siteyi nasıl kullanacağını simüle eden kapsamlı E2E testlerini içerir.

## 📋 Test Senaryoları

### 1. Tam Kullanıcı Yolculuğu
**Dosya:** `user-journey.spec.ts` - `tam kullanıcı yolculuğu` testi

Bu test şu adımları içerir:
1. ✅ **Ana Sayfayı Ziyaret Etme** - Ana sayfanın yüklendiğini ve içeriğin göründüğünü kontrol eder
2. ✅ **Otomasyonları Keşfetme** - Otomasyonlar sayfasına gidip listeyi görüntüler
3. ✅ **Kayıt Olma** - Yeni kullanıcı kaydı oluşturur (email, şifre, kullanıcı adı, vb.)
4. ✅ **Giriş Yapma** - Oluşturulan hesap ile giriş yapar
5. ✅ **Otomasyon Detaylarını Görüntüleme** - Bir otomasyonun detay sayfasını açar
6. ✅ **Sepete Ekleme** - Otomasyonu sepete ekler
7. ✅ **Profil Ayarlarını Güncelleme** - Kullanıcı profil bilgilerini günceller
8. ✅ **Çıkış Yapma** - Kullanıcı oturumunu kapatır

### 2. Hızlı Kullanıcı Akışı
**Dosya:** `user-journey.spec.ts` - `hızlı kullanıcı akışı` testi

Temel akışı hızlıca test eder:
- Ana sayfa → Otomasyonlar → Kayıt sayfası

### 3. Mobil Kullanıcı Deneyimi
**Dosya:** `user-journey.spec.ts` - `mobil kullanıcı deneyimi` testi

Mobil cihazlarda (iPhone SE boyutu) siteyi test eder:
- Responsive tasarım kontrolü
- Mobil menü işlevselliği
- Mobil sayfa yüklemeleri

## 🚀 Testleri Çalıştırma

### Tüm Son Kullanıcı Testlerini Çalıştır
```bash
npm run test:e2e user-journey
```

### Sadece Tam Yolculuk Testini Çalıştır
```bash
npx playwright test e2e/user-journey.spec.ts -g "tam kullanıcı yolculuğu"
```

### Sadece Hızlı Akış Testini Çalıştır
```bash
npx playwright test e2e/user-journey.spec.ts -g "hızlı kullanıcı akışı"
```

### Sadece Mobil Testi Çalıştır
```bash
npx playwright test e2e/user-journey.spec.ts -g "mobil kullanıcı deneyimi"
```

### Headless Modda (Arka Planda) Çalıştır
```bash
npx playwright test e2e/user-journey.spec.ts --headed=false
```

### UI Modunda (Görsel) Çalıştır
```bash
npx playwright test e2e/user-journey.spec.ts --ui
```

### Belirli Bir Tarayıcıda Çalıştır
```bash
# Chrome
npx playwright test e2e/user-journey.spec.ts --project=chromium

# Firefox
npx playwright test e2e/user-journey.spec.ts --project=firefox

# Safari
npx playwright test e2e/user-journey.spec.ts --project=webkit
```

## 📊 Test Sonuçları

Testler tamamlandığında:
- ✅ Başarılı testler yeşil işaretle gösterilir
- ❌ Başarısız testler kırmızı işaretle gösterilir
- 📸 Başarısız testler için otomatik ekran görüntüleri alınır
- 🎥 Başarısız testler için otomatik video kayıtları alınır

Test raporunu görüntülemek için:
```bash
npx playwright show-report
```

## 🔧 Test Yapılandırması

Testler şu ayarlarla çalışır:
- **Timeout:** 10 saniye (aksiyonlar için)
- **Navigation Timeout:** 15 saniye
- **Retry:** CI'da 2 kez, lokal'de 0 kez
- **Paralel Çalışma:** Aktif (CI'da kapalı)

## 📝 Test Verileri

Her test çalıştığında:
- Benzersiz email adresi oluşturulur: `test-user-{timestamp}@example.com`
- Benzersiz kullanıcı adı oluşturulur: `testuser{timestamp}`
- Güçlü şifre kullanılır: `Test123456!`

## ⚠️ Önemli Notlar

1. **Turnstile:** Testlerde Turnstile doğrulaması varsa, 3 saniye beklenir
2. **Cookie Consent:** Tüm testlerde cookie consent otomatik olarak kabul edilir
3. **Hata Toleransı:** Bazı adımlar (örn. sepete ekleme) bulunamazsa test devam eder
4. **Gerçek Veritabanı:** Testler gerçek veritabanını kullanır, bu yüzden test verileri oluşturulur

## 🐛 Sorun Giderme

### Test Başarısız Oluyorsa

1. **Sunucu Çalışıyor mu?**
   ```bash
   npm run dev
   ```

2. **Bağımlılıklar Yüklü mü?**
   ```bash
   npm install
   ```

3. **Playwright Tarayıcıları Yüklü mü?**
   ```bash
   npx playwright install
   ```

4. **Timeout Hatası Alıyorsanız:**
   - `playwright.config.ts` dosyasındaki timeout değerlerini artırın
   - Veya test dosyasındaki `timeout` parametrelerini artırın

5. **Element Bulunamıyor Hatası:**
   - Sayfa yüklenmesini bekleyin
   - Selector'ları kontrol edin
   - Sayfanın gerçekten yüklendiğinden emin olun

## 📚 İlgili Dosyalar

- `e2e/user-journey.spec.ts` - Ana test dosyası
- `e2e/helpers/navigation.ts` - Navigasyon yardımcı fonksiyonları
- `e2e/helpers/forms.ts` - Form yardımcı fonksiyonları
- `playwright.config.ts` - Playwright yapılandırması

## 🎉 Başarılı Test Sonucu

Tüm testler başarıyla tamamlandığında şu çıktıyı görürsünüz:

```
Running 3 tests using 1 worker

  ✓ e2e/user-journey.spec.ts:15:5 › Son Kullanıcı Test Senaryosu › tam kullanıcı yolculuğu (45.2s)
  ✓ e2e/user-journey.spec.ts:156:5 › Son Kullanıcı Test Senaryosu › hızlı kullanıcı akışı (8.3s)
  ✓ e2e/user-journey.spec.ts:178:5 › Son Kullanıcı Test Senaryosu › mobil kullanıcı deneyimi (6.1s)

  3 passed (59.6s)
```

