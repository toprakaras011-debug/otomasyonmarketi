# 🔍 DETAYLI DEBUG RAPORU

## 📋 İçindekiler
1. [Giriş (Signin) Debug Logları](#giriş-signin-debug-logları)
2. [Kayıt (Signup) Debug Logları](#kayıt-signup-debug-logları)
3. [Genel Debug Kontrolü](#genel-debug-kontrolü)

---

## 🔐 Giriş (Signin) Debug Logları

### Dosya: `app/auth/signin/page.tsx`

#### 1. Form Submit Başlangıcı
```javascript
[DEBUG] signin/page.tsx - handleSubmit START
{
  hasEmail: boolean,
  hasPassword: boolean,
  emailLength: number,
  passwordLength: number,
  redirectTo: string,
  isFromCart: boolean,
  hasTurnstileToken: boolean,
  hasTurnstileSiteKey: boolean,
  loading: boolean,
  oauthLoading: string | null
}
```

#### 2. Validasyon Kontrolleri
- ✅ Email boş kontrolü
- ✅ Şifre boş kontrolü
- ✅ Email format kontrolü
- ✅ Turnstile token kontrolü

#### 3. SignIn Fonksiyonu Çağrısı
```javascript
[DEBUG] signin/page.tsx - Calling signIn function
{
  normalizedEmail: string,
  passwordLength: number,
  redirectTo: string
}
```

#### 4. SignIn Fonksiyonu Dönüşü
```javascript
[DEBUG] signin/page.tsx - signIn function returned
{
  hasResult: boolean,
  hasUser: boolean,
  userId: string,
  userEmail: string,
  hasSession: boolean,
  emailConfirmed: boolean,
  provider: string
}
```

#### 5. Profile Fetch
```javascript
[DEBUG] signin/page.tsx - Fetching user profile
[DEBUG] signin/page.tsx - Profile fetch result
{
  hasProfile: boolean,
  profileError: object | null,
  role: string,
  isAdmin: boolean
}
```

#### 6. Redirect Belirleme
```javascript
[DEBUG] signin/page.tsx - User is admin/normal, redirecting to...
[DEBUG] signin/page.tsx - Scheduling redirect
[DEBUG] signin/page.tsx - Executing redirect
```

#### 7. OAuth Butonlar
- Google OAuth button click
- GitHub OAuth button click
- OAuth function calls
- OAuth errors

---

## 📝 Kayıt (Signup) Debug Logları

### Dosya: `app/auth/signup/page.tsx`

#### 1. Form Submit Başlangıcı
```javascript
[DEBUG] signup/page.tsx - handleSubmit validation passed
[DEBUG] signup/page.tsx - handleSubmit calling signUp
{
  normalizedEmail: string,
  username: string,
  usernameLength: number,
  passwordLength: number,
  fullName: string | undefined,
  phone: string | undefined,
  role: 'user' | 'developer',
  hasTurnstileToken: boolean
}
```

#### 2. SignUp Fonksiyonu Dönüşü
```javascript
[DEBUG] signup/page.tsx - handleSubmit signUp returned
{
  hasResult: boolean,
  hasUser: boolean,
  hasSession: boolean,
  userId: string,
  userEmail: string,
  emailConfirmed: boolean
}
```

#### 3. Session Kontrolü
```javascript
[DEBUG] signup/page.tsx - handleSubmit waiting for session (500ms)
[DEBUG] signup/page.tsx - handleSubmit checking if user is logged in
[DEBUG] signup/page.tsx - handleSubmit getUser result
{
  hasUser: boolean,
  userId: string,
  userEmail: string,
  getUserError: object | null
}
```

#### 4. Profile Kontrolü ve Redirect
```javascript
[DEBUG] signup/page.tsx - handleSubmit user is logged in, fetching profile
[DEBUG] signup/page.tsx - handleSubmit profile fetch result
{
  hasProfile: boolean,
  profileRole: string,
  profileIsAdmin: boolean,
  profileError: object | null
}
```

#### 5. Email Verification Redirect
```javascript
[DEBUG] signup/page.tsx - handleSubmit user not logged in, redirecting to verify-email
[DEBUG] signup/page.tsx - handleSubmit redirecting to verify-email
{
  email: string
}
```

---

## 🔧 Genel Debug Kontrolü

### Dosya: `lib/auth.ts`

#### 1. SignIn Fonksiyonu
```javascript
[DEBUG] lib/auth.ts - signIn START
[DEBUG] lib/auth.ts - signIn normalized email
[DEBUG] lib/auth.ts - signIn calling supabase.auth.signInWithPassword
[DEBUG] lib/auth.ts - signIn supabase response
[DEBUG] lib/auth.ts - signIn email verification check
[DEBUG] lib/auth.ts - signIn waiting for session to be established
[DEBUG] lib/auth.ts - signIn SUCCESS
```

#### 2. SignUp Fonksiyonu
```javascript
[DEBUG] lib/auth.ts - signUp START
[DEBUG] lib/auth.ts - signUp normalized values
[DEBUG] lib/auth.ts - signUp calling supabase.auth.signUp
[DEBUG] lib/auth.ts - signUp supabase response
[DEBUG] lib/auth.ts - signUp waiting for session to be established
[DEBUG] lib/auth.ts - signUp checking session
[DEBUG] lib/auth.ts - signUp creating profile
[DEBUG] lib/auth.ts - signUp profile creation result
```

#### 3. OAuth Fonksiyonları
```javascript
[DEBUG] lib/auth.ts - signInWithGoogle START
[DEBUG] lib/auth.ts - signInWithGoogle clearing existing session
[DEBUG] lib/auth.ts - signInWithGoogle calling supabase.auth.signInWithOAuth
[DEBUG] lib/auth.ts - signInWithGoogle supabase response
[DEBUG] lib/auth.ts - signInWithGoogle SUCCESS

[DEBUG] lib/auth.ts - signInWithGithub START
[DEBUG] lib/auth.ts - signInWithGithub calling supabase.auth.signInWithOAuth
[DEBUG] lib/auth.ts - signInWithGithub supabase response
[DEBUG] lib/auth.ts - signInWithGithub SUCCESS
```

### Dosya: `middleware.ts`

```javascript
[DEBUG] middleware.ts - Checking reset-password route
[DEBUG] middleware.ts - OAuth error detected, redirecting to signin
[DEBUG] middleware.ts - Supabase environment variables not set
```

### Dosya: `components/auth-provider.tsx`

```javascript
[DEBUG] auth-provider.tsx - Profile fetch error
```

---

## 📊 Debug Log Formatı

Tüm debug logları şu formatta:

```
[DEBUG] {dosya-adı} - {fonksiyon/adım} {durum}
{
  // Detaylı bilgiler
}
```

### Log Seviyeleri
- `[DEBUG]` - Bilgilendirme logları
- `console.warn` - Uyarı logları
- `console.error` - Hata logları

---

## 🎯 Kullanım

Browser console'u açarak tüm debug loglarını görebilirsiniz:

1. **Chrome/Edge**: `F12` → `Console` sekmesi
2. **Firefox**: `F12` → `Console` sekmesi
3. **Safari**: `Cmd+Option+I` → `Console` sekmesi

### Filtreleme
Console'da `[DEBUG]` yazarak sadece debug loglarını görebilirsiniz.

---

## ✅ Test Senaryoları

### 1. Giriş Testi
- ✅ Email/password girişi
- ✅ Google OAuth girişi
- ✅ GitHub OAuth girişi
- ✅ Admin kullanıcı girişi
- ✅ Normal kullanıcı girişi
- ✅ Email doğrulanmamış kullanıcı

### 2. Kayıt Testi
- ✅ Email/password kayıt
- ✅ Google OAuth kayıt
- ✅ GitHub OAuth kayıt
- ✅ Developer hesabı kayıt
- ✅ Normal hesap kayıt
- ✅ Email verification redirect

### 3. Hata Senaryoları
- ✅ Geçersiz email formatı
- ✅ Geçersiz şifre
- ✅ Zaten kayıtlı email
- ✅ Zaten kullanılan username
- ✅ 401 Unauthorized
- ✅ RLS policy violation
- ✅ Profile creation error

---

## 🔍 Önemli Kontrol Noktaları

1. **Session Yönetimi**
   - Session kurulma kontrolü
   - Session timeout kontrolü
   - Session refresh kontrolü

2. **Profile Yönetimi**
   - Profile oluşturma kontrolü
   - Profile fetch kontrolü
   - Admin role kontrolü

3. **OAuth Akışı**
   - OAuth redirect kontrolü
   - OAuth callback kontrolü
   - OAuth error handling

4. **Email Verification**
   - Email doğrulama kontrolü
   - OAuth kullanıcıları bypass kontrolü
   - Email verification redirect kontrolü

5. **Error Handling**
   - Hata mesajları kontrolü
   - Hata loglama kontrolü
   - Kullanıcı dostu mesajlar kontrolü

---

## 📝 Notlar

- Tüm debug logları production'da da çalışır (performans etkisi minimal)
- Stack trace'ler sadece development modunda gösterilir
- Hassas bilgiler (şifreler, tokenlar) loglanmaz
- Tüm loglar browser console'unda görülebilir

