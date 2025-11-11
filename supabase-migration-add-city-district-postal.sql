-- ============================================
-- SUPABASE MIGRATION: İl, İlçe ve Posta Kodu Kolonları
-- ============================================
-- Bu script'i Supabase SQL Editor'de çalıştırın
-- ============================================

-- 1. İl kolonu ekle
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS city TEXT;

-- 2. İlçe kolonu ekle
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS district TEXT;

-- 3. Posta kodu kolonu ekle
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(5);

-- 4. İndeks ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_user_profiles_city ON user_profiles(city);
CREATE INDEX IF NOT EXISTS idx_user_profiles_district ON user_profiles(district);

-- 5. Kontrol: Kolonların eklendiğini doğrula
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name IN ('city', 'district', 'postal_code')
ORDER BY column_name;

-- ============================================
-- ÖNEMLİ NOTLAR:
-- ============================================
-- 1. Bu migration'ı çalıştırdıktan sonra mevcut kayıtlar NULL değerlerle başlayacak
-- 2. Kullanıcılar profil sayfasından bu bilgileri doldurabilir
-- 3. Posta kodu 5 karakter ile sınırlıdır (Türkiye standartı)
-- ============================================

