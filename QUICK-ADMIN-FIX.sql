-- ⚡ HIZLI ÇÖZÜM: ftnakras01 kullanıcısını admin yap
-- Bu sorguyu Supabase SQL Editor'de çalıştırın

-- 1. Kullanıcıyı admin yap (UUID ile - EN HIZLI)
UPDATE user_profiles 
SET 
  role = 'admin', 
  is_admin = true,
  updated_at = NOW()
WHERE id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

-- 2. Hemen kontrol et
SELECT 
  username,
  role,
  is_admin,
  CASE 
    WHEN role = 'admin' OR is_admin = true THEN '✅ ADMIN - Başarılı!'
    ELSE '❌ Hala admin değil'
  END as durum
FROM user_profiles
WHERE id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

