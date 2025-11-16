-- ============================================
-- Kullanıcı Hesabını Tam Olarak Düzeltme Scripti
-- ftnakras01@gmail.com için
-- ============================================

-- Bu script, kullanıcının:
-- 1. Geliştirici paneline erişimini sağlar
-- 2. Admin yetkilerini geri getirir
-- 3. Profil bilgilerini düzeltir
-- 4. Otomasyonlarını kontrol eder

-- ADIM 1: Kullanıcıyı bul ve profil durumunu kontrol et
DO $$
DECLARE
  user_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Kullanıcıyı auth.users'dan bul
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'ftnakras01@gmail.com'
  LIMIT 1;

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Kullanıcı auth.users tablosunda bulunamadı. Önce Supabase Dashboard''dan kullanıcıyı oluşturun.';
  END IF;

  -- Profil var mı kontrol et
  SELECT EXISTS(SELECT 1 FROM user_profiles WHERE id = user_id) INTO profile_exists;

  -- Profil yoksa oluştur
  IF NOT profile_exists THEN
    INSERT INTO user_profiles (
      id,
      username,
      full_name,
      email,
      is_developer,
      developer_approved,
      role,
      is_admin,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      'ftnakras01',
      'Kullanıcı',
      'ftnakras01@gmail.com',
      true,  -- is_developer
      true,  -- developer_approved
      'admin',  -- role
      true,  -- is_admin
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Profil oluşturuldu: %', user_id;
  ELSE
    RAISE NOTICE 'Profil zaten var, güncelleniyor...';
  END IF;

  -- Profili güncelle - geliştirici ve admin yap
  UPDATE user_profiles
  SET 
    is_developer = true,
    developer_approved = true,
    role = 'admin',
    is_admin = true,
    email = 'ftnakras01@gmail.com',
    updated_at = NOW()
  WHERE id = user_id;

  RAISE NOTICE 'Profil güncellendi: %', user_id;
  RAISE NOTICE 'Geliştirici paneli aktif edildi';
  RAISE NOTICE 'Admin yetkileri geri getirildi';

END $$;

-- ADIM 2: Otomasyonları kontrol et ve say
SELECT 
  COUNT(*) as total_automations,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count
FROM automations
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'ftnakras01@gmail.com'
);

-- ADIM 3: Son durum raporu
SELECT 
  'Kullanıcı Durumu' as check_type,
  u.id as user_id,
  u.email,
  CASE WHEN u.email_confirmed_at IS NOT NULL THEN 'E-posta Onaylı' ELSE 'E-posta Onaysız' END as email_status,
  up.username,
  up.full_name,
  CASE WHEN up.is_developer THEN 'Evet' ELSE 'Hayır' END as is_developer,
  CASE WHEN up.developer_approved THEN 'Onaylı' ELSE 'Onaysız' END as developer_status,
  up.role,
  CASE WHEN up.is_admin THEN 'Admin' ELSE 'Kullanıcı' END as admin_status,
  (SELECT COUNT(*) FROM automations WHERE user_id = u.id) as automation_count
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'ftnakras01@gmail.com';

