-- Tüm Orphaned Profilleri Silme
-- Constraint düzeltildi, artık güvenli

-- 1. Önce hangi kayıtların silineceğini kontrol edin
SELECT 
  up.id,
  up.username,
  up.full_name,
  up.role,
  up.created_at,
  (SELECT COUNT(*) FROM admin_logs WHERE admin_id = up.id) as admin_logs_count,
  CASE 
    WHEN au.id IS NULL THEN '✅ ORPHANED - Will be deleted'
    ELSE '❌ Has auth user - Will NOT be deleted'
  END as status
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.id IS NULL
ORDER BY up.created_at DESC;

-- 2. Toplam sayıyı kontrol edin
SELECT 
  COUNT(*) as total_orphaned_profiles,
  SUM((SELECT COUNT(*) FROM admin_logs WHERE admin_id = up.id)) as total_admin_logs_to_delete
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.id IS NULL;

-- 3. SİL (ON DELETE CASCADE sayesinde admin_logs kayıtları da otomatik silinecek)
DELETE FROM user_profiles 
WHERE id IN (
  SELECT up.id
  FROM user_profiles up
  LEFT JOIN auth.users au ON up.id = au.id
  WHERE au.id IS NULL
);

-- 4. Kontrol edin - tüm orphaned profiller silinmiş olmalı
SELECT 
  COUNT(*) as remaining_orphaned_profiles,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ All orphaned profiles deleted successfully'
    ELSE CONCAT('❌ ', COUNT(*), ' orphaned profiles still exist')
  END as status
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.id IS NULL;

