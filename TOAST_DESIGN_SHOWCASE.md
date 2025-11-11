# 🎨 Yeni Toast Bildirim Tasarımı

## ✨ Özellikler

### 🎭 Modern Glassmorphism Tasarım
- **Backdrop blur**: 20px blur + 180% saturation
- **Gradient backgrounds**: Her tip için özel renkli gradient
- **Glow effects**: Renkli gölgeler ve ışıltılar
- **Smooth animations**: Cubic-bezier easing ile akıcı animasyonlar

### 🎨 Renk Paleti

#### ✅ Success (Başarılı)
```css
Gradient: #10b981 → #059669 (Emerald Green)
Shadow: Yeşil glow efekti
Icon: Beyaz check mark + pulse animasyonu
```

#### ❌ Error (Hata)
```css
Gradient: #ef4444 → #dc2626 (Red)
Shadow: Kırmızı glow efekti
Icon: Beyaz X mark + pulse animasyonu
```

#### ℹ️ Info (Bilgi)
```css
Gradient: #3b82f6 → #2563eb (Blue)
Shadow: Mavi glow efekti
Icon: Beyaz info icon + pulse animasyonu
```

#### ⚠️ Warning (Uyarı)
```css
Gradient: #f59e0b → #d97706 (Amber)
Shadow: Turuncu glow efekti
Icon: Beyaz warning icon + pulse animasyonu
```

---

## 🎬 Animasyonlar

### 1. **Slide In** (Giriş)
```
Sağdan sola kayarak giriş
Duration: 300ms
Easing: cubic-bezier(0.16, 1, 0.3, 1)
```

### 2. **Icon Pulse** (İkon Animasyonu)
```
Scale: 0.8 → 1.1 → 1.0
Duration: 400ms
Drop shadow efekti
```

### 3. **Close Button Rotate** (Kapatma Butonu)
```
Hover: Scale 1.1 + 90° rotasyon
Active: Scale 0.95
Radial gradient glow
```

---

## 📐 Boyutlar ve Spacing

```css
Min Width: 380px
Max Width: 480px
Padding: 1.125rem 1.25rem
Border Radius: 1rem (16px)
Gap between toasts: 14px
Icon Size: 1.5rem (24px)
Close Button: 1.75rem (28px)
```

---

## 🎯 Tipografi

```css
Title:
  - Font Size: 15px
  - Font Weight: 600 (Semibold)
  - Letter Spacing: -0.01em
  - Color: White
  - Text Shadow: 0 1px 2px rgba(0,0,0,0.1)

Description:
  - Font Size: 13px
  - Line Height: 1.5
  - Opacity: 0.95
  - Margin Top: 0.25rem
```

---

## 🌓 Dark Mode

Dark mode'da:
- Daha güçlü glow efektleri (0.6 opacity)
- Daha belirgin border (0.2 opacity)
- Daha derin gölgeler

---

## 🧪 Test Senaryoları

### Test 1: Success Toast
```typescript
toast.success('İşlem başarılı!', {
  description: 'Değişiklikler kaydedildi.',
  duration: 5000,
});
```

### Test 2: Error Toast
```typescript
toast.error('Bir hata oluştu!', {
  description: 'Lütfen tekrar deneyin.',
  duration: 5000,
});
```

### Test 3: Info Toast
```typescript
toast.info('Bilgilendirme', {
  description: 'Yeni özellikler eklendi.',
  duration: 5000,
});
```

### Test 4: Warning Toast
```typescript
toast.warning('Dikkat!', {
  description: 'Bu işlem geri alınamaz.',
  duration: 5000,
});
```

### Test 5: Multiple Toasts
```typescript
// Birden fazla toast aynı anda
toast.success('İlk mesaj');
setTimeout(() => toast.error('İkinci mesaj'), 500);
setTimeout(() => toast.info('Üçüncü mesaj'), 1000);
```

### Test 6: With Action Button
```typescript
toast.success('Dosya yüklendi', {
  description: 'Dosyanız başarıyla yüklendi.',
  action: {
    label: 'Görüntüle',
    onClick: () => console.log('Görüntüle tıklandı'),
  },
});
```

---

## 🎨 Tasarım Detayları

### Glassmorphism Efekti
```css
backdrop-filter: blur(20px) saturate(180%)
background: rgba(color, 0.95) + gradient
border: 1px solid rgba(255, 255, 255, 0.2)
```

### Glow Efekti
```css
box-shadow:
  0 20px 60px -15px rgba(color, 0.5),  /* Outer glow */
  0 10px 30px -10px rgba(color, 0.4),  /* Mid glow */
  0 0 0 1px rgba(255, 255, 255, 0.15) inset  /* Inner border */
```

### Gradient Overlay
```css
::before pseudo-element
background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)
```

---

## 🚀 Performans

- **GPU Acceleration**: transform ve opacity kullanımı
- **Will-change**: Animasyonlu elementlerde
- **Contain**: Layout thrashing önleme
- **Debounced animations**: Smooth 60fps

---

## 📱 Responsive

```css
Mobile (< 640px):
  - Min Width: 320px
  - Max Width: calc(100vw - 32px)
  - Padding: 1rem

Tablet (640px - 1024px):
  - Min Width: 360px
  - Max Width: 420px

Desktop (> 1024px):
  - Min Width: 380px
  - Max Width: 480px
```

---

## 🎯 Kullanım Örnekleri

### Kayıt Başarılı
```typescript
toast.success('Hesap oluşturuldu!', {
  description: 'E-posta doğrulama linki gönderildi.',
  duration: 6000,
});
```

### Giriş Hatası
```typescript
toast.error('Giriş başarısız', {
  description: 'E-posta veya şifre hatalı.',
  duration: 5000,
});
```

### Ödeme Onayı
```typescript
toast.success('Ödeme alındı', {
  description: '₺99.00 başarıyla işlendi.',
  action: {
    label: 'Fatura',
    onClick: () => window.open('/invoice'),
  },
});
```

### Dosya Yükleme
```typescript
toast.info('Yükleniyor...', {
  description: 'Dosya işleniyor, lütfen bekleyin.',
  duration: Infinity, // Manuel kapatma
});
```

---

## 🎨 Renk Değişkenleri

Eğer renkleri özelleştirmek isterseniz:

```css
/* Success */
--toast-success-from: #10b981;
--toast-success-to: #059669;

/* Error */
--toast-error-from: #ef4444;
--toast-error-to: #dc2626;

/* Info */
--toast-info-from: #3b82f6;
--toast-info-to: #2563eb;

/* Warning */
--toast-warning-from: #f59e0b;
--toast-warning-to: #d97706;
```

---

## ✅ Kontrol Listesi

- [x] Modern glassmorphism tasarım
- [x] Smooth animasyonlar
- [x] Renkli glow efektleri
- [x] Icon pulse animasyonu
- [x] Close button rotate efekti
- [x] Dark mode desteği
- [x] Responsive tasarım
- [x] Progress bar
- [x] Action buttons
- [x] Site teması ile uyumlu
- [x] Accessibility (ARIA labels)

---

**Tasarım Tamamlandı!** 🎉

Artık bildirimleriniz modern, estetik ve site temanızla mükemmel uyumlu! ✨
