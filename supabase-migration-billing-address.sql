-- ============================================
-- SUPABASE MIGRATION: billing_address Kolonu Kontrolü
-- ============================================
-- Bu script'i Supabase SQL Editor'de çalıştırın
-- ============================================

-- 1. billing_address kolonunun var olup olmadığını kontrol et
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name = 'billing_address';

-- 2. Eğer kolon yoksa ekle
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS billing_address TEXT;

-- 3. Kolonun eklendiğini doğrula
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name = 'billing_address';

-- ============================================
-- ÖNEMLİ NOTLAR:
-- ============================================
-- 1. billing_address kolonu TEXT tipinde olmalı (uzun adresler için)
-- 2. NULL olabilir (isteğe bağlı alan)
-- 3. Bu kolon ödeme bilgileri ekranında kullanılacak
-- ============================================

