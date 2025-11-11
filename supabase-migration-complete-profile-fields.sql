-- ============================================
-- SUPABASE MIGRATION: Tüm Profil ve Ödeme Kolonları
-- ============================================
-- Bu script'i Supabase SQL Editor'de çalıştırın
-- ============================================

-- 1. Profil bilgileri kolonları (city, district, postal_code)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(5);

-- 2. Ödeme bilgileri kolonları
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS tc_no VARCHAR(11),
ADD COLUMN IF NOT EXISTS tax_office TEXT,
ADD COLUMN IF NOT EXISTS iban VARCHAR(34),
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS billing_address TEXT;

-- 3. Kolonların eklendiğini doğrula
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name IN (
    'city',
    'district',
    'postal_code',
    'company_name',
    'tc_no',
    'tax_office',
    'iban',
    'bank_name',
    'billing_address'
  )
ORDER BY column_name;

-- ============================================
-- ÖNEMLİ NOTLAR:
-- ============================================
-- 1. city, district: TEXT tipinde (uzun isimler için)
-- 2. postal_code: VARCHAR(5) - 5 haneli posta kodu
-- 3. tc_no: VARCHAR(11) - 11 haneli TC kimlik no
-- 4. iban: VARCHAR(34) - IBAN maksimum uzunluk
-- 5. company_name, tax_office, bank_name, billing_address: TEXT
-- 6. Tüm kolonlar NULL olabilir (isteğe bağlı alanlar)
-- ============================================

