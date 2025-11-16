-- Orphaned Profile Silme - Constraint Düzeltildi, Artık Güvenli
-- ID: fe1f19d5-b201-4754-a900-88500fa8cc52

-- 1. Önce hangi kayıtların silineceğini kontrol edin
SELECT 
  up.id,
  up.username,
  up.full_name,
  up.role,
  up.created_at,
  (SELECT COUNT(*) FROM admin_logs WHERE admin_id = up.id) as admin_logs_count,
  CASE 
    WHEN au.id IS NULL THEN '✅ ORPHANED - Will be deleted (admin_logs will also be deleted)'
    ELSE '❌ Has auth user - Will NOT be deleted'
  END as status
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE up.id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

-- 2. Admin_logs'taki referansları kontrol edin (bunlar da silinecek)
SELECT 
  al.id,
  al.admin_id,
  al.action,
  al.created_at,
  'Will be deleted due to CASCADE' as note
FROM admin_logs al
WHERE al.admin_id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

-- 3. SİL (ON DELETE CASCADE sayesinde admin_logs kayıtları da otomatik silinecek)
DELETE FROM user_profiles 
WHERE id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

-- 4. Kontrol edin - kayıt silinmiş olmalı
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Successfully deleted'
    ELSE '❌ Still exists'
  END as deletion_status
FROM user_profiles 
WHERE id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

-- Admin_logs'taki kayıtlar da silinmiş olmalı
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Admin logs also deleted (CASCADE worked)'
    ELSE '❌ Admin logs still exist'
  END as admin_logs_status
FROM admin_logs 
WHERE admin_id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

