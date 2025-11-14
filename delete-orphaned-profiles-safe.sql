-- Orphaned Profilleri Güvenli Şekilde Silme
-- Foreign key constraint düzeltildikten sonra kullanın

-- 1. Önce hangi kayıtların silineceğini kontrol edin
SELECT 
  up.id,
  up.username,
  up.full_name,
  up.role,
  up.created_at,
  'ORPHANED - Will be deleted' as status,
  (SELECT COUNT(*) FROM admin_logs WHERE admin_id = up.id) as admin_logs_count
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.id IS NULL;

-- 2. Admin_logs'ta referansı olan kayıtları kontrol edin
SELECT 
  up.id,
  up.username,
  COUNT(al.id) as admin_logs_count
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
LEFT JOIN admin_logs al ON al.admin_id = up.id
WHERE au.id IS NULL
GROUP BY up.id, up.username
HAVING COUNT(al.id) > 0;

-- 3. Foreign key constraint'i düzeltin (fix-admin-logs-foreign-key.sql dosyasını çalıştırın)
-- Bu adımı önce yapmalısınız!

-- 4. Artık güvenli şekilde silebilirsiniz
-- ON DELETE CASCADE sayesinde admin_logs'taki kayıtlar da otomatik silinecek
DELETE FROM user_profiles 
WHERE id IN (
  SELECT up.id
  FROM user_profiles up
  LEFT JOIN auth.users au ON up.id = au.id
  WHERE au.id IS NULL
);

-- 5. Silinen kayıt sayısını kontrol edin
-- (Yukarıdaki DELETE sorgusu çalıştıktan sonra bu sorgu 0 döndürmeli)
SELECT COUNT(*) as remaining_orphaned_profiles
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.id IS NULL;

