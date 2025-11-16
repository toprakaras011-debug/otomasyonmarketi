-- Belirli bir orphaned profile'ı silmek için
-- ID: fe1f19d5-b201-4754-a900-88500fa8cc52

-- 1. ÖNCE: Foreign key constraint'i düzeltin
-- fix-admin-logs-foreign-key-complete.sql dosyasını çalıştırın!

-- 2. Hangi kayıtların silineceğini kontrol edin
SELECT 
  up.id,
  up.username,
  up.full_name,
  up.role,
  up.created_at,
  (SELECT COUNT(*) FROM admin_logs WHERE admin_id = up.id) as admin_logs_count,
  CASE 
    WHEN au.id IS NULL THEN 'ORPHANED - Will be deleted'
    ELSE 'OK - Has auth user'
  END as status
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE up.id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

-- 3. Admin_logs'taki referansları kontrol edin
SELECT 
  al.id,
  al.admin_id,
  al.action,
  al.created_at
FROM admin_logs al
WHERE al.admin_id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

-- 4. Foreign key constraint düzeltildikten sonra silebilirsiniz
-- ON DELETE CASCADE sayesinde admin_logs'taki kayıtlar da otomatik silinecek
DELETE FROM user_profiles 
WHERE id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

-- 5. Kontrol edin - kayıt silinmiş olmalı
SELECT COUNT(*) as remaining
FROM user_profiles 
WHERE id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

-- Admin_logs'taki kayıtlar da silinmiş olmalı
SELECT COUNT(*) as remaining_logs
FROM admin_logs 
WHERE admin_id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

