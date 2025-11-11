# Supabase RLS Policy Kontrol Listesi

## 🔍 Admin Hesabı İçin Kontrol Edilmesi Gerekenler

### 1. `user_profiles` Tablosu RLS Policies

#### ✅ Kontrol Et:
```sql
-- Supabase Dashboard > Authentication > Policies > user_profiles tablosu

-- Policy 1: Kullanıcılar kendi profillerini görebilmeli
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Kullanıcılar kendi profillerini güncelleyebilmeli
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy 3: ✅ ÖNEMLİ - Admin hesapları TÜM profilleri görebilmeli
CREATE POLICY "Admins can view all profiles"
ON user_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role = 'admin')
  )
);

-- Policy 4: ✅ ÖNEMLİ - Admin hesapları kendi profilini her zaman görebilmeli
CREATE POLICY "Admins can always view own profile"
ON user_profiles
FOR SELECT
USING (
  auth.uid() = id
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role = 'admin')
  )
);
```

### 2. RLS (Row Level Security) Aktif mi?

#### ✅ Kontrol Et:
```sql
-- Supabase Dashboard > Table Editor > user_profiles > Settings
-- "Enable Row Level Security" checkbox'ı işaretli olmalı
```

### 3. `user_profiles` Tablosu Yapısı

#### ✅ Kontrol Et:
```sql
-- Supabase Dashboard > Table Editor > user_profiles

-- Gerekli kolonlar:
- id (uuid, primary key, references auth.users(id))
- username (text)
- avatar_url (text, nullable)
- role (text, nullable) -- 'admin', 'user', 'developer' gibi
- is_admin (boolean, default false)
- is_developer (boolean, default false)
- developer_approved (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)
```

### 4. Auth Users ile user_profiles Senkronizasyonu

#### ✅ Kontrol Et:
```sql
-- Trigger oluşturulmalı (eğer yoksa):

-- Trigger: Yeni kullanıcı kaydolduğunda otomatik profile oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı bağla
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5. Admin Hesabı Oluşturma

#### ✅ Supabase Dashboard'da Yapılacaklar:

1. **Auth Users Tablosunda:**
   - Admin kullanıcısının email'ini bul
   - User ID'sini kopyala

2. **user_profiles Tablosunda:**
   ```sql
   -- Admin hesabını güncelle
   UPDATE user_profiles
   SET 
     is_admin = true,
     role = 'admin',
     updated_at = NOW()
   WHERE id = 'ADMIN_USER_ID_BURAYA';
   ```

3. **Veya SQL Editor'de:**
   ```sql
   -- Email ile admin yap
   UPDATE user_profiles
   SET 
     is_admin = true,
     role = 'admin',
     updated_at = NOW()
   WHERE id IN (
     SELECT id FROM auth.users
     WHERE email = 'admin@example.com'
   );
   ```

### 6. Test Queries

#### ✅ Supabase SQL Editor'de Test Et:

```sql
-- 1. Admin hesabının kendi profilini görebildiğini test et
SELECT * FROM user_profiles
WHERE id = auth.uid();

-- 2. Admin hesabının is_admin değerini kontrol et
SELECT id, username, is_admin, role
FROM user_profiles
WHERE id = auth.uid();

-- 3. Tüm profilleri görebildiğini test et (sadece admin için)
SELECT COUNT(*) FROM user_profiles;
```

### 7. Service Role Key Kullanımı

#### ⚠️ Dikkat:
- Server-side işlemler için `SUPABASE_SERVICE_ROLE_KEY` kullanılıyor
- Bu key RLS'yi bypass eder
- Client-side'da `NEXT_PUBLIC_SUPABASE_ANON_KEY` kullanılıyor
- Admin hesapları için client-side'da da çalışması gerekiyor

### 8. Olası Sorunlar ve Çözümler

#### ❌ Sorun 1: "Profile not found"
**Çözüm:**
- RLS policy'de admin kontrolü eksik olabilir
- `is_admin` veya `role` kolonu NULL olabilir
- Policy'de `OR` yerine `AND` kullanılmış olabilir

#### ❌ Sorun 2: "Permission denied"
**Çözüm:**
- RLS aktif ama policy yok
- Policy'de `auth.uid()` kontrolü yanlış
- Admin policy'si eksik

#### ❌ Sorun 3: "Session exists but profile is null"
**Çözüm:**
- Profile tablosunda kayıt yok
- Trigger çalışmamış
- Manuel profile oluşturulması gerekiyor

### 9. Hızlı Kontrol Script'i

#### ✅ Supabase SQL Editor'de Çalıştır:

```sql
-- Tüm admin hesaplarını listele
SELECT 
  u.id,
  u.email,
  p.username,
  p.is_admin,
  p.role,
  p.created_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.is_admin = true OR p.role = 'admin';

-- Admin hesabının RLS policy'lerini test et
SET ROLE authenticated;
SELECT * FROM user_profiles WHERE id = 'ADMIN_USER_ID';
```

### 10. Önerilen RLS Policy Yapısı

```sql
-- 1. Herkes kendi profilini görebilir
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

-- 2. Admin'ler tüm profilleri görebilir
CREATE POLICY "Admins can view all profiles"
ON user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND (up.is_admin = true OR up.role = 'admin')
  )
);

-- 3. Herkes kendi profilini güncelleyebilir
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Admin'ler tüm profilleri güncelleyebilir
CREATE POLICY "Admins can update all profiles"
ON user_profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND (up.is_admin = true OR up.role = 'admin')
  )
);
```

## 🚀 Hızlı Düzeltme Adımları

1. **Supabase Dashboard'a git**
2. **Table Editor > user_profiles > Policies**
3. **Yukarıdaki policy'leri oluştur**
4. **Admin hesabını güncelle:**
   ```sql
   UPDATE user_profiles
   SET is_admin = true, role = 'admin'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
   ```
5. **Test et:**
   ```sql
   SELECT * FROM user_profiles WHERE id = auth.uid();
   ```

