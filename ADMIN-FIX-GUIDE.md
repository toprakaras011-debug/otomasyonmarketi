# 🔧 Admin Paneli Görünmüyor - Çözüm Rehberi

## Adım 1: Veritabanında Kullanıcıyı Admin Yap

Supabase Dashboard → SQL Editor'e gidin ve şu sorguyu çalıştırın:

```sql
-- 1. Önce kullanıcının mevcut durumunu kontrol et
SELECT 
  au.id as user_id,
  au.email,
  up.username,
  up.role,
  up.is_admin,
  up.is_developer
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'ftnakras01@gmail.com';

-- 2. Eğer kullanıcı bulunduysa, admin yap
UPDATE user_profiles 
SET 
  role = 'admin', 
  is_admin = true,
  updated_at = NOW()
WHERE id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'ftnakras01@gmail.com'
);

-- 3. Eğer user_profiles'da kayıt yoksa, oluştur
INSERT INTO user_profiles (id, username, role, is_admin, created_at, updated_at)
SELECT 
  id,
  COALESCE(
    raw_user_meta_data->>'username',
    split_part(email, '@', 1)
  ) as username,
  'admin' as role,
  true as is_admin,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users
WHERE email = 'ftnakras01@gmail.com'
AND id NOT IN (SELECT id FROM user_profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'ftnakras01@gmail.com'))
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_admin = true,
  updated_at = NOW();

-- 4. Son kontrol - Admin oldu mu?
SELECT 
  au.email,
  up.username,
  up.role,
  up.is_admin,
  CASE 
    WHEN up.role = 'admin' OR up.is_admin = true THEN '✅ ADMIN'
    ELSE '❌ NOT ADMIN'
  END as status
FROM auth.users au
INNER JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'ftnakras01@gmail.com';
```

## Adım 2: Tarayıcıda Kontrol Et

1. **Sayfayı tamamen yenileyin** (Ctrl+F5 veya Cmd+Shift+R)
2. **Çıkış yapıp tekrar giriş yapın**
3. Tarayıcı console'unu açın (F12) ve şunu çalıştırın:

```javascript
// Profil durumunu kontrol et
const { createClient } = await import('/lib/supabase');
const supabase = createClient();

const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', user.id)
  .single();

console.log('Profile:', profile);
console.log('Is Admin:', profile?.role === 'admin' || profile?.is_admin === true);
```

## Adım 3: Cache Temizleme

Eğer hala görünmüyorsa:

1. **Tarayıcı cache'ini temizleyin**
2. **LocalStorage'ı temizleyin** (F12 → Application → Local Storage → Clear)
3. **Sayfayı yenileyin**
4. **Tekrar giriş yapın**

## Adım 4: Manuel Kontrol

Eğer hala çalışmıyorsa, direkt admin paneline gidin:

```
http://localhost:3000/admin/dashboard
```

Eğer erişim yetkiniz yok hatası alırsanız, veritabanı güncellemesi çalışmamış demektir.

## Sorun Giderme

### "Column email does not exist" hatası
- `user_profiles` tablosunda `email` kolonu yok
- `auth.users` tablosu ile JOIN yaparak kontrol edin (yukarıdaki sorgu)

### Profil bulunamıyor
- `INSERT` sorgusunu çalıştırın (Adım 1, sorgu 3)

### Admin yapıldı ama görünmüyor
- Sayfayı yenileyin (Ctrl+F5)
- Çıkış yapıp tekrar giriş yapın
- Tarayıcı cache'ini temizleyin

