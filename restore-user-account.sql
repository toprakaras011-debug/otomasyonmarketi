-- ============================================
-- Kullanıcı Hesabını Geri Getirme Scripti
-- ftnakras01@gmail.com için
-- ============================================

-- 1. Önce kullanıcının auth.users tablosunda olup olmadığını kontrol et
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  app_metadata,
  user_metadata
FROM auth.users
WHERE email = 'ftnakras01@gmail.com';

-- 2. Eğer kullanıcı auth.users'da yoksa, yeni bir kullanıcı oluştur
-- NOT: Bu işlem Supabase Dashboard'dan yapılmalı veya auth.users tablosuna direkt insert yapılamaz
-- Bu yüzden önce Supabase Dashboard'dan kullanıcıyı manuel olarak oluşturmanız gerekiyor

-- 3. user_profiles tablosunda kullanıcıyı kontrol et
SELECT 
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
FROM user_profiles
WHERE email = 'ftnakras01@gmail.com' OR id IN (
  SELECT id FROM auth.users WHERE email = 'ftnakras01@gmail.com'
);

-- 4. Eğer user_profiles'da kullanıcı varsa ama geliştirici değilse, geliştirici yap
UPDATE user_profiles
SET 
  is_developer = true,
  developer_approved = true,
  role = 'admin',
  is_admin = true,
  updated_at = NOW()
WHERE email = 'ftnakras01@gmail.com' OR id IN (
  SELECT id FROM auth.users WHERE email = 'ftnakras01@gmail.com'
);

-- 5. Eğer user_profiles'da kullanıcı yoksa ama auth.users'da varsa, profil oluştur
-- Önce auth.users'dan ID'yi al
DO $$
DECLARE
  user_id UUID;
  user_email TEXT;
  user_metadata JSONB;
BEGIN
  -- Kullanıcıyı bul
  SELECT id, email, user_metadata INTO user_id, user_email, user_metadata
  FROM auth.users
  WHERE email = 'ftnakras01@gmail.com'
  LIMIT 1;

  -- Eğer kullanıcı bulunduysa ve profil yoksa
  IF user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = user_id
  ) THEN
    -- Profil oluştur
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
      COALESCE(
        (user_metadata->>'username')::TEXT,
        SPLIT_PART(user_email, '@', 1)
      ),
      COALESCE(
        (user_metadata->>'full_name')::TEXT,
        (user_metadata->>'name')::TEXT,
        'Kullanıcı'
      ),
      user_email,
      true, -- is_developer
      true, -- developer_approved
      'admin', -- role
      true, -- is_admin
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Profil oluşturuldu: %', user_id;
  ELSE
    RAISE NOTICE 'Kullanıcı bulunamadı veya profil zaten var';
  END IF;
END $$;

-- 6. Otomasyonları kontrol et
SELECT 
  a.id,
  a.title,
  a.slug,
  a.status,
  a.user_id,
  up.email,
  up.username,
  a.created_at,
  a.updated_at
FROM automations a
LEFT JOIN user_profiles up ON a.user_id = up.id
WHERE up.email = 'ftnakras01@gmail.com' OR a.user_id IN (
  SELECT id FROM auth.users WHERE email = 'ftnakras01@gmail.com'
)
ORDER BY a.created_at DESC;

-- 7. Son kontrol - kullanıcının tam durumu
SELECT 
  u.id as auth_user_id,
  u.email as auth_email,
  u.email_confirmed_at,
  up.id as profile_id,
  up.username,
  up.full_name,
  up.email as profile_email,
  up.is_developer,
  up.developer_approved,
  up.role,
  up.is_admin,
  (SELECT COUNT(*) FROM automations WHERE user_id = u.id) as automation_count
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'ftnakras01@gmail.com';

